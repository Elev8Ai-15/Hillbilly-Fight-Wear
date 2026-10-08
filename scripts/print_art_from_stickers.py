"""Build builder print art from the REAL sticker art.

Several graphics/*.png files were retyped in a generic font (or a different
design entirely), so the /build preview didn't match the tile or the real shirt.
The stickers ARE the real designs (match the product photos); this strips the
sticker's black backing/outline so only the ink is left:

  public/images/graphics/print/<id>-light.png  ink as printed on DARK garments
  public/images/graphics/print/<id>-dark.png   same, neutral (white/grey) ink
                                               flipped to near-black for WHITE garments

Usage: python scripts/print_art_from_stickers.py [--preview out.png]
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / "public" / "images"
OUT = ROOT / "graphics" / "print"

# graphic id -> sticker file (the tile image in src/data/catalog.ts)
STICKERS = {
    "human-cockfighter": "sticker-hcf.png",
    "thump-a-stranger": "sticker-thump.png",
    "fun-logo": "sticker-fun-ride.png",
    "myob": "sticker-myob.png",
    "gnf": "sticker-gnf.png",
    "cling-to-guns": "sticker-your-neck.png",
    "yes-you-can": "sticker-yes-you-can.png",
    "put-it-on-em": "sticker-put-it-on-em.png",
    "obama-tap": "sticker-obama-tap.png",
    "good-for-community": "sticker-community.png",
    "staunch-chm": "sticker-cunt.png",
}
# Real art that only exists in black ink (graphics/ folder): needs a white-ink version for dark garments
BLACK_INK_ART = {
    "hfw-logo": "hfw-logo-original.png",
    "yycf-logo": "yycf-logo.png",
    "wimb": "wimb.png",
}
# Clear stickers: dark letters + thin cut line, no black backing (handled differently)
CLEAR_STICKERS = {"sticker-obama-tap.png", "sticker-community.png"}

# Calibration knobs
BLACK_MAX = 70     # value (max RGB) at/below this = sticker backing -> transparent
BLACK_SOFT = 50    # ramp above BLACK_MAX so letter edges stay anti-aliased
NEUTRAL_SAT = 0.18 # saturation below this counts as white/grey ink (flipped for white garments)
DARK_INK = 24      # tone that white ink becomes on white garments
MIN_LETTER_PX = 25 # clear stickers: dark specks smaller than this are cut-line debris, not letters


def knockout_holes(a: np.ndarray) -> np.ndarray:
    """White ink on these stickers is a KNOCKOUT: transparent holes punched in the
    black body. Holes = transparent pixels NOT connected to the image border."""
    h, w = a.shape
    clear = Image.fromarray(np.where(a < 128, 255, 0).astype(np.uint8)).copy()  # .copy(): fromarray is read-only
    for x in range(0, w, 4):
        for y in (0, h - 1):
            if clear.getpixel((x, y)) == 255:
                ImageDraw.floodfill(clear, (x, y), 128)
    for y in range(0, h, 4):
        for x in (0, w - 1):
            if clear.getpixel((x, y)) == 255:
                ImageDraw.floodfill(clear, (x, y), 128)
    holes = Image.fromarray((np.asarray(clear) == 255).astype(np.uint8) * 255)
    # grow 1px so the anti-aliased rim of each letter is included
    return np.asarray(holes.filter(ImageFilter.MaxFilter(3))) > 127


def clear_sticker_letters(rgba: np.ndarray) -> np.ndarray:
    """CLEAR stickers (Obama, Community): dark letters + a thin die-cut outline, no
    backing. Ink = the dark letters; the outline is the component(s) reaching the
    outer edge of the drawing, so drop those. Returns letter coverage 0..1."""
    from scipy import ndimage

    a = rgba[..., 3] / 255.0
    dark = (a > 0.5) & (rgba[..., :3].max(axis=2) < 128)
    labels, n = ndimage.label(dark, structure=np.ones((3, 3)))
    ys, xs = np.nonzero(dark)
    on_edge = (ys == ys.min()) | (ys == ys.max()) | (xs == xs.min()) | (xs == xs.max())
    edge = set(labels[ys[on_edge], xs[on_edge]].tolist())
    sizes = ndimage.sum(dark, labels, range(1, n + 1))
    # drop the cut line (touches the outer edge) and its broken-off specks (tiny)
    letters = np.isin(labels, [i for i in range(1, n + 1) if i not in edge and sizes[i - 1] >= MIN_LETTER_PX])
    grown = ndimage.binary_dilation(letters, iterations=1)   # keep anti-aliased letter edges
    return np.where(grown, a, 0.0)


def extract(src: Path) -> tuple[Image.Image, Image.Image]:
    rgba = np.asarray(Image.open(src).convert("RGBA")).astype(np.float32)
    if src.name in CLEAR_STICKERS:
        cov = (clear_sticker_letters(rgba) * 255).astype(np.uint8)
        white = np.full(cov.shape, 255, np.uint8)
        black = np.full(cov.shape, DARK_INK, np.uint8)
        li = Image.fromarray(np.dstack([white, white, white, cov]))
        di = Image.fromarray(np.dstack([black, black, black, cov]))
        box = li.getbbox()
        return li.crop(box), di.crop(box)
    rgb, a = rgba[..., :3].copy(), rgba[..., 3] / 255.0
    value = rgb.max(axis=2)
    ink = np.clip((value - BLACK_MAX) / BLACK_SOFT, 0, 1) * a     # coloured/white printed pixels

    holes = knockout_holes(rgba[..., 3])
    hole_ink = np.where(holes, 1.0 - a, 0.0)                        # knocked-out letters = white ink
    rgb[hole_ink > ink] = 255
    alpha = (np.maximum(ink, hole_ink) * 255).astype(np.uint8)

    light = np.dstack([rgb.astype(np.uint8), alpha])

    sat = (value - rgb.min(axis=2)) / np.maximum(value, 1)
    neutral = sat < NEUTRAL_SAT
    dark_rgb = rgb.copy()
    dark_rgb[neutral] = DARK_INK
    dark = np.dstack([dark_rgb.astype(np.uint8), alpha])

    li, di = Image.fromarray(light), Image.fromarray(dark)
    box = li.getbbox()
    return li.crop(box), di.crop(box)


def black_ink_art(src: Path) -> tuple[Image.Image, Image.Image]:
    """Real art drawn in black ink only (invisible on black garments): the
    original is the white-garment version; neutral ink flips to white for dark ones."""
    rgba = np.asarray(Image.open(src).convert("RGBA")).astype(np.float32)
    rgb, alpha = rgba[..., :3].copy(), rgba[..., 3].astype(np.uint8)
    value = rgb.max(axis=2)
    neutral = (value - rgb.min(axis=2)) / np.maximum(value, 1) < NEUTRAL_SAT
    light_rgb = rgb.copy()
    light_rgb[neutral] = 255
    li = Image.fromarray(np.dstack([light_rgb.astype(np.uint8), alpha]))
    di = Image.fromarray(np.dstack([rgb.astype(np.uint8), alpha]))
    box = li.getbbox()
    return li.crop(box), di.crop(box)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    made = []
    jobs = [(gid, lambda s=s: extract(ROOT / "stickers" / s)) for gid, s in STICKERS.items()]
    jobs += [(gid, lambda s=s: black_ink_art(ROOT / "graphics" / s)) for gid, s in BLACK_INK_ART.items()]
    for gid, job in jobs:
        light, dark = job()
        light.save(OUT / f"{gid}-light.png", optimize=True)
        dark.save(OUT / f"{gid}-dark.png", optimize=True)
        made.append((gid, light, dark))
        print(f"{gid}: {light.size}")

    if "--preview" in sys.argv:
        g = ROOT / "garments"
        tees = [Image.open(g / f"tshirt-{c}-front.png").convert("RGBA") for c in ("black", "grey")]
        white = Image.open(g / "tshirt-white-front.png").convert("RGBA")
        cw, ch = 210, 280
        sheet = Image.new("RGB", (cw * 6, ch * len(made) // 2 + ch), (0xD5, 0xD5, 0xD5))
        for i, (gid, light, dark) in enumerate(made):
            for j, (tee, art) in enumerate(zip(tees + [white], (light, light, dark))):
                t = tee.copy()
                art = art.copy()
                art.thumbnail((int(t.width * 0.42), int(t.height * 0.36)))
                t.alpha_composite(art, ((t.width - art.width) // 2, int(t.height * 0.28)))
                t.thumbnail((cw - 6, ch - 6))
                col = (i % 2) * 3 + j
                sheet.paste(t, (col * cw + 3, (i // 2) * ch + 3), t)
        sheet.save(sys.argv[sys.argv.index("--preview") + 1])


if __name__ == "__main__":
    main()
