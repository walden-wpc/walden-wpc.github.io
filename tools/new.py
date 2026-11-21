#!/usr/bin/env python3
"""
開一個新的札記或專案，front matter 直接填好。

    python tools/new.py note "把想法做成東西的成本" --slug cost-of-making
    python tools/new.py project "某某工具" --slug my-tool

札記會建在 _drafts/ —— Jekyll 不會把 _drafts 建出去，所以在你按下發布之前，
它不會出現在網站上。寫完之後用 tools/publish.py --promote 把它推進 _posts。

專案直接建在 _projects/（專案通常是寫完才建檔，沒有草稿階段）。

--slug 是網址用的英文短名：
    _posts/2026-11-18-cost-of-making.md  ->  /notes/cost-of-making/
    _projects/my-tool.md                 ->  /projects/my-tool/
標題是中文時一定要自己給，否則網址會變成一串編碼過的中文，分享出去很醜。
"""
import argparse
import datetime
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

NOTE_TEMPLATE = """---
layout: post
title: {title}
subtitle:
date: {date}
# image: /assets/images/xxx.webp     # 選用。放了就會出現在標題下方
---

在這裡寫第一段。

## 小節標題

內文。
"""

PROJECT_TEMPLATE = """---
layout: project
title: {title}
date: {date}
description:          # 一句話，會出現在卡片上與分享卡片的描述
spend:                # 選填。做出「第一個能用的版本」花了多久，例如 3 days
                      # 研究型／長期專案不要填這個，改填 started
started:              # 選填。專案起點，例如 2023。顯示成「2023 – 2025.11」
updated:              # 選填。最後一次實質更新，例如 2026.11
tags: []              # 最多 6 個，例如 [Vanilla JS, D3.js]
image:                # /assets/images/xxx.webp，卡片縮圖與分享圖都用這張
githubUrl:
liveUrl:
featured: false       # true 會置頂，而且會出現在首頁
math: false           # true 才載入 KaTeX
---

## 這是什麼？爲什麼要做？

內文。

## 技術選擇

內文。
"""


def slugify(text):
    s = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("kind", choices=["note", "project"])
    ap.add_argument("title")
    ap.add_argument("--slug", help="網址用的英文短名（標題是中文時必填）")
    ap.add_argument("--date", help="YYYY-MM-DD，預設今天")
    args = ap.parse_args()

    date = args.date or datetime.date.today().isoformat()
    try:
        datetime.date.fromisoformat(date)
    except ValueError:
        sys.exit(f"日期格式不對：{date}（要 YYYY-MM-DD）")

    slug = args.slug or slugify(args.title)
    if not slug:
        sys.exit(
            "標題裡沒有可以拿來做網址的英文字，請自己給一個：\n"
            f'    python tools/new.py {args.kind} "{args.title}" --slug your-slug'
        )

    if args.kind == "note":
        target = ROOT / "_drafts" / f"{slug}.md"
        body = NOTE_TEMPLATE.format(title=args.title, date=date)
        where = "草稿，不會出現在網站上"
        nexts = (
            f"1. 編輯 {target.relative_to(ROOT)}\n"
            f"2. 預覽：bundle exec jekyll serve --drafts\n"
            f"3. 發布：python tools/publish.py --promote {slug}"
        )
    else:
        target = ROOT / "_projects" / f"{slug}.md"
        body = PROJECT_TEMPLATE.format(title=args.title, date=date)
        where = "專案"
        nexts = (
            f"1. 編輯 {target.relative_to(ROOT)}（description / spend / tags / image 都要填）\n"
            f"2. 圖片放進 assets/images/ 之後跑：python tools/build-images.py --og\n"
            f"3. 發布：python tools/publish.py"
        )

    if target.exists():
        sys.exit(f"檔案已經存在：{target.relative_to(ROOT)}")

    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(body, encoding="utf-8")

    print(f"建好了（{where}）：{target.relative_to(ROOT)}")
    print()
    print(nexts)


if __name__ == "__main__":
    main()
