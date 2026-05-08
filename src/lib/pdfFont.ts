// Lazy-load an Arabic-capable Unicode font into jsPDF instances and
// install a global Arabic shaping + bidi pipeline so that every
// `doc.text(...)` call renders Arabic correctly (joined glyphs, RTL order).
//
// Why: jsPDF only renders glyphs in visual order with no shaping or BiDi.
// Without this, Arabic appears as disconnected, left-to-right letters.
// We monkey-patch jsPDF.prototype.text once so all existing PDF exports
// across the app benefit without touching each call site.
import jsPDF from 'jspdf';
// @ts-ignore - no types
import { ArabicShaper } from 'arabic-persian-reshaper';
import bidiFactory from 'bidi-js';

const bidi = bidiFactory();

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
        fontBase64Promise = null;
        throw e;
      });
  }
  return fontBase64Promise;
};

// Detects Arabic / Arabic Supplement / Presentation Forms blocks.
const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const containsArabic = (s: unknown): boolean =>
  typeof s === 'string' && ARABIC_RE.test(s);

/**
 * Shape Arabic letters into their contextual presentation forms and
 * reorder the string into visual (RTL) order using the Unicode BiDi
 * algorithm. Safe to call on any string — non-Arabic strings pass through.
 */
export const shapeArabic = (input: string): string => {
  if (!containsArabic(input)) return input;
  // Process each line independently to preserve newlines.
  return input
    .split(/\r?\n/)
    .map((line) => {
      if (!containsArabic(line)) return line;
      let shaped: string;
      try {
        shaped = ArabicShaper.convertArabic(line);
      } catch {
        shaped = line;
      }
      try {
        const embeddingLevels = bidi.getEmbeddingLevels(shaped, 'rtl');
        return bidi.getReorderedString(shaped, embeddingLevels);
      } catch {
        return shaped;
      }
    })
    .join('\n');
};

const shapeAny = (text: any): any => {
  if (Array.isArray(text)) return text.map(shapeAny);
  if (typeof text === 'string') return shapeArabic(text);
  return text;
};

let textPatched = false;
const patchJsPDFText = () => {
  if (textPatched) return;
  const proto: any = (jsPDF as any).API ?? (jsPDF as any).prototype;
  if (!proto || typeof proto.text !== 'function') return;
  const original = proto.text;
  proto.text = function patchedText(this: any, ...args: any[]) {
    // jsPDF signatures: text(text, x, y, options?) | text(x, y, text, options?)
    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
      args[0] = shapeAny(args[0]);
    } else if (typeof args[2] === 'string' || Array.isArray(args[2])) {
      args[2] = shapeAny(args[2]);
    }
    return original.apply(this, args);
  };
  textPatched = true;
};

// Patch autoTable cell content too, so tables with Arabic also render correctly.
let autoTablePatched = false;
const patchAutoTable = async () => {
  if (autoTablePatched) return;
  try {
    const mod: any = await import('jspdf-autotable');
    autoTablePatched = true;
    // jspdf-autotable invokes doc.text internally, which is already patched.
    // We additionally pre-shape `head`/`body` strings so column width
    // calculations reflect the shaped glyphs.
    const proto: any = (jsPDF as any).API ?? (jsPDF as any).prototype;
    if (!proto.autoTable || (proto.autoTable as any).__arPatched) return;
    const orig = proto.autoTable;
    const wrap = function (this: any, options: any) {
      if (options && typeof options === 'object') {
        const mapRows = (rows: any) =>
          Array.isArray(rows)
            ? rows.map((row) =>
                Array.isArray(row)
                  ? row.map(shapeAny)
                  : row && typeof row === 'object' && 'content' in row
                  ? { ...row, content: shapeAny((row as any).content) }
                  : shapeAny(row),
              )
            : rows;
        if (options.head) options.head = mapRows(options.head);
        if (options.body) options.body = mapRows(options.body);
        if (options.foot) options.foot = mapRows(options.foot);
      }
      return orig.call(this, options);
    };
    (wrap as any).__arPatched = true;
    proto.autoTable = wrap;
  } catch {
    // jspdf-autotable not present; ignore.
  }
};

/**
 * Registers the Amiri Arabic font into the given jsPDF document and installs
 * the global shaping + BiDi pipeline. Returns the font name to use via
 * `doc.setFont(name, ...)`. Falls back to 'helvetica' if the font fails to load.
 */
export const ensureUnicodeFont = async (doc: jsPDF): Promise<string> => {
  patchJsPDFText();
  patchAutoTable();
  try {
    const base64 = await loadFontBase64();
    const fileName = 'Amiri-Regular.ttf';
    doc.addFileToVFS(fileName, base64);
    doc.addFont(fileName, 'Amiri', 'normal');
    doc.addFont(fileName, 'Amiri', 'bold');
    doc.setFont('Amiri', 'normal');
    return 'Amiri';
  } catch {
    return 'helvetica';
  }
};
