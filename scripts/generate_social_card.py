from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W = H = 1200
BG = (19, 20, 23)
WHITE = (248, 248, 248)
PINK = (255, 51, 142)
MUTED = (190, 185, 190)

def font(candidates, size):
    for p in candidates:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

bold_paths = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
]
regular_paths = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
]

img = Image.new("RGB", (W, H), BG)

glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse((245, 310, 955, 1010), fill=(255, 51, 142, 22))
glow = glow.filter(ImageFilter.GaussianBlur(90))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
draw = ImageDraw.Draw(img)

booked_font = font(bold_paths, 178)
af_font = font(bold_paths, 180)
booked = "BOOKED"
af = "AF"
gap = 24
bw = draw.textlength(booked, font=booked_font)
aw = draw.textlength(af, font=af_font)
x = (W - (bw + gap + aw)) / 2
y = 430
draw.text((x, y), booked, font=booked_font, fill=WHITE)
draw.text((x + bw + gap, y), af, font=af_font, fill=PINK)

sub = "BOOKED & FABULOUS"
sub_font = font(regular_paths, 34)
tracking = 10
widths = [draw.textlength(ch, font=sub_font) for ch in sub]
sx = (W - (sum(widths) + tracking * (len(sub) - 1))) / 2
cx = sx
for ch, w in zip(sub, widths):
    draw.text((cx, 628), ch, font=sub_font, fill=MUTED)
    cx += w + tracking

draw.rounded_rectangle(((W - 170) / 2, 710, (W + 170) / 2, 718), radius=4, fill=PINK)

tag_font = font(bold_paths, 49)
for i, line in enumerate(("YOUR TALENT SHOULD", "BUY YOU FREEDOM.")):
    tw = draw.textlength(line, font=tag_font)
    draw.text(((W - tw) / 2, 760 + i * 70), line, font=tag_font, fill=WHITE)

out = Path("assets/booked-af-social.png")
out.parent.mkdir(parents=True, exist_ok=True)
img.save(out, optimize=True)
print(f"Wrote {out} ({out.stat().st_size} bytes)")
