// Removes invisible/control characters (a common place to hide injected
// instructions) and normalises whitespace. Returns how many invisible
// characters were stripped so the security scan can report it.

const INVISIBLE = /[\u200B-\u200D\u2060\uFEFF\u00AD\u202A-\u202E\u2066-\u2069]/g;
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanText(input) {
  const invisibleCount = (input.match(INVISIBLE) || []).length;

  const text = input
    .normalize("NFKC")
    .replace(INVISIBLE, "")
    .replace(CONTROL, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { text, invisibleCount };
}