"""Generate PWA icon PNGs from the SVG concept using Pillow (no Cairo needed)."""

from PIL import Image, ImageDraw
from pathlib import Path
import math

OUTPUT = Path("C:/dev/learnpod/public/icons")
OUTPUT.mkdir(parents=True, exist_ok=True)

SIZES = [48, 72, 96, 128, 144, 152, 192, 384, 512]
BASE = 512  # Design at 512, scale down

# Colors from the brand
BG = (19, 16, 13)          # #13100d
AMBER = (245, 166, 35)     # #f5a623
AMBER_LIGHT = (255, 208, 122)  # #ffd07a
AMBER_DARK = (212, 133, 10)    # #d4850a


def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def draw_icon(size=BASE):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    s = size / BASE  # scale factor

    # Background rounded rect
    r = int(112 * s)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG)

    # Draw the pod/seed shape using an ellipse-based approach
    # The pod is a vertical oval, slightly tapered at top, wider at bottom-center
    # We'll approximate with a filled polygon

    # Generate pod outline points — flame/seed shape
    # Sharp point at top, swells to wide rounded belly, smooth rounded bottom
    points = []
    cx = 256 * s
    top_y = 88 * s      # tip — higher up for elongated feel
    bottom_y = 408 * s   # bottom of the pod
    max_width = 112 * s  # half-width at widest point

    for i in range(300):
        t = i / 299  # 0 to 1, top to bottom
        y = top_y + t * (bottom_y - top_y)

        # Flame/seed: sharp top (high power), wide belly at ~65%, smooth round bottom
        # t^1.5 gives a sharper point at top than t^0.45
        skew = t ** 1.4 * (1 - t) ** 0.45
        # Normalize — max of t^1.4*(1-t)^0.45 is around t≈0.757
        # max ≈ 0.757^1.4 * 0.243^0.45 ≈ 0.688 * 0.524 ≈ 0.361
        w = max_width * skew / 0.361

        points.append((cx + w, y))

    # Add the right side, then reverse for left side
    right_points = points[:]
    left_points = [(cx - (x - cx), y) for x, y in reversed(points)]

    pod_outline = right_points + left_points

    if len(pod_outline) >= 3:
        # Fill with gradient approximation (draw horizontal slices)
        for i in range(len(right_points) - 1):
            rx1, ry1 = right_points[i]
            rx2, ry2 = right_points[i + 1]
            lx1 = cx - (rx1 - cx)
            lx2 = cx - (rx2 - cx)

            t = i / max(1, len(right_points) - 1)
            # Gradient: light amber at top, amber middle, dark amber at bottom
            if t < 0.4:
                color = lerp_color(AMBER_LIGHT, AMBER, t / 0.4)
            else:
                color = lerp_color(AMBER, AMBER_DARK, (t - 0.4) / 0.6)

            # Draw a small quad as polygon
            poly = [(lx1, ry1), (rx1, ry1), (rx2, ry2), (lx2, ry2)]
            draw.polygon(poly, fill=color)

    return img


# Generate base icon
print("Generating base 512x512 icon...")
base_icon = draw_icon(512)
base_icon.save(str(OUTPUT / "icon-512.png"), "PNG")
print(f"  Created: icon-512.png (512x512)")

# Resize for all other sizes
for sz in SIZES:
    if sz == 512:
        continue
    resized = base_icon.resize((sz, sz), Image.LANCZOS)
    resized.save(str(OUTPUT / f"icon-{sz}.png"), "PNG")
    print(f"  Created: icon-{sz}.png ({sz}x{sz})")

print(f"\nDone! {len(SIZES)} icons generated in {OUTPUT}")
