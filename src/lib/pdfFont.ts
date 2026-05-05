// Lazy-load an Arabic-capable Unicode font into jsPDF instances.
// Uses Amiri Regular from jsDelivr (Google Fonts mirror), cached after first fetch.
import type jsPDF from 'jspdf';

let fontBase64Promise: Promise<string> | null = null;
const FONT_URL =
  'https://cdn.jsdelivr.net/gh/aliftype/amiri@1.000/fonts/ttf/Amiri-Regular.ttf';

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)) as any
    );
  }
  return btoa(binary);
};

const loadFontBase64 = (): Promise<string> => {
  if (!fontBase64Promise) {
    fontBase64Promise = fetch(FONT_URL)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch font');
        return r.arrayBuffer();
      })
      .then(arrayBufferToBase64)
      .catch((e) => {
        fontBase64Promise = null; // allow retry on failure
        throw e;
      });
  }
  return fontBase64Promise;
};

/**
 * Registers a Unicode (Arabic-capable) font into the given jsPDF document
 * and returns the font name to use via doc.setFont(name, ...).
 * Falls back to 'helvetica' if the font cannot be loaded.
 */
export const ensureUnicodeFont = async (doc: jsPDF): Promise<string> => {
  try {
    const base64 = await loadFontBase64();
    const fileName = 'Amiri-Regular.ttf';
    doc.addFileToVFS(fileName, base64);
    doc.addFont(fileName, 'Amiri', 'normal');
    doc.addFont(fileName, 'Amiri', 'bold');
    return 'Amiri';
  } catch {
    return 'helvetica';
  }
};
