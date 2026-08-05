import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export interface PdfTextLayer {
  text: string;
  pageCount: number;
  /** Pages whose embedded text falls under ocrMinimumCharactersPerPage. */
  pagesWithoutText: number;
}

/**
 * Reads a PDF's embedded text layer, per page. A PDF exported from a design
 * tool (or scanned) has no /Font resources at all, so every page comes back
 * empty here — that is the signal the caller uses to fall back to visual
 * reading, not a failure of this function.
 */
export async function extractPdfTextLayer(buffer: Buffer, minimumCharactersPerPage: number): Promise<PdfTextLayer> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text: pages } = await extractText(pdf, { mergePages: false });
  const pageTexts = Array.isArray(pages) ? pages : [pages];

  return {
    text: pageTexts.join("\n\n"),
    pageCount: pageTexts.length,
    pagesWithoutText: pageTexts.filter((page) => (page ?? "").trim().length < minimumCharactersPerPage).length,
  };
}

/**
 * Converts an uploaded document's raw bytes into plain text for the AI
 * extraction prompt. Without this, PDF/DOCX bytes were passed straight to
 * `Blob.text()`, decoding binary streams as UTF-8 "text" — garbled and, for
 * compressed PDF content, orders of magnitude larger than the real text
 * (this produced a real production prompt-too-long failure: 409981 tokens
 * for a one-page résumé).
 */
export async function extractDocumentText(params: { buffer: Buffer; mimeType: string; filename: string | null }): Promise<string> {
  const extension = params.filename?.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = params.mimeType === "application/pdf" || extension === "pdf";
  const isDocx = params.mimeType === DOCX_MIME_TYPE || extension === "docx";

  if (isPdf) {
    const pdf = await getDocumentProxy(new Uint8Array(params.buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }
  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer: params.buffer });
    return result.value;
  }
  return params.buffer.toString("utf-8");
}

export function isPdfDocument(mimeType: string, filename: string | null): boolean {
  const extension = filename?.split(".").pop()?.toLowerCase() ?? "";
  return mimeType === "application/pdf" || extension === "pdf";
}
