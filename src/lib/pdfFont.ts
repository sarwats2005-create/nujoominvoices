// Lazy-load an Arabic-capable Unicode font into jsPDF instances and
// install a global Arabic shaping + bidi pipeline so that every
// `doc.text(...)` call renders Arabic correctly (joined glyphs, RTL order).
//
// Why: jsPDF only renders glyphs in visual order with no shaping or BiDi.
// Without this, Arabic appears as disconnected, left-to-right letters.
// We monkey-patch jsPDF.prototype.text once (on module import) so every
// PDF export across the app benefits without touching call sites.
import jsPDF from 'jspdf';
// @ts-ignore - no types
import { ArabicShaper } from 'arabic-persian-reshaper';
import bidiFactory from 'bidi-js';

const bidi = bidiFactory();

let fontBase64: string | null = null;
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
  if (fontBase64) return Promise.resolve(fontBase64);
  if (!fontBase64Promise) {
    fontBase64Promise = fetch(FONT_URL)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch font');
        return r.arrayBuffer();
      })
      .then(arrayBufferToBase64)
      .then((b64) => {
        fontBase64 = b64;
        return b64;
      })
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

// ---- Install global jsPDF patches once at module import ----
// jsPDF.text signatures we handle:
//   text(text, x, y, options?)
//   text(x, y, text, options?)  (legacy)
const proto: any = (jsPDF as any).API ?? (jsPDF as any).prototype;
if (proto && typeof proto.text === 'function' && !(proto.text as any).__arPatched) {
  const original = proto.text;
  const patched = function patchedText(this: any, ...args: any[]) {
    let textArg: any;
    let textIdx = -1;
    let optsIdx = -1;
    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
      textArg = args[0]; textIdx = 0; optsIdx = 3;
    } else if (typeof args[2] === 'string' || Array.isArray(args[2])) {
      textArg = args[2]; textIdx = 2; optsIdx = 3;
    }
    const hasArabic = Array.isArray(textArg)
      ? textArg.some((s) => containsArabic(s))
      : containsArabic(textArg);
    if (textIdx >= 0) args[textIdx] = shapeAny(textArg);
    if (hasArabic && textIdx >= 0) {
      // Auto right-align + RTL direction when caller didn't specify.
      const opts = (args[optsIdx] && typeof args[optsIdx] === 'object') ? { ...args[optsIdx] } : {};
      if (!opts.align) opts.align = 'right';
      // jsPDF respects these for proper RTL output of mixed strings.
      if (!('isInputRtl' in opts)) opts.isInputRtl = true;
      if (!('isOutputRtl' in opts)) opts.isOutputRtl = true;
      args[optsIdx] = opts;
    }
    return original.apply(this, args);
  };
  (patched as any).__arPatched = true;
  proto.text = patched;
}

// Patch autoTable: pre-shape rows for correct column widths AND auto
// right-align cells whose original content contained Arabic.
import('jspdf-autotable').then(() => {
  const p: any = (jsPDF as any).API ?? (jsPDF as any).prototype;
  if (!p?.autoTable || (p.autoTable as any).__arPatched) return;
  const orig = p.autoTable;
  const wrap = function (this: any, options: any) {
    if (options && typeof options === 'object') {
      // Track which (section,row,col) cells originally contained Arabic so
      // we can right-align them inside didParseCell — shaped glyphs still
      // match our Arabic regex, so detection works post-shape too.
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

      const userDidParseCell = options.didParseCell;
      options.didParseCell = (data: any) => {
        try {
          const raw = data?.cell?.raw;
          const txt =
            typeof raw === 'string'
              ? raw
              : raw && typeof raw === 'object' && 'content' in raw
              ? String((raw as any).content ?? '')
              : Array.isArray(data?.cell?.text)
              ? data.cell.text.join(' ')
              : String(data?.cell?.text ?? '');
          if (containsArabic(txt)) {
            data.cell.styles.halign = 'right';
          }
        } catch { /* ignore */ }
        if (typeof userDidParseCell === 'function') userDidParseCell(data);
      };
    }
    return orig.call(this, options);
  };
  (wrap as any).__arPatched = true;
  p.autoTable = wrap;
}).catch(() => {});


// Kick off font fetch eagerly so sync callers can register it later.
loadFontBase64().catch(() => {});

/** Preload the Unicode font (call from app entry to warm cache). */
export const preloadUnicodeFont = (): Promise<void> =>
  loadFontBase64().then(() => undefined).catch(() => undefined);

const registerInDoc = (doc: jsPDF, base64: string): string => {
  const fileName = 'Amiri-Regular.ttf';
  doc.addFileToVFS(fileName, base64);
  doc.addFont(fileName, 'Amiri', 'normal');
  doc.addFont(fileName, 'Amiri', 'bold');
  doc.setFont('Amiri', 'normal');
  return 'Amiri';
};

/**
 * Async: register Amiri (Arabic-capable) font in the doc and return its name.
 * Falls back to 'helvetica' on failure.
 */
export const ensureUnicodeFont = async (doc: jsPDF): Promise<string> => {
  try {
    const base64 = await loadFontBase64();
    return registerInDoc(doc, base64);
  } catch {
    return 'helvetica';
  }
};

/**
 * Sync: register Amiri if it has already been preloaded, else 'helvetica'.
 * Use this when the calling code path cannot be made async (e.g. POS receipts).
 */
export const ensureUnicodeFontSync = (doc: jsPDF): string => {
  if (fontBase64) {
    try {
      return registerInDoc(doc, fontBase64);
    } catch {
      return 'helvetica';
    }
  }
  return 'helvetica';
};

