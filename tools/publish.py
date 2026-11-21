#!/usr/bin/env python3
"""
發布流程。一個指令把所有雜事做完，但上線那一步預設不會自己發生。

    python tools/publish.py                     檢查 + 轉圖 + 建站，列出這次會上線什麼
    python tools/publish.py --promote <slug>    把 _drafts/<slug>.md 推進 _posts（日期=今天）
    python tools/publish.py --promote all       所有草稿一起推進 _posts
    python tools/publish.py --push              上面全部做完，再 commit + push（真的上線）

預設不碰 git。要真的上線一定得自己加 --push，或是請 Claude 加。

它會做的檢查
------------
1. front matter 必填欄位有沒有漏
2. image: 指到的檔案存不存在、分享用的 -og.jpg 在不在
3. assets/images/ 裡有沒有還沒轉成 WebP 的 PNG/JPG/GIF（有就順手轉掉）
4. 內容裡有沒有字體子集沒收錄的字（有的話會用後備字體呈現，不會破版）
5. jekyll build 會不會失敗

需要 pip install pillow fonttools brotli（轉圖與字體檢查用）
"""
import argparse
import datetime
import pathlib
import re
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"
SERIF = ROOT / "assets" / "fonts" / "genwanmin2tw" / "genwanmin2tw-400.woff2"

REQUIRED = {
    "post": ["layout", "title", "date"],
    "project": ["layout", "title", "date", "description"],
}

problems = []
warnings = []
notes = []


def fail(msg):
    problems.append(msg)


def warn(msg):
    warnings.append(msg)


# ---------------------------------------------------------------- front matter
def read_front_matter(path):
    """極簡 front matter 讀取器。

    只處理這個網站會用到的形式：`key: value`、`key: [a, b]`、空值、# 註解。
    刻意不引入 pyyaml —— 少一個依賴，任何人 clone 下來就能跑。
    巢狀結構（縮排的子鍵）不支援，這個網站的 front matter 也沒有用到。
    """
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return None, text
    end = text.find("\n---", 3)
    if end == -1:
        return None, text
    raw = text[3:end]
    body = text[end + 4:]

    data = {}
    for line in raw.splitlines():
        line = line.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        # 去掉行尾註解（但不要砍到 https:// 這種內容裡的 #）
        if " #" in value and not value.startswith(("http", '"', "'")):
            value = value.split(" #")[0].strip()
        if value.startswith("[") and value.endswith("]"):
            inner = value[1:-1].strip()
            data[key] = [v.strip() for v in inner.split(",") if v.strip()]
        else:
            data[key] = value.strip('"').strip("'")
    return data, body


def content_files():
    out = []
    for d, kind in (("_projects", "project"), ("_posts", "post")):
        for p in sorted((ROOT / d).glob("*.md")):
            out.append((p, kind))
    return out


# ---------------------------------------------------------------- 草稿推進
def promote(which):
    drafts_dir = ROOT / "_drafts"
    if not drafts_dir.exists():
        sys.exit("沒有 _drafts/ 資料夾，沒有草稿可以發布。")

    drafts = sorted(drafts_dir.glob("*.md"))
    if not drafts:
        sys.exit("_drafts/ 是空的，沒有草稿可以發布。")

    if which != "all":
        drafts = [d for d in drafts if d.stem == which]
        if not drafts:
            have = ", ".join(p.stem for p in sorted(drafts_dir.glob("*.md")))
            sys.exit(f"_drafts/ 裡沒有「{which}」。現有草稿：{have}")

    today = datetime.date.today().isoformat()
    posts_dir = ROOT / "_posts"
    posts_dir.mkdir(exist_ok=True)

    for draft in drafts:
        data, body = read_front_matter(draft)
        if data is None:
            sys.exit(f"{draft.name} 沒有 front matter，不能發布。")
        if not data.get("title"):
            sys.exit(f"{draft.name} 的 title 是空的，填好再發布。")

        text = draft.read_text(encoding="utf-8")
        # 把 date: 設成今天（草稿裡的日期是建檔日，發布日才是我們要的）
        if re.search(r"^date:.*$", text, re.M):
            text = re.sub(r"^date:.*$", f"date: {today}", text, count=1, flags=re.M)
        else:
            text = text.replace("---\n", f"---\ndate: {today}\n", 1)

        target = posts_dir / f"{today}-{draft.stem}.md"
        if target.exists():
            sys.exit(f"{target.name} 已經存在，先處理掉再發布。")
        target.write_text(text, encoding="utf-8")
        draft.unlink()
        notes.append(f"草稿發布：{draft.name} -> _posts/{target.name}  (/notes/{draft.stem}/)")


# ---------------------------------------------------------------- 檢查
def check_front_matter():
    for path, kind in content_files():
        data, _ = read_front_matter(path)
        rel = path.relative_to(ROOT)
        if data is None:
            fail(f"{rel}：沒有 front matter")
            continue
        for key in REQUIRED[kind]:
            if not data.get(key):
                fail(f"{rel}：缺少 {key}")
        if data.get("layout") not in ("post", "project"):
            fail(f"{rel}：layout 應該是 post 或 project，現在是 {data.get('layout')!r}")

        image = data.get("image")
        if image:
            img_path = ROOT / image.lstrip("/")
            if not img_path.exists():
                fail(f"{rel}：image 指到不存在的檔案 {image}")
            elif image.endswith(".webp"):
                og = ROOT / image.replace(".webp", "-og.jpg").lstrip("/")
                if not og.exists():
                    fail(f"{rel}：缺少分享用的 {og.relative_to(ROOT)}"
                         f"（跑 python tools/build-images.py --og）")
        elif kind == "project":
            warn(f"{rel}：沒有 image，卡片會是空白的")


def check_images():
    leftovers = [p for p in IMAGES.iterdir()
                 if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".gif")
                 and not p.stem.endswith("-og")]
    if not leftovers:
        return
    names = ", ".join(p.name for p in leftovers)
    notes.append(f"發現還沒轉檔的圖片：{names} —— 轉成 WebP 中")
    r = subprocess.run([sys.executable, str(ROOT / "tools" / "build-images.py"),
                        "--og", *[p.name for p in leftovers]],
                       cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        fail(f"圖片轉檔失敗：\n{r.stdout}\n{r.stderr}")
    else:
        notes.append((r.stdout or "").strip())
        warn("圖片已轉成 WebP，記得把內文與 front matter 裡的副檔名改成 .webp，"
             "確認沒問題之後原始的 PNG/GIF 就可以刪掉")


def check_font_coverage():
    """內容裡有沒有字體子集沒收錄的字。

    有也不會破版（會落到後備分塊），但字形會看得出不一樣。
    """
    if not SERIF.exists():
        warn(f"找不到 {SERIF.relative_to(ROOT)}，跳過字體檢查")
        return
    try:
        from fontTools.ttLib import TTFont
    except ImportError:
        warn("沒有安裝 fonttools，跳過字體檢查")
        return

    cmap = set(TTFont(SERIF, lazy=True).getBestCmap())

    # 用字清單直接跟 build-fonts.py 借，兩邊才不會各算各的而對不起來
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "build_fonts", ROOT / "tools" / "build-fonts.py")
    build_fonts = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(build_fonts)
    used = build_fonts.content_charset()

    missing = sorted(c for c in used
                     if ord(c) > 0x2E7F and ord(c) not in cmap)
    if missing:
        shown = "".join(missing[:40])
        warn(f"有 {len(missing)} 個字不在字體子集裡：{shown}"
             f"{'…' if len(missing) > 40 else ''}\n"
             f"      這些字會用後備字體呈現（不會破版，但字形不同）。\n"
             f"      要修正：下載 GenWanMin2TW 的 R 與 SB，跑\n"
             f"      python tools/build-fonts.py --serif <R.otf> --serif-bold <SB.otf>")


def build():
    r = subprocess.run(["bundle", "exec", "jekyll", "build"],
                       cwd=ROOT, capture_output=True, text=True,
                       encoding="utf-8", errors="replace", shell=True)
    if r.returncode != 0:
        fail("jekyll build 失敗：\n" + (r.stdout or "") + (r.stderr or ""))
        return False
    return True


# ---------------------------------------------------------------- git
def git(*args, capture=True):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=capture,
                          text=True, encoding="utf-8", errors="replace")


def changed_files():
    # -uall：未追蹤的資料夾預設會被收合成一行（?? _posts/），
    # 加上它才看得到裡面每一個檔案。
    r = git("status", "--porcelain", "-uall")
    return [line[3:] for line in r.stdout.splitlines() if line.strip()]


def changed_entries():
    """(狀態碼, 路徑) 的清單。狀態碼 A/?? 代表新增，M 代表修改。"""
    r = git("status", "--porcelain", "-uall")
    out = []
    for line in r.stdout.splitlines():
        if not line.strip():
            continue
        out.append((line[:2].strip(), line[3:].strip().strip('"')))
    return out


def title_of(rel):
    """讀出某篇內容的 title，讀不到就用檔名。"""
    path = ROOT / rel
    if not path.exists():
        return pathlib.Path(rel).stem
    data, _ = read_front_matter(path)
    return (data or {}).get("title") or pathlib.Path(rel).stem


def suggest_message():
    """從實際變更的檔案生一句有內容的 commit 訊息。

    「content: 更新內容 2026-11-21」這種訊息等於什麼都沒說 —— 日期本來就
    記在 commit 裡了。這裡改成講清楚動了什麼：哪一篇札記、哪一個專案。
    """
    new_notes, upd_notes, new_proj, upd_proj = [], [], [], []
    other = set()

    for code, rel in changed_entries():
        rel = rel.replace("\\", "/")
        is_new = code in ("A", "??")
        if rel.startswith("_posts/") and rel.endswith(".md"):
            (new_notes if is_new else upd_notes).append(title_of(rel))
        elif rel.startswith("_projects/") and rel.endswith(".md"):
            (new_proj if is_new else upd_proj).append(title_of(rel))
        elif rel == "_includes/about.md":
            other.add("關於我")
        elif rel.startswith("assets/images/"):
            other.add("圖片")
        elif rel.startswith("assets/fonts/"):
            other.add("字體子集")
        elif rel in ("style.css", "_config.yml") or rel.startswith(("_layouts/", "_includes/")):
            other.add("版型")
        elif rel.startswith("assets/js/"):
            other.add("互動")
        elif rel.startswith("tools/") or rel in ("CLAUDE.md", "publish.bat", ".gitignore"):
            other.add("工具與說明")

    def quote(titles, limit=2):
        shown = "、".join(f"「{t}」" for t in titles[:limit])
        if len(titles) > limit:
            shown += f" 等 {len(titles)} 篇"
        return shown

    parts = []
    if new_notes:
        parts.append(f"新增札記{quote(new_notes)}")
    if upd_notes:
        parts.append(f"更新札記{quote(upd_notes)}")
    if new_proj:
        parts.append(f"新增專案{quote(new_proj)}")
    if upd_proj:
        parts.append(f"更新專案{quote(upd_proj)}")
    for name in ("關於我", "圖片", "互動", "版型", "字體子集", "工具與說明"):
        if name in other:
            parts.append(f"更新{name}" if name in ("關於我", "圖片") else f"調整{name}")

    if not parts:
        return "chore: 零星調整"

    if new_notes or upd_notes or new_proj or upd_proj or "關於我" in other:
        prefix = "content"
    elif other & {"版型", "互動", "圖片"}:
        prefix = "style"
    else:
        prefix = "chore"

    return f"{prefix}: " + "，".join(parts[:3])


def do_push(message):
    branch = git("rev-parse", "--abbrev-ref", "HEAD").stdout.strip()
    git("add", "-A")
    r = git("commit", "-m", message)
    if r.returncode != 0 and "nothing to commit" not in (r.stdout or ""):
        sys.exit("git commit 失敗：\n" + r.stdout + r.stderr)
    r = git("push", "origin", branch)
    if r.returncode != 0:
        sys.exit("git push 失敗：\n" + r.stdout + r.stderr)
    print(f"\n已經推上 origin/{branch}。")
    if branch == "main":
        print("GitHub Pages 大約一到兩分鐘後會重新建好。")
    else:
        print(f"注意：目前在 {branch} 分支，GitHub Pages 只從 main 建置，"
              f"所以網站還沒變。要上線得把 {branch} 合併進 main。")


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--promote", metavar="SLUG",
                    help="把 _drafts/<SLUG>.md 推進 _posts，或用 all 推全部")
    ap.add_argument("--push", action="store_true",
                    help="檢查都通過之後，commit 並推上 GitHub（真的上線）")
    ap.add_argument("-m", "--message",
                    help="commit 訊息。不給的話會依實際變更自動生一句，"
                         "在終端機裡還會讓你改寫")
    ap.add_argument("-y", "--yes", action="store_true",
                    help="不要問，直接用自動生成的 commit 訊息")
    ap.add_argument("-i", "--interactive", action="store_true",
                    help="檢查完當場問要不要上線（publish.bat 用的就是這個）")
    args = ap.parse_args()

    if args.promote:
        promote(args.promote)

    check_front_matter()
    check_images()
    check_font_coverage()
    ok = build() if not problems else False

    print("=" * 60)
    for n in notes:
        if n:
            print(f"  {n}")
    if notes:
        print()

    if problems:
        print("有問題，沒有發布：\n")
        for p in problems:
            print(f"  [錯誤] {p}")
        sys.exit(1)

    for w in warnings:
        print(f"  [提醒] {w}")
    if warnings:
        print()

    files = changed_files()
    if not files:
        print("沒有任何變更，不需要發布。")
        return

    print(f"建站成功。這次會上線的變更（{len(files)} 個檔案）：\n")
    for f in files[:30]:
        print(f"    {f}")
    if len(files) > 30:
        print(f"    …還有 {len(files) - 30} 個")
    print()

    msg = args.message or suggest_message()
    print(f"commit 訊息：{msg}\n")

    # --interactive（publish.bat 用）：檢查只跑一次，當場問要不要上線
    if not args.push and args.interactive and sys.stdin.isatty():
        try:
            ans = input("要發布上線嗎？(y/N) ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            ans = ""
        print()
        if ans != "y":
            print("沒有發布，git 完全沒動。")
            return
        args.push = True

    if not args.push:
        print("沒有動 git。確認上面的清單沒問題之後：\n")
        print("    python tools/publish.py --push")
        print("\n想自己寫 commit 訊息就加 -m：\n")
        print('    python tools/publish.py --push -m "你的訊息"')
        return

    # 在真的終端機裡（例如雙擊 publish.bat）給一次改寫的機會。
    # 被程式呼叫時 stdin 不是 tty，就直接用上面那句，不會卡住。
    if not args.message and not args.yes and sys.stdin.isatty():
        try:
            typed = input("直接按 Enter 用上面這句，或在這裡改寫：\n> ").strip()
        except (EOFError, KeyboardInterrupt):
            typed = ""
        if typed:
            msg = typed
        print()

    do_push(msg)


if __name__ == "__main__":
    main()
