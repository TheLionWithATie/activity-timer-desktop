/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function hexToRGB(h: string) {
  let r = 0, g = 0, b = 0;

  // 3 digits
  if (h.length == 4) {
    r = Number("0x" + h[1] + h[1]);
    g = Number("0x" + h[2] + h[2]);
    b = Number("0x" + h[3] + h[3]);

  // 6 digits
  } else if (h.length == 7) {
    r = Number("0x" + h[1] + h[2]);
    g = Number("0x" + h[3] + h[4]);
    b = Number("0x" + h[5] + h[6]);
  }

  return { r, g, b };
}

export function RGBToHSL(r: number, g:number, b:number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  return {
    h: 60 * h < 0 ? 60 * h + 360 : 60 * h,
    s: 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    l: (100 * (2 * l - s)) / 2,
  };
}
