import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { processResumeFile } from "../src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "samples", "resumes");

const files = (await readdir(dir)).filter((f) => !f.startsWith("~$") && /\.(pdf|docx|txt)$/i.test(f)).sort();
if (files.length === 0) {
  console.log("No sample resumes found in", dir);
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  console.log("=".repeat(60));
  console.log("FILE:", file);
  try {
    const buffer = await readFile(path.join(dir, file));
    const result = await processResumeFile(buffer, file, { allowTxt: true });
    console.log("type:", result.fileType, "| pages:", result.pageCount ?? "-", "| words:", result.wordCount);
    console.log(
      "security:",
      result.security.riskLevel,
      `(${result.security.findings.length} findings, ${result.security.invisibleCount} invisible chars removed)`
    );
    for (const f of result.security.findings) {
      console.log(`  - [${f.severity}] ${f.rule} (line ${f.line}): ${f.excerpt}`);
    }
    console.log("--- first 400 chars of the text sent onward ---");
    console.log(result.text.slice(0, 400));
  } catch (err) {
    failed++;
    console.log("ERROR:", err.code ?? "UNKNOWN", "-", err.message);
  }
}
process.exit(failed ? 1 : 0);