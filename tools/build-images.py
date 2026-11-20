#!/usr/bin/env python3
"""
把 assets/images/ 裡的 PNG / JPG / GIF 轉成網站要用的格式。

每張圖會產生兩個檔案：

  xxx.webp      頁面上顯示用。WebP 比 PNG 小一個數量級。
  xxx-og.jpg    社群分享卡用，固定 1200x630，底色是網站的紙白。
                為什麼還要 JPEG：LinkedIn 的爬蟲對 WebP 支援仍不穩定，
                而你的 footer 有 LinkedIn，求職時分享卡壞掉很可惜。

用法：
    python tools/build-images.py                     # 轉換所有還沒轉過的圖
    python tools/build-images.py shelf_mockup_1.png  # 只轉指定的圖
    python tools/build-images.py --og shelf_mockup_card.png   # 順便產生分享圖

轉完之後，記得把 markdown 與 front matter 裡的副檔名改成 .webp。
front matter 的 image: 只要寫 .webp，版型會自己去找對應的 -og.jpg。

需要 pip install pillow
"""
import argparse
import pathlib
import sys

from PIL import Image, ImageSequence

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"
PAPER = (250, 249, 246)          # --color-bg
QUALITY_PHOTO = 82               # 一般圖片
QUALITY_DETAIL = 92              # 含細線、小字的截圖
DETAIL_HINT = ("mockup_1", "screenshot", "ui")


def flatten(im):
    """把透明背景壓成紙白，避免 WebP 透明區在深色模式下變黑。"""
    im = im.convert("RGBA")
    bg = Image.new("RGBA", im.size, PAPER + (255,))
    return Image.alpha_composite(bg, im).convert("RGB")


def write_og(im, stem):
    canvas = Image.new("RGB", (1200, 630), PAPER)
    fitted = im.copy()
    fitted.thumbnail((1200, 630), Image.LANCZOS)
    canvas.paste(fitted, ((1200 - fitted.width) // 2, (630 - fitted.height) // 2))
    out = IMAGES / f"{stem}-og.jpg"
    canvas.save(out, "JPEG", quality=86, optimize=True, progressive=True)
    return out


def convert(path, make_og):
    stem = path.stem
    im = Image.open(path)
    out = IMAGES / f"{stem}.webp"

    if getattr(im, "n_frames", 1) > 1:
        frames, durations = [], []
        for i, frame in enumerate(ImageSequence.Iterator(im)):
            frames.append(frame.convert("RGBA"))
            durations.append(frame.info.get("duration", 80))
        frames[0].save(out, "WEBP", save_all=True, append_images=frames[1:],
                       duration=durations, loop=0, quality=72, method=6)
        still = flatten(Image.open(path).convert("RGBA"))
    else:
        quality = QUALITY_DETAIL if any(h in stem for h in DETAIL_HINT) else QUALITY_PHOTO
        still = flatten(im)
        still.save(out, "WEBP", quality=quality, method=6)

    before = path.stat().st_size / 1024
    after = out.stat().st_size / 1024
    print(f"  {path.name:34s} {before:7.0f} KB -> {out.name:30s} {after:7.0f} KB")

    if make_og:
        og = write_og(still, stem)
        print(f"  {'':34s} {'':7s}    {og.name:30s} {og.stat().st_size / 1024:7.0f} KB")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="*", help="要轉的檔名（不給就轉全部）")
    ap.add_argument("--og", action="store_true", help="同時產生 1200x630 分享圖")
    args = ap.parse_args()

    if args.files:
        targets = [IMAGES / f for f in args.files]
    else:
        targets = [p for p in sorted(IMAGES.iterdir())
                   if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".gif")]

    if not targets:
        print("assets/images/ 裡沒有需要轉換的 PNG / JPG / GIF。")
        return

    for p in targets:
        if not p.exists():
            print(f"  找不到 {p.name}", file=sys.stderr)
            continue
        convert(p, args.og)

    print("\n完成。確認 .webp 沒問題之後，原始的 PNG/GIF 就可以刪掉了。")


if __name__ == "__main__":
    main()
