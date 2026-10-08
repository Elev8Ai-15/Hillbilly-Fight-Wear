"""Turn the builder's thermal FRONT mockups from henleys into plain crew thermals.

HFW thermals have no buttons (Brad 10/08), but thermal-{black,grey}-front.png
were henley shots. Run on the ORIGINAL henley files (git history, before 10/08):
  1. Collar: the henley band end crosses diagonally on the right of centre, so the
     clean LEFT half of the collar is mirrored onto the right (crew necks are symmetric).
  2. Button placket + tab: knit texture copied from SHIFT px to the left (kept
     un-averaged so the dithered grain matches), its shading replaced by a
     left-to-right blend of the fabric just outside the box. Soft edges.
White is generated from grey afterwards: run scripts/whiten_garments.py.

Usage: python scripts/remove_henley_placket.py
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

DIR = Path(__file__).resolve().parent.parent / "public" / "images" / "garments"

# Calibration knobs (597x800 thermal front shots)
CENTRE_X = 300                  # garment centre line (collar mirror axis)
COLLAR = (300, 150, 358, 199)   # right half of collar replaced by mirror of the left
BODY = (274, 197, 334, 320)     # placket + tab box
SHIFT = 64                      # px left to copy knit texture from (must clear the box)
SHADE_BLUR = 7                  # sigma separating shading from texture
EDGE = 6                        # px sampled each side of BODY for target shading
FEATHER = 2.0                   # sigma of the soft edge on both patches


def soft_paste(a: np.ndarray, patch: np.ndarray, box: tuple) -> np.ndarray:
    x0, y0, x1, y1 = box
    m = np.zeros(a.shape[:2], np.float32)
    m[y0:y1, x0:x1] = 1
    m = cv2.GaussianBlur(m, (0, 0), FEATHER)[..., None]
    full = a.copy()
    full[y0:y1, x0:x1] = patch
    return a * (1 - m) + full * m


def fix(path: Path) -> None:
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)

    # 1. collar: mirror the left half across the centre line
    cx0, cy0, cx1, cy1 = COLLAR
    src_cols = [2 * CENTRE_X - x for x in range(cx0, cx1)]
    a = soft_paste(a, a[cy0:cy1, src_cols], COLLAR)

    # 2. placket body
    x0, y0, x1, y1 = BODY
    blur = cv2.GaussianBlur(a, (0, 0), SHADE_BLUR)
    detail = a[y0:y1, x0 - SHIFT:x1 - SHIFT] - blur[y0:y1, x0 - SHIFT:x1 - SHIFT]
    left = blur[y0:y1, x0 - EDGE:x0].mean(axis=1, keepdims=True)
    right = blur[y0:y1, x1:x1 + EDGE].mean(axis=1, keepdims=True)
    t = np.linspace(0, 1, x1 - x0)[None, :, None]
    a = soft_paste(a, left * (1 - t) + right * t + detail, BODY)

    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(path, optimize=True)
    print(f"{path.name}: placket removed")


if __name__ == "__main__":
    for colour in ("black", "grey"):
        fix(DIR / f"thermal-{colour}-front.png")
