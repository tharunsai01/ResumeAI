import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import path from "node:path";

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // matches the "Max 5MB" shown in the UI
const MAX_PDF_PAGES = 10;
const MIN_TEXT_CHARS = 100;

const PDF_MAGIC = Buffer.from("%PDF-");
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // .docx is a zip file

export class ResumeParseError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ResumeParseError";
    this.code = code;
  }
}

function detectFileType(buffer, filename, allowTxt) {
  const ext = path.extname(filename).toLowerCase();

  if (ext === ".pdf") {
    if (!buffer.subarray(0, 5).equals(PDF_MAGIC)) {
      throw new ResumeParseError("INVALID_FILE", "File is named .pdf but is not a real PDF.");
    }
    return "pdf";
  }
  if (ext === ".docx") {
    if (!buffer.subarray(0, 4).equals(ZIP_MAGIC)) {
      throw new ResumeParseError("INVALID_FILE", "File is named .docx but is not a real DOCX.");
    }
    return "docx";
  }
  if (ext === ".txt" && allowTxt) return "txt";

  throw new ResumeParseError("UNSUPPORTED_TYPE", "Only PDF and DOCX resumes are supported.");
}

async function extractPdf(buffer) {
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer), // copy -> plain Uint8Array (pdfjs rejects Buffer)
    useSystemFonts: true,
    isEvalSupported: false,
    disableFontFace: true,
  });
  const doc = await loadingTask.promise;
  const pageCount = doc.numPages;

  if (pageCount > MAX_PDF_PAGES) {
    await doc.destroy();
    throw new ResumeParseError("TOO_LONG", `Resume has ${pageCount} pages (max ${MAX_PDF_PAGES}).`);
  }

  const pages = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();

    const lines = [];
    let line = "";
    let lastEnd = null;

    for (const item of content.items) {
      if (typeof item.str !== "string") continue;
      const x = item.transform[4];
      // add a space when two text chunks on the same line are visually apart
      if (line && lastEnd !== null && x - lastEnd > 1 && !line.endsWith(" ") && !item.str.startsWith(" ")) {
        line += " ";
      }
      line += item.str;
      lastEnd = x + item.width;
      if (item.hasEOL) {
        lines.push(line);
        line = "";
        lastEnd = null;
      }
    }
    if (line) lines.push(line);
    pages.push(lines.join("\n"));
  }

  await doc.destroy();
  return { text: pages.join("\n\n"), pageCount };
}

async function extractDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return { text: value, pageCount: null };
}

export async function parseResume(buffer, filename, { allowTxt = false } = {}) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new ResumeParseError("EMPTY_FILE", "File is empty.");
  }
  if (buffer.length > MAX_FILE_BYTES) {
    throw new ResumeParseError("TOO_LARGE", "File is larger than 5 MB.");
  }

  const fileType = detectFileType(buffer, filename, allowTxt);

  let result;
  if (fileType === "pdf") result = await extractPdf(buffer);
  else if (fileType === "docx") result = await extractDocx(buffer);
  else result = { text: buffer.toString("utf8"), pageCount: null };

  if (result.text.trim().length < MIN_TEXT_CHARS) {
    throw new ResumeParseError(
      "NO_TEXT_FOUND",
      "Could not read enough text. The file may be a scanned image (OCR is not supported)."
    );
  }

  return { fileType, text: result.text, pageCount: result.pageCount };
}