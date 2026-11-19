// Best-effort removal of identifying details from free text.

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const digitCount = (s) => (s.match(/\d/g) || []).length;

function collectTerms({ name, location, companies = [], institutions = [] }) {
  const terms = new Set();
  const add = (value, minLength = 2) => {
    const term = String(value ?? "").trim();
    if (term.length >= minLength) terms.add(term);
  };

  add(name);
  for (const part of String(name ?? "").split(/\s+/)) add(part, 3);
  add(location);
  for (const part of String(location ?? "").split(/[,/]/)) add(part, 3);
  for (const company of companies) add(company);
  for (const institution of institutions) add(institution);

  return [...terms].sort((a, b) => b.length - a.length); // longest first
}

/**
 * Replaces emails, phone numbers, profile links and the given names/places/organisations.
 * entities: { name, location, companies: [], institutions: [] }
 */
export function redactText(text, entities = {}) {
  let out = String(text ?? "");

  out = out.replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, "[email]");
  out = out.replace(/\b(?:https?:\/\/|www\.)\S+/gi, "[link]");
  out = out.replace(/\b(?:linkedin|github|gitlab|twitter|facebook|instagram|behance)\.com\/\S*/gi, "[link]");
  out = out.replace(/\+?\d[\d\s().-]{8,}\d/g, (match) => (digitCount(match) >= 10 ? "[phone]" : match));

  for (const term of collectTerms(entities)) {
    out = out.replace(new RegExp(`(?<![A-Za-z0-9])${escapeRegex(term)}(?![A-Za-z0-9])`, "gi"), "[redacted]");
  }
  return out;
}