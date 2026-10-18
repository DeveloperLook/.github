import { FONT_STACK } from './theme.mjs';

// Onest (SIL OFL 1.1, assets/vendor/fonts/OFL.txt) is the heading font on developerlook.com. README images cannot
// load web fonts, so the SVGs that use it embed this basic Latin subset (weights 500 to 700), made with fontTools:
//   python3 -m fontTools.varLib.instancer 'Onest[wght].ttf' wght=500:700 -o onest-500-700.ttf
//   python3 -m fontTools.subset onest-500-700.ttf --unicodes=U+0020-007E,U+00B7 --flavor=woff2 \
//     --layout-features=kern,liga,calt --output-file=assets/vendor/fonts/onest-500-700.woff2
export const ONEST_COVERAGE = /^[ -~·]*$/;

export function onestStyle(woff2Base64) {
  return `@font-face{font-family:Onest;font-weight:500 700;src:url(data:font/woff2;base64,${woff2Base64}) format('woff2')}.o{font-family:Onest, ${FONT_STACK}}`;
}

export function assertOnest(...strings) {
  for (const value of strings) {
    if (!ONEST_COVERAGE.test(value)) throw new Error(`Text outside the Onest subset: ${value}`);
  }
}
