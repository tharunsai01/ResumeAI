import assert from 'node:assert/strict';
import { test } from 'node:test';
import { aiScreeningSchema } from '../src/services/ai/types';

const validScreening = {
  overallScore: 78,
  skillsScore: 75,
  experienceScore: 82,
  educationScore: 80,
  recommendation: 'potential_match',
  matchedRequirements: ['TypeScript'],
  missingRequirements: [],
  strengths: [],
  gaps: [],
  explanation: 'Relevant experience',
  actionableSuggestions: [],
};

test('screening output accepts the expected shape', () => {
  assert.equal(aiScreeningSchema.parse(validScreening).overallScore, 78);
});

test('screening output rejects an out-of-range score and unexpected fields', () => {
  assert.equal(aiScreeningSchema.safeParse({ ...validScreening, overallScore: 150 }).success, false);
  assert.equal(aiScreeningSchema.safeParse({ ...validScreening, unknownField: true }).success, false);
});

test('screening output rejects malformed or incomplete data', () => {
  assert.equal(aiScreeningSchema.safeParse('not an object').success, false);
  assert.equal(aiScreeningSchema.safeParse({ overallScore: 78 }).success, false);
});
