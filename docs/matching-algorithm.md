# Matching algorithm

```
Overall = Skills × 0.50 + Experience × 0.20 + Education × 0.10 + Role × 0.20
```

Every component is a number from 0 to 100. The overall score is rounded to two decimals.

| Category | Range |
|---|---|
| Strong Match | 80 to 100 |
| Potential Match | 60 to 79.99 |
| Low Match | below 60 |

The weights live in `ai-service/app/matching/scorer.py` (`WEIGHTS`) and `backend/src/constants/index.ts` (`MATCH_WEIGHTS`, frozen). The API exposes them read-only on the screening settings endpoint (`weightsEditable: false`). No setting, prompt or document can change them.

## Skills (50%)

Each required and preferred skill is normalised through the taxonomy (`ai-service/app/data/skills.json`, plus approved admin additions sent with each request) and classified:

| Match type | Example | Credit |
|---|---|---|
| exact | job asks for Node.js, candidate lists Node.js | 1.0 |
| alias | job asks for React, candidate lists ReactJS | 1.0 |
| related | job asks for Kubernetes, candidate lists Docker | 0.5 |
| missing | no exact, alias or related skill | 0 |

`required = mean(credits of required skills) × 100`, likewise `preferred`.

- Both lists present: `skills = 0.8 × required + 0.2 × preferred`
- Only one list: that list's score
- Neither: 100 (the job states no skill requirement)

When several related skills could bridge a gap, the one in the same taxonomy category is shown first (Vue.js for React rather than TypeScript).

## Experience (20%)

```
total_ratio    = min(1, total_years / required_years)
relevant_ratio = min(1, relevant_years / required_years)
experience     = (0.7 × total_ratio + 0.3 × relevant_ratio) × 100
```

`relevant_years` counts months in roles whose title has a calibrated semantic similarity of at least 50 to the job title. With no minimum requirement the score is 100. Extra experience is never penalised.

## Education (10%)

Levels: 0 not specified, 1 high school, 2 associate/diploma, 3 bachelor's, 4 master's, 5 doctorate.

| Situation | Score |
|---|---|
| Job has no requirement | 100 |
| Candidate meets or exceeds the level | 100 |
| Candidate did not state education, requirement optional | 100 (not penalised) |
| Candidate did not state education, requirement strict | 50, plus a gap asking the recruiter to verify |
| Below the level | 100 − 25 per level short (floor 60 when optional) |

## Role (20%)

Semantic similarity with `all-MiniLM-L6-v2` sentence embeddings:

```
role = 0.5 × best_title_similarity + 0.5 × profile_similarity
```

- *Title similarity*: the best match between the job title and the candidate's headline or past titles.
- *Profile similarity*: candidate text (headline, titles, sorted skills) against job text (title, first 1,200 characters of the description, sorted required skills).

Cosine similarity is mapped onto 0 to 100 using each encoder's typical range (MiniLM 0.15 to 0.75; TF-IDF fallback 0.03 to 0.55). If MiniLM is unavailable, a TF-IDF word and character n-gram cosine is used and every result reports `embedding_backend: "tfidf-fallback"`.

Fairness choices in the role text:

- The free-text summary is excluded, because it is where names, pronouns and ages tend to appear.
- Headlines and titles pass through a scrubber that removes gendered, age, marital and religious terms.
- Skills are de-duplicated, lower-cased and sorted, so list order or casing cannot move the score. The fairness benchmark caught this case during development.

## Output

Every result contains `overall_score`, `category`, the four `components`, `weights`, `matched_skills`, `related_skills`, `missing_skills`, `strengths`, `gaps`, a deterministic `explanation`, `recommendations`, `details` per component, `model_version`, `embedding_backend`, `llm_used`, `timestamp` and `validated`.

## Validation

1. The AI service runs `validate_result()`: four components in range, overall equal to the weighted sum within 0.011, category consistent with the score.
2. The backend runs `verifyOfficialScore()` independently before saving. A result that fails either check is rejected with `502 SCORE_VALIDATION_FAILED` and never stored.

## Worked example

Job: Senior Full-Stack Engineer, required React, Node.js, TypeScript, MongoDB; preferred Docker, Kubernetes; 5+ years; bachelor's preferred.
Candidate: ReactJS, Node.js, MongoDB, TypeScript, Docker; 6 years; bachelor's.

| Component | Calculation | Score | Weighted |
|---|---|---|---|
| Skills | required 4/4 = 100; preferred Docker 1.0 + Kubernetes related 0.5 = 75; 0.8×100 + 0.2×75 | 95 | 47.5 |
| Experience | 6 ≥ 5 on both ratios | 100 | 20 |
| Education | bachelor's meets bachelor's | 100 | 10 |
| Role | MiniLM, example value | 84 | 16.8 |
| **Overall** | | **94.3** | Strong Match |

This exact case is covered by `ai-service/tests/test_matching.py::test_strong_candidate_scores_high_and_validates`.
