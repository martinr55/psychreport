const FONT_FILES = {
  normal: "/fonts/LiberationSerif-Regular.ttf",
  bold: "/fonts/LiberationSerif-Bold.ttf",
  italic: "/fonts/LiberationSerif-Italic.ttf",
  bolditalic: "/fonts/LiberationSerif-BoldItalic.ttf",
} as const;

export type ReportFontStyle = keyof typeof FONT_FILES;

export type ReportFontBinary = Record<ReportFontStyle, string>;

let fontCache: ReportFontBinary | null = null;

function arrayBufferToBinaryString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return binary;
}

async function fetchFont(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load font ${path} (${response.status}).`);
  }
  return arrayBufferToBinaryString(await response.arrayBuffer());
}

export async function loadReportFonts(): Promise<ReportFontBinary> {
  if (fontCache) {
    return fontCache;
  }
  const entries = await Promise.all(
    Object.entries(FONT_FILES).map(async ([style, path]) => [
      style,
      await fetchFont(path),
    ]),
  );
  fontCache = Object.fromEntries(entries) as ReportFontBinary;
  return fontCache;
}
