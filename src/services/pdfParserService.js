import * as pdfjsLib from 'pdfjs-dist';

// Use locally bundled PDF.js worker for 100% reliable web + Capacitor Android execution
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

/**
 * Loads a PDF document from a File, Blob, or ArrayBuffer
 */
export async function loadPdfDocument(fileOrBlob) {
  const arrayBuffer = await fileOrBlob.arrayBuffer();
  const typedArray = new Uint8Array(arrayBuffer);

  const loadingTask = pdfjsLib.getDocument({
    data: typedArray,
    useWorkerFetch: true,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  return await loadingTask.promise;
}

/**
 * Renders page 1 (or specified page) of a PDF onto an HTMLCanvasElement cleanly scaled to container width
 */
export async function renderPdfPageToCanvas(pdf, pageNumber, canvas, targetCssWidth = 360) {
  if (!pdf || !canvas) return;
  const page = await pdf.getPage(pageNumber);
  const unscaledViewport = page.getViewport({ scale: 1 });
  const scale = targetCssWidth / unscaledViewport.width;
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const viewport = page.getViewport({ scale: scale * dpr });

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.style.width = `${Math.floor(targetCssWidth)}px`;
  canvas.style.height = `${Math.floor((unscaledViewport.height * scale))}px`;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;
}

/**
 * Extracts raw text from an uploaded File (PDF, TXT)
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

/**
 * Spatially sorts PDF text items top-to-bottom and left-to-right so headings
 * placed out-of-order in PDF object streams (common in LaTeX/Canva exports) read naturally.
 */
async function extractFromPdf(file) {
  const pdf = await loadPdfDocument(file);
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Filter meaningful items and remove Private Use Area icon glyphs (FontAwesome etc.)
    const items = content.items
      .map((item) => ({
        str: (item.str || '').replace(/[\uE000-\uF8FF]/g, '').trim(),
        x: item.transform ? item.transform[4] : 0,
        y: item.transform ? item.transform[5] : 0,
      }))
      .filter((item) => item.str.length > 0);

    // Group items by visual Y line (within 4.5pt vertical tolerance), top-to-bottom (descending Y)
    items.sort((a, b) => b.y - a.y || a.x - b.x);

    const rows = [];
    for (const item of items) {
      const existingRow = rows.find((r) => Math.abs(r.y - item.y) <= 4.5);
      if (existingRow) {
        existingRow.items.push(item);
      } else {
        rows.push({ y: item.y, items: [item] });
      }
    }

    const pageLines = rows.map((row) => {
      row.items.sort((a, b) => a.x - b.x);
      return row.items.map((it) => it.str).join(' ');
    });

    fullText += pageLines.join('\n') + '\n\n';
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
