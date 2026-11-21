# Walden — 給接手的人（或 agent）

這是張文柏（walden-wpc）的個人網站，Jekyll + GitHub Pages，網址
<https://walden-wpc.github.io>。

這份檔案是**流程的約定**。任何 agent 或人只要讀完這一份，就能自己完成
「新增內容 → 檢查 → 發布」的全程，不需要問上一個人做了什麼。
如果你改了流程，請回頭把這份改掉。

---

## 最重要的三條規則

1. **GitHub Pages 只從 `main` 分支建置。** 推上 `main` ＝ 網站就變了。
   推到其他分支完全不影響線上。
2. **`git push` 到 `main` 之前一定要先問本人。** 使用者的明確指示是
   「可以 push，但每次先問」。把這次會上線的變更列給他看，等他說可以。
   其他 git 操作（add / commit / 開分支）不用問。
3. **不要憑空幫他寫內容。** 這是求職用的作品集。整理、潤稿、排版可以；
   捏造經歷、專案、數字絕對不行。不確定的地方問他。

---

## 內容放哪

| 類型 | 資料夾 | 網址 | 版型 |
|------|--------|------|------|
| 專案（作品） | `_projects/<slug>.md` | `/projects/<slug>/` | `project` |
| 札記（文章、思考） | `_posts/<YYYY-MM-DD>-<slug>.md` | `/notes/<slug>/` | `post` |
| 草稿 | `_drafts/<slug>.md` | 不會出現在網站上 | — |
| 關於我 | `_includes/about.md` | 首頁 About 區塊 | — |
| 首頁水面上的文案 | `_config.yml` 的 `hero:` | — | — |

`slug` 是網址用的英文短名，自己取，要簡短好記。**中文標題不要直接拿來當
檔名**，網址會變成一串編碼過的中文，分享出去很醜。

`_drafts/` 被 `.gitignore` 排除，不會進 repo。這是故意的 —— repo 是公開的，
沒寫完的想法不該讓所有人看到。草稿只存在這台電腦上。

---

## Front matter

### 札記（`_posts/`）

```yaml
---
layout: post
title: 標題                      # 必填
subtitle: 副標                   # 選填，會顯示在標題下方
date: 2026-11-21                 # 必填，YYYY-MM-DD
image: /assets/images/xxx.webp   # 選填，會顯示在內文上方
---
```

### 專案（`_projects/`）

```yaml
---
layout: project
title: 專案名稱                   # 必填
date: 2026-04-20                 # 必填
description: 一句話說明           # 必填，卡片與分享卡都用這句
spend: 15 days                   # 選填，顯示成「耗時 15 days」
tags: [Next.js, MapLibre]        # 選填，卡片只顯示前 3 個
image: /assets/images/xxx.webp   # 選填但強烈建議，沒有卡片會是空白
githubUrl:                       # 選填
liveUrl:                         # 選填
featured: false                  # true = 置頂，而且會出現在首頁
math: false                      # true 才載入 KaTeX（$...$ 數學式）
---
```

---

## 內文怎麼寫

刻意保持簡單。一篇札記就是：**標題 + 副標（選用）+ 幾段內文 + 圖（選用）**。

- `##` 是小節標題，`###` 再往下一層。**不要用 `#`** —— 頁面標題已經是 h1 了。
- 段落之間空一行。
- `**粗體**` 用來強調關鍵句，不要整段都粗。
- 圖片：`![說明](/assets/images/xxx.webp)`
- `_config.yml` 設了 `kramdown: hard_wrap: true`，**單一換行會變成實際換行**。
  想要一個段落就不要在中間亂斷行。

### 「標籤 → 內容」的成對資料（例如 Skills）

用定義清單，**不要用表格**。兩欄表格在窄螢幕一定會把中文擠成
「資料分/析/統/計」，而這種資料本來就是一組一組的，堆疊才是它真正的結構：

```markdown
資料分析／統計
: Python, NumPy, statsmodels

神經影像
: diffusion MRI, tractography
```

標籤會用襯線（人的聲音），內容用 Maple Mono（機器的聲音），
桌機和手機長得一樣。

真的需要多欄表格時照常寫 markdown 表格就好 —— `walden.js` 會依欄數
自動處理（兩欄在窄螢幕堆疊，三欄以上包成可橫向捲動）。

---

## 完整流程

### 寫一篇札記

```bash
python tools/new.py note "標題" --slug your-slug
```

建在 `_drafts/your-slug.md`。編輯內容，要預覽草稿的話：

```bash
bundle exec jekyll serve --drafts
```

寫好要發布：

```bash
python tools/publish.py --promote your-slug
```

這會把草稿移進 `_posts/`、日期設成今天、跑完所有檢查並建站，然後列出
這次會上線什麼。**它不會動 git。**

### 新增一個專案

```bash
python tools/new.py project "專案名稱" --slug your-slug
```

填好 front matter（`description` / `spend` / `tags` / `image` 都要填），
圖片放進 `assets/images/`，然後：

```bash
python tools/build-images.py --og
```

這會轉成 WebP 並產生 1200×630 的 `-og.jpg` 分享圖。**front matter 的
`image:` 要寫 `.webp` 那個**，版型會自己去找對應的 `-og.jpg`。

### 發布

```bash
python tools/publish.py
```

檢查項目：front matter 必填欄位、`image:` 指到的檔案在不在、分享圖在不在、
有沒有還沒轉檔的 PNG/GIF、有沒有字體子集沒收錄的字、`jekyll build` 會不會失敗。

確認清單沒問題之後 —— **先問本人** —— 才：

```bash
python tools/publish.py --push
```

Windows 上也可以直接雙擊 `publish.bat`，它會跑檢查、把結果列出來、問你要不要上線。

---

## 字體

內文是 GenWanMin2 TW 源雲明體，自架，而且**只收錄網站實際用到的字**
（約 800 個漢字，400/700 各約 400KB）。全字集是 21MB，不可能整包丟上去。

寫了新內容出現新字的時候，`publish.py` 會提醒你。這時候網站**不會破版** ——
缺的字會落到 Noto Serif TC 的 108 個分塊後備，看得出字形不同但讀得到。

要讓它回到最省、字形也統一的狀態：

```bash
python tools/build-fonts.py
```

來源字體（每個 21MB）放在 `tools/fontsrc/`，那個資料夾被 `.gitignore` 排除。
換電腦或清掉之後要重新下載，需要哪些檔案寫在 `tools/fontsrc/README.md`。
下載點：<https://github.com/ButTaiwan/genwan-font/releases> 的 `GenWanMin2TW-otf.zip`。

---

## 這個網站的設計邏輯（改東西之前先讀）

- **Paper & Ink**：只有黑白灰階，米白紙底。不要加顏色。
- **全站的中文只有一種字體**：源雲明體。分成兩種聲音的是拉丁字母 ——
  `--font-ui` 的拉丁是 Maple Mono（機器的聲音：導覽、標籤、meta、tag、按鈕、表格），
  `--font-prose` 的拉丁是源雲明體（人的聲音：內文與標題）。
  唯一的例外是 `--font-code`（`<code>` / `<pre>`），那裡的中文落到系統無襯線 ——
  程式碼區塊裡出現襯線中文會很怪。
  要加新元素時，中文一律用源雲明體，不要再引入第三種中文字體。
- **ASCII 是整站的視覺語言**，不只是首頁的裝飾。字元梯度 ` .:-+*=%@#`
  出現在：首頁水面、專案圖片的顯影動畫、區塊標題右側的衰減線、頁尾的岸線。
  要加新的視覺元素，先想能不能用這套語言表達。
- **版面一條左線**：首頁所有區塊（水面、專案、札記、關於我）左邊界對齊同一條線。
  文章頁的閱讀欄才置中。
- 所有字級與間距都是 `clamp()` 流體值，定義在 `style.css` 的 `:root`。
  不要寫死 px。

---

## 出事了怎麼辦

線上版本的備份（改版前的狀態）：

- tag `backup-live-20261121`
- 分支 `backup/live-20261121`（本機 + GitHub 都有）
- 完整資料夾壓縮檔：`../easy_web_BACKUP_20261121.tar.gz`

退回上線前的版本：

```bash
git checkout main && git reset --hard backup-live-20261121 && git push --force origin main
```

更多情況寫在 `_note/ROLLBACK.md`（這個資料夾是 gitignore 的，只在本機）。

---

## 環境

- Ruby + Jekyll 4.3（`bundle exec jekyll serve` 預覽，預設 <http://localhost:4000>）
- Python 3：`pip install pillow fonttools brotli`（轉圖與字體子集化用）
- 本機 git 身分設在 repo 內（沒有全域 `.gitconfig`）
