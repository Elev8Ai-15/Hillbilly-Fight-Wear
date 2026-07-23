import { SharedDesign } from "@/store/designer-store";

const CANVAS_W = 300;
const CANVAS_H = 340;
// Keep share links comfortably under browser URL limits
const MAX_SHARE_JSON_LENGTH = 24000;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Self-hosted designer fonts. SVG-as-image can't fetch external resources,
// so used fonts get inlined as data URIs before rasterizing.
const FONT_FILES: Record<string, string> = {
  Anton: "/fonts/anton.woff2",
  "Alfa Slab One": "/fonts/alfa-slab-one.woff2",
  "Black Ops One": "/fonts/black-ops-one.woff2",
  Rye: "/fonts/rye.woff2",
  "Special Elite": "/fonts/special-elite.woff2",
};

const fontDataCache = new Map<string, string>();
const imageDataCache = new Map<string, string>();

/** Inline non-data image hrefs (approved library graphics) so the SVG rasterizes. */
async function inlineImages(clone: SVGSVGElement): Promise<void> {
  const images = [...clone.querySelectorAll("image")];
  for (const img of images) {
    const href = img.getAttribute("href") || img.getAttribute("xlink:href");
    if (!href || href.startsWith("data:")) continue;
    try {
      let dataUrl = imageDataCache.get(href);
      if (!dataUrl) {
        const res = await fetch(href);
        if (!res.ok) continue;
        const blob = await res.blob();
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        imageDataCache.set(href, dataUrl);
      }
      img.setAttribute("href", dataUrl);
      img.removeAttribute("xlink:href");
    } catch {
      // Un-inlinable image just drops out of the export
    }
  }
}

async function buildFontStyle(clone: SVGSVGElement): Promise<string> {
  const used = new Set<string>();
  clone.querySelectorAll("text").forEach((t) => {
    const fam = t.getAttribute("font-family") || "";
    Object.keys(FONT_FILES).forEach((name) => {
      if (fam.includes(name)) used.add(name);
    });
  });
  if (used.size === 0) return "";

  const faces: string[] = [];
  for (const name of used) {
    try {
      let dataUrl = fontDataCache.get(name);
      if (!dataUrl) {
        const res = await fetch(FONT_FILES[name]);
        if (!res.ok) continue;
        const buf = await res.arrayBuffer();
        let binary = "";
        new Uint8Array(buf).forEach((b) => (binary += String.fromCharCode(b)));
        dataUrl = `data:font/woff2;base64,${btoa(binary)}`;
        fontDataCache.set(name, dataUrl);
      }
      faces.push(
        `@font-face{font-family:"${name}";src:url(${dataUrl}) format("woff2");}`
      );
    } catch {
      // Missing font just falls back in the export
    }
  }
  return faces.join("\n");
}

/**
 * Rasterize the live designer SVG (#garment-canvas-svg) to a PNG data URL.
 * Selection chrome tagged with data-export-ignore is stripped first.
 */
export async function renderDesignToPng(scale = 2): Promise<string | null> {
  const svg = document.getElementById(
    "garment-canvas-svg"
  ) as SVGSVGElement | null;
  if (!svg) return null;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll("[data-export-ignore]").forEach((n) => n.remove());
  clone.removeAttribute("style");
  clone.removeAttribute("class");
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const width = CANVAS_W * scale;
  const height = CANVAS_H * scale;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  await inlineImages(clone);

  const fontStyle = await buildFontStyle(clone);
  if (fontStyle) {
    const styleEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style"
    );
    styleEl.textContent = fontStyle;
    clone.insertBefore(styleEl, clone.firstChild);
  }

  const markup = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Returns null when the design is too large to share as a link (uploaded images). */
export function encodeDesignForUrl(design: SharedDesign): string | null {
  const json = JSON.stringify(design);
  if (json.length > MAX_SHARE_JSON_LENGTH) return null;
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return encodeURIComponent(btoa(binary));
}

export function decodeDesignFromUrl(encoded: string): SharedDesign | null {
  try {
    const binary = atob(decodeURIComponent(encoded));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const design = JSON.parse(new TextDecoder().decode(bytes));
    if (
      !design ||
      typeof design.garmentType !== "string" ||
      !Array.isArray(design.elements)
    ) {
      return null;
    }
    return design as SharedDesign;
  } catch {
    return null;
  }
}
