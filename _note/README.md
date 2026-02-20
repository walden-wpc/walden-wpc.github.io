# 您的個人網站 - Zen Minimalism (Jekyll Edition)

這是一個基於 [Jekyll](https://jekyllrb.com/) 的自動化個人網站。
最大的特色是**完全支援手機編輯**與**自動化排版**。

## 📱 手機編輯 / 快速發文流程 (Mobile Workflow)

您不需要寫任何 HTML 程式碼，也不用手動更新首頁。
只要上傳一個「純文字檔」到 `_posts` 資料夾，網站就會自動更新。

### 1. 建立新文章
在 `_posts` 資料夾中建立一個新檔案，檔名格式必須為：`YYYY-MM-DD-標題-英文.md`
例如：`2026-02-18-my-thought.md`

### 2. 填寫開頭資訊 (Front Matter)
在檔案最上方，貼上以下對應的區塊：

**[A. 發佈隨想 Fragment]**
適合：靈感、短筆記。直接在首頁顯示內容。
```yaml
---
layout: default
title: Fragment
date: 2026-02-18
category: Fragment
type: Idea  # 或 Experiment, Note
---
這裡寫您的內容...
```

**[B. 發佈論述 Essay]**
適合：讀書心得、長篇文章。首頁只會顯示標題。
```yaml
---
layout: post
title: 我的讀書心得
date: 2026-02-18
category: Essay
---
這裡寫您的文章內容...
```

**[C. 發佈專案 Project]**
適合：作品展示。首頁顯示卡片。
```yaml
---
layout: project
title: 專案名稱
date: 2026-02-18
category: Project
role: Developer
description: 簡短的專案介紹
---
這裡寫詳細的開發過程...
```

## 🖼 關於圖片 (Handling Images)
本網站使用標準的靜態檔案管理方式：

1. **建立資料夾**：我已為您建立了 `assets/images/` 資料夾。
2. **放置圖片**：將您的圖片檔（例如 `my-project.jpg`）丟進去。
3. **在文章中引用**：
   - **Markdown 語法**： `![圖片描述](/assets/images/my-project.jpg)`
   - **Project Front Matter**： `image: /assets/images/my-project.jpg`

### 💡 手機上傳小撇步 (GitHub Mobile)
如果您使用 GitHub App 編輯：
- 在編輯 Markdown 時，點擊鍵盤上方的 **圖片圖示**。
- 選擇手機相簿中的照片。
- GitHub 會自動上傳並生成連結（如 `![image](https://user-images.githubusercontent.com/...)`）。
- **這是最推薦的方式**，完全不需要管檔案路徑！

## 📝 如何發佈新文章 (Jekyll 流程)

### 方法 A：GitHub 網頁版 / 手機版 (最推薦)
1. 進入 `_posts` 資料夾。
2. 點擊 `Add file` -> `Create new file`。
3. 檔名輸入：`2026-MM-DD-標題英譯.md`。
4. 內容貼上對應的 Front Matter (參考上方範例)。
5. 寫完後點擊 `Commit changes`。

### 方法 B：VS Code (電腦版)
如果您習慣用電腦寫作，我更新了 Snippets 支援 Markdown：
1. 在 `_posts` 建立新檔 `.md`。
2. 輸入 `new-essay`, `new-project`, 或 `new-fragment` 並按下 Tab。
3. 自動生成標頭，填寫內容即可。

## 📂 檔案結構說明
- `_posts/`: 所有的內容都在這裡。
- `_layouts/`: 網站的版型 (HTML 模板)。
- `index.html`: 首頁的邏輯 (負責把 _posts 的內容抓出來分類顯示)。
- `style.css`: 樣式表。
- `_config.yml`: 網站全域設定 (作者名、描述)。

## 🛠 本地預覽 (進階)
如果您想在電腦上預覽：
1. 安裝 Ruby 與 Jekyll。
2. 執行 `bundle exec jekyll serve`。
3. 打開 `http://localhost:4000`。
