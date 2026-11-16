// Resume text is UNTRUSTED input. This scan looks for instruction-like content
// aimed at an AI (not at a human reader). It never rejects the resume: it
// flags it, redacts the offending lines from the text that goes to the LLM,
// and reports findings so the recruiter/admin can see them.

const REDACTION = "[REMOVED: instruction-like content]";

const RULES = [
  {
    id: "override-instructions",
    severity: "high",
    re: /\b(ignore|disregard|forget|override)\b[^.\n]{0,40}\b(previous|prior|above|earlier|all|any)\b[^.\n]{0,40}\b(instructions?|prompts?|rules?|directions?)\b/i,
  },
  {
    id: "role-hijack",
    severity: "high",
    re: /\b(you are now|pretend to be|from now on,? you)\b|\bact as (an?|the)\s+(ai|assistant|recruiter|hiring|evaluator|screening|system)\b/i,
  },
  {
    id: "system-prompt-reference",
    severity: "high",
    re: /\b(system prompt|developer message|system message)\b/i,
  },
  {
    id: "score-manipulation",
    severity: "high",
    re: /\b(give|assign|rate|score|rank)\b[^.\n]{0,50}\b(this|the)\s+(candidate|resume|applicant)\b[^.\n]{0,50}\b(highest|top|first|100|perfect|maximum|best)\b/i,
  },
  {
    id: "hire-directive",
    severity: "high",
    re: /\b(hire|shortlist|select|recommend)\s+(this|the)\s+(candidate|applicant|person)\b/i,
  },
  {
    id: "chat-markup",
    severity: "high",
    re: /(<\/?(system|assistant|user)>|\[\/?(system|inst|assistant)\]|<\|im_(start|end)\|>)/i,
  },
  {
    id: "output-directive",
    severity: "medium",
    re: /\b(respond|reply|output|return)\s+(only|with|exactly)\b/i,
  },
  {
    id: "concealment",
    severity: "medium",
    re: /\bdo not (mention|tell|reveal|disclose)\b/i,
  },
];

export function scanForInjection(text, { invisibleCount = 0 } = {}) {
  const lines = text.split("\n");
  const findings = [];
  const flaggedLines = new Set();

  lines.forEach((line, index) => {
    for (const rule of RULES) {
      if (rule.re.test(line)) {
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          line: index + 1,
          excerpt: line.trim().slice(0, 120),
        });
        flaggedLines.add(index);
      }
    }
  });

  if (invisibleCount >= 3) {
    findings.push({
      rule: "invisible-characters",
      severity: "medium",
      line: 0,
      excerpt: `${invisibleCount} invisible/zero-width characters were removed`,
    });
  }

  const sanitizedText = lines.map((line, i) => (flaggedLines.has(i) ? REDACTION : line)).join("\n");

  let riskLevel = "clean";
  if (findings.some((f) => f.severity === "high")) riskLevel = "high";
  else if (findings.length > 0) riskLevel = "suspicious";

  return { riskLevel, findings, sanitizedText };
}