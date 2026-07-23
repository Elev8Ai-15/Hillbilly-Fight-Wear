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
