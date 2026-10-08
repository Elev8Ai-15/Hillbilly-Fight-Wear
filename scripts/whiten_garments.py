"""Build the WHITE builder garment images from the GREY ones.

The original *-white-*.png files were opaque white-on-white with most of the
garment's edges and folds lost, so they washed out in the /build preview.
The grey shots keep full detail. For each garment/view this:
  1. cuts the grey garment out (flood-fill the near-white backdrop from the border),
  2. lifts the fabric to white while keeping the folds,
  3. saves an RGBA PNG over *-white-*.png, so the builder's existing grey
     canvas background (#d5d5d5 for white garments) shows around it.

Usage:  python scripts/whiten_garments.py [--preview out.png]
Originals are in git history if a result needs to be rolled back.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

DIR = Path(__file__).resolve().parent.parent / "public" / "images" / "garments"
GARMENTS = ["tshirt", "thermal", "hoodie", "zipup-hoodie", "tank-mens", "tank-womens"]

# Calibration knobs (tuned by eye on the /build preview; adjust if a garment looks off)
BG_THRESHOLD = 235   # luminance above this, connected to the border = backdrop
FABRIC_TOP = 247     # where the garment's median fabric tone lands (pure 255 loses folds)
FOLD_GAIN = 1.0      # how strongly grey-shot shading carries into the white garment
SMOOTH = 2.0         # blur radius (at 597px wide) that removes the grey heather speckle
FLOOR = 120          # darkest a pixel may go (zippers, hood interior stay readable)
EDGE_TRIM = 4        # px shaved off the cutout edge (bright-rim killer)


def garment_mask(lum: np.ndarray) -> np.ndarray:
    """True where the garment is: everything not reachable from the border through near-white."""
    h, w = lum.shape
    # .copy(): images made by fromarray are read-only; floodfill on them silently no-ops
    # Sources are dithered: white specks on garment highlights let the fill tunnel
    # in (zip-up hood) and dark specks in the backdrop block it (hoodie back).
    # A median filter removes isolated specks both ways before thresholding.
    denoised = np.asarray(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.MedianFilter(5)))
    light = Image.fromarray(np.where(denoised > BG_THRESHOLD, 255, 0).astype(np.uint8)).copy()
    for x in range(0, w, 8):
        for y in (0, h - 1):
            if light.getpixel((x, y)) == 255:
                ImageDraw.floodfill(light, (x, y), 128)
    for y in range(0, h, 8):
        for x in (0, w - 1):
            if light.getpixel((x, y)) == 255:
                ImageDraw.floodfill(light, (x, y), 128)
    # Keep only the garment blob at the image centre: drops stray backdrop
    # specks/vignette patches the border fill couldn't reach.
    blob = Image.fromarray(np.where(np.asarray(light) != 128, 255, 0).astype(np.uint8)).copy()
    centre = (w // 2, h // 2)
    assert blob.getpixel(centre) == 255, "image centre is not on the garment"
    ImageDraw.floodfill(blob, centre, 200)
    return np.asarray(blob) == 200


def whiten(src: Path) -> Image.Image:
    rgb = Image.open(src).convert("RGB")
    lum_img = rgb.convert("L")
    lum = np.asarray(lum_img).astype(np.float32)
    # Shave EDGE_TRIM px off the cut: the grey shot's outermost pixels are
    # anti-aliased toward the white backdrop and would become a bright rim.
    raw = Image.fromarray((garment_mask(lum) * 255).astype(np.uint8))
    mask = np.asarray(raw.filter(ImageFilter.MinFilter(EDGE_TRIM * 2 + 1))) > 127

    # Fill the backdrop with the fabric tone before blurring, or edge pixels blend
    # with the white backdrop and come out as a bright rim.
    median = float(np.median(lum[mask]))
    filled = Image.fromarray(np.where(mask, lum, median).astype(np.uint8))
    smooth = np.asarray(filled.filter(ImageFilter.GaussianBlur(SMOOTH * lum.shape[1] / 597))).astype(np.float32)  # blur scales with image size
    out = np.clip(FABRIC_TOP - (median - smooth) * FOLD_GAIN, FLOOR, 255).astype(np.uint8)

    alpha = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))

    o = Image.fromarray(out)
    return Image.merge("RGBA", (o, o, o, alpha))


def main() -> None:
    results = []
    for g in GARMENTS:
        for view in ("front", "back"):
            src = DIR / f"{g}-grey-{view}.png"
            dst = DIR / f"{g}-white-{view}.png"
            img = whiten(src)
            img.save(dst, optimize=True)
            results.append(img)
            print(f"{dst.name}: {img.size}")

    if "--preview" in sys.argv:
        # Contact sheet on the builder's white-garment background, for eyeballing.
        cell = 300
        sheet = Image.new("RGB", (cell * 6, cell * 2), (0xD5, 0xD5, 0xD5))
        for i, img in enumerate(results):
            t = img.copy()
            t.thumbnail((cell - 10, cell - 10))
            col, row = i // 2, i % 2
            sheet.paste(t, (col * cell + (cell - t.width) // 2, row * cell + (cell - t.height) // 2), t)
        sheet.save(sys.argv[sys.argv.index("--preview") + 1])


if __name__ == "__main__":
    main()
