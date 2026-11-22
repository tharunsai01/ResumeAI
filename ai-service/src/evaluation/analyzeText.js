import { cleanText } from "../parsing/cleanText.js";
import { scanForInjection } from "../security/injectionScan.js";
import { extractResume } from "../extraction/extractResume.js";

/**
 * Same pipeline as analyzeResumeFile, but starting from plain text (pasted text, evaluation texts).
 * text -> cleaned -> injection scan -> sanitised text -> LLM facts -> analysis
 */
export async function analyzeResumeText(text, options = {}) {
  const { text: cleaned, invisibleCount } = cleanText(String(text ?? ""));
  const scan = scanForInjection(cleaned, { invisibleCount });
  const { analysis, meta } = await extractResume(scan.sanitizedText, options);

  return {
    analysis,
    text: scan.sanitizedText,
    security: { riskLevel: scan.riskLevel, findings: scan.findings, invisibleCount },
    meta,
  };
}