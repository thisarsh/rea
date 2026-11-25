import * as pdfjsLib from 'pdfjs-dist';

// Use standard CDN or embedded worker source for 100% reliable Vite bundling
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

/**
 * Extracts raw text from an uploaded File (PDF, TXT, DOCX/Text)
 */
export async function extractResumeText(file) {
  if (!file) throw new Error('No file provided');

  const fileName = file.name || 'resume';
  const extension = fileName.split('.').pop()?.toLowerCase();

  // Plain Text file
  if (extension === 'txt' || file.type === 'text/plain') {
    return await file.text();
  }

  // PDF Document
  if (extension === 'pdf' || file.type === 'application/pdf') {
    return await extractFromPdf(file);
  }

  // Fallback: Attempt text reading
  try {
    const raw = await file.text();
    if (raw && raw.length > 50) return raw;
  } catch (_) {}

  throw new Error('Unsupported format. Please upload a PDF or TXT resume.');
}

async function extractFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const typedArray = new Uint8Array(arrayBuffer);

  const loadingTask = pdfjsLib.getDocument({
    data: typedArray,
    useWorkerFetch: true,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageStrings = content.items
      .map((item) => (item.hasEOL ? item.str + '\n' : item.str))
      .join(' ');
    fullText += pageStrings + '\n\n';
  }

  const cleaned = fullText
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleaned || cleaned.length < 40) {
    throw new Error('Could not extract readable text from this PDF. Please ensure it is not an image-only scan.');
  }

  return cleaned;
}
