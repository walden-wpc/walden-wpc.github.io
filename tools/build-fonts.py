#!/usr/bin/env python3
"""
重建網站字體（Maple Mono 拉丁子集 + GenWanMin2 TW 內文子集）。

為什麼要這支程式
----------------
中日韓字體動輒 10-20MB。這個網站的做法是兩層：

  第一層  genwanmin2tw/genwanmin2tw-400.woff2 與 -700.woff2
          只含「網站現有內容真正用到的字」（約 800 個漢字），
          每個字重約 390KB，一次下載整站共用。
          700 的來源是原字體的 SB（SemiBold）—— GenWanMin 沒有真 Bold，
          而中文內文用真 Bold 會糊成黑塊，SemiBold 才是正解。

  第二層  noto-serif-tc/ 底下的 108 個分塊（Google Fonts 的 unicode-range 切法）
          當你寫了新文章、出現第一層沒有的字時，瀏覽器只會去抓
          那一個分塊（幾十 KB），畫面不會破。

所以「忘記重跑這支程式」不會壞掉，只是會多下載一個分塊。
想讓它回到最省的狀態，加完內容後跑一次就好：

    python tools/build-fonts.py --maple <MapleMono-CN-Regular.ttf 的路徑> \
                                --serif <NotoSerifTC[wght].ttf 的路徑>

兩個來源字體檔都不在 repo 裡（太大）。需要時再下載：
  Maple Mono CN : https://github.com/subframe7536/maple-font/releases
  Noto Serif TC : https://github.com/google/fonts/tree/main/ofl/notoseriftc

需要 pip install fonttools brotli
"""
import argparse
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# 掃描這些檔案，取出網站實際用到的字。
# _drafts 也掃：這樣草稿發布的當下不需要再重建一次字體。
CONTENT_GLOBS = [
    "_projects/*.md", "_posts/*.md", "_drafts/*.md",
    "_includes/*.md", "_includes/*.html",
    "_layouts/*.html", "*.html", "_config.yml",
]

# 不管內容有沒有用到都一定要收進來的範圍
ALWAYS = (
    list(range(0x0020, 0x007F)) +      # ASCII
    list(range(0x00A0, 0x0180)) +      # Latin-1 + Latin Extended-A（人名的重音字母）
    list(range(0x2000, 0x2070)) +      # 一般標點（— – ' ' " " …）
    list(range(0x2190, 0x21A0)) +      # 箭頭 → ↗
    list(range(0x3000, 0x3040)) +      # 中日韓標點 、。「」〈〉
    list(range(0xFF00, 0xFF65))        # 全形英數與標點
)

# Maple Mono 只負責拉丁與符號，中日韓一律交給 Noto Serif TC
MAPLE_RANGES = (
    "U+0000-024F,U+2000-206F,U+2070-209F,U+20A0-20CF,U+2100-214F,"
    "U+2190-21FF,U+2200-22FF,U+2300-23FF,U+2500-257F,U+2580-259F,"
    "U+25A0-25FF,U+2600-26FF,U+2700-27BF"
)


def content_charset():
    """內容檔案裡真正出現過的字元。publish.py 的字體覆蓋檢查用這個 ——
    用 site_charset() 會把 ALWAYS 裡的保留碼位（例如 U+FF00）也算進去，
    那些字元字體本來就沒有字形，會變成假警報。"""
    chars = set()
    for pattern in CONTENT_GLOBS:
        for path in ROOT.glob(pattern):
            try:
                chars |= set(path.read_text(encoding="utf-8"))
            except (UnicodeDecodeError, OSError):
                continue
    return {c for c in chars if ord(c) > 0x1F}


def site_charset():
    """子集化要收的字 = 內容用到的字 + 一定要有的範圍。"""
    return content_charset() | {chr(c) for c in ALWAYS}


def subset(src, out, unicodes, label):
    from fontTools import subset as fts

    args = [
        str(src),
        "--unicodes=" + unicodes,
        "--layout-features=*",
        "--flavor=woff2",
        "--output-file=" + str(out),
    ]
    fts.main(args)
    size = out.stat().st_size / 1024
    print(f"  {label:<22} {size:7.1f} KB  -> {out.relative_to(ROOT)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--maple", help="MapleMono-CN-Regular.ttf")
    ap.add_argument("--serif", help="GenWanMin2TW-R.otf（內文 400）")
    ap.add_argument("--serif-bold", dest="serif_bold",
                    help="GenWanMin2TW-SB.otf（內文 700）")
    args = ap.parse_args()

    if not any([args.maple, args.serif, args.serif_bold]):
        ap.error("至少要給 --maple / --serif / --serif-bold 其中一個")

    fonts_dir = ROOT / "assets" / "fonts"
    fonts_dir.mkdir(parents=True, exist_ok=True)

    if args.serif or args.serif_bold:
        chars = site_charset()
        cjk = sum(1 for c in chars if "一" <= c <= "鿿")
        print(f"網站用字：{len(chars)} 個（其中漢字 {cjk} 個）")
        codes = ",".join("U+%04X" % ord(c) for c in sorted(chars))
        serif_dir = fonts_dir / "genwanmin2tw"
        serif_dir.mkdir(parents=True, exist_ok=True)
        if args.serif:
            subset(pathlib.Path(args.serif),
                   serif_dir / "genwanmin2tw-400.woff2", codes, "GenWanMin2 TW 400")
        if args.serif_bold:
            subset(pathlib.Path(args.serif_bold),
                   serif_dir / "genwanmin2tw-700.woff2", codes, "GenWanMin2 TW 700")

    if args.maple:
        subset(pathlib.Path(args.maple), fonts_dir / "maple-mono-latin.woff2",
               MAPLE_RANGES, "Maple Mono 拉丁")

    print("\n完成。assets/fonts/fonts.css 不需要改，檔名是固定的。")


if __name__ == "__main__":
    sys.exit(main())
