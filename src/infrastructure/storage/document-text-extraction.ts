import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

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
