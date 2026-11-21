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

    python tools/build-fonts.py

不給參數時，它會去 tools/fontsrc/ 找來源字體（那個資料夾被 .gitignore
排除，因為每個檔案 20MB 以上）。要放哪些檔案、去哪裡下載，看
tools/fontsrc/README.md。

也可以自己指定路徑：

    python tools/build-fonts.py --serif /path/GenWanMin2TW-R.otf                                 --serif-bold /path/GenWanMin2TW-SB.otf

需要 pip install fonttools brotli
"""
import argparse
import html
import pathlib
import re
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


def rendered_charset():
    """從建好的 _site 取出「真正會被畫到畫面上」的字。

    掃原始碼會連註解、YAML 鍵名、Liquid 標籤裡的字一起算進去。那些字
    永遠不會出現在畫面上，白白撐大字體子集，也會讓「缺字」警告變成
    假警報（例如寫在註解裡的字被報成缺字）。

    _site 還沒建出來時回 None，由呼叫端退回掃原始碼。
    """
    site = ROOT / "_site"
    if not site.is_dir():
        return None
    chars = set()
    found = False
    for page in site.rglob("*.html"):
        found = True
        try:
            text = page.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        text = re.sub(r"<(script|style)\b.*?</\1\s*>", " ", text,
                      flags=re.S | re.I)
        text = re.sub(r"<[^>]*>", " ", text)
        chars |= set(html.unescape(text))
    if not found:
        return None
    return {c for c in chars if ord(c) > 0x1F}


def source_charset():
    """退路：直接掃原始檔。沒有 _site 可用時才會走這條。"""
    chars = set()
    for pattern in CONTENT_GLOBS:
        for path in ROOT.glob(pattern):
            try:
                chars |= set(path.read_text(encoding="utf-8"))
            except (UnicodeDecodeError, OSError):
                continue
    return {c for c in chars if ord(c) > 0x1F}


def content_charset():
    """畫面上真正用到的字元。publish.py 的字體覆蓋檢查也用這個 ——
    用 site_charset() 會把 ALWAYS 裡的保留碼位（例如 U+FF00）也算進去，
    那些字元字體本來就沒有字形，會變成假警報。"""
    rendered = rendered_charset()
    if rendered is not None:
        return rendered
    print("（找不到 _site，改用掃原始碼的方式；跑過 jekyll build 會更準）")
    return source_charset()


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


FONTSRC = ROOT / "tools" / "fontsrc"
DEFAULTS = {
    "serif": FONTSRC / "GenWanMin2TW-R.otf",
    "serif_bold": FONTSRC / "GenWanMin2TW-SB.otf",
    "maple": FONTSRC / "MapleMono-CN-Regular.ttf",
}


def resolve(given, key):
    """沒給路徑就用 tools/fontsrc/ 底下的預設檔；找不到就回 None。"""
    if given:
        path = pathlib.Path(given)
        if not path.exists():
            sys.exit(f"找不到 {path}")
        return path
    default = DEFAULTS[key]
    return default if default.exists() else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--maple", nargs="?", const="", help="MapleMono-CN-Regular.ttf")
    ap.add_argument("--serif", nargs="?", const="", help="GenWanMin2TW-R.otf（內文 400）")
    ap.add_argument("--serif-bold", dest="serif_bold", nargs="?", const="",
                    help="GenWanMin2TW-SB.otf（內文 700）")
    args = ap.parse_args()

    # 完全沒給參數：把 tools/fontsrc/ 裡找得到的通通重建
    serif = resolve(args.serif, "serif")
    serif_bold = resolve(args.serif_bold, "serif_bold")
    maple = resolve(args.maple, "maple")

    if not any([serif, serif_bold, maple]):
        src = FONTSRC.relative_to(ROOT).as_posix()
        sys.exit(
            "找不到任何來源字體。\n\n"
            f"把字體檔放進 {src}/ 之後再跑一次，\n"
            f"需要哪些檔案、去哪裡下載寫在 {src}/README.md。\n"
            "或是自己指定路徑：python tools/build-fonts.py --serif <路徑>"
        )

    fonts_dir = ROOT / "assets" / "fonts"
    fonts_dir.mkdir(parents=True, exist_ok=True)

    if serif or serif_bold:
        chars = site_charset()
        cjk = sum(1 for c in chars if "一" <= c <= "鿿")
        print(f"網站用字：{len(chars)} 個（其中漢字 {cjk} 個）")
        codes = ",".join("U+%04X" % ord(c) for c in sorted(chars))
        serif_dir = fonts_dir / "genwanmin2tw"
        serif_dir.mkdir(parents=True, exist_ok=True)
        if serif:
            subset(serif, serif_dir / "genwanmin2tw-400.woff2",
                   codes, "GenWanMin2 TW 400")
        if serif_bold:
            subset(serif_bold, serif_dir / "genwanmin2tw-700.woff2",
                   codes, "GenWanMin2 TW 700")

    if maple:
        subset(maple, fonts_dir / "maple-mono-latin.woff2",
               MAPLE_RANGES, "Maple Mono 拉丁")

    print("\n完成。assets/fonts/fonts.css 不需要改，檔名是固定的。")


if __name__ == "__main__":
    sys.exit(main())
