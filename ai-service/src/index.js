import { parseResume } from "./parsing/parseResume.js";
import { cleanText } from "./parsing/cleanText.js";
import { scanForInjection } from "./security/injectionScan.js";

export { ResumeParseError, MAX_FILE_BYTES } from "./parsing/parseResume.js";

/**
 * Phase 1 pipeline: file -> parsed text -> cleaned -> security-scanned.
 * `text` is the sanitised text that is safe to hand to the LLM in Phase 2.
 */
export async function processResumeFile(buffer, filename, options = {}) {
  const parsed = await parseResume(buffer, filename, options);
  const { text: cleaned, invisibleCount } = cleanText(parsed.text);
  const scan = scanForInjection(cleaned, { invisibleCount });

  return {
    fileType: parsed.fileType,
    pageCount: parsed.pageCount,
    wordCount: scan.sanitizedText.split(/\s+/).filter(Boolean).length,
    text: scan.sanitizedText,
    security: {
      riskLevel: scan.riskLevel,
      findings: scan.findings,
      invisibleCount,
    },
  };
}