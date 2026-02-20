# 網站發佈與編輯指南 (Computer Workflow)

這份指南將教您如何將這個網站發佈到網路上，以及日後如何在電腦上新增或修改文章。

## 🚀 首次發佈 (First Time Setup)

如果您還沒有將網站上傳到 GitHub，請執行以下步驟：

### 1. 建立 GitHub Repository
1.  登入 [GitHub](https://github.com)。
2.  點擊右上角的 **+** 號 -> **New repository**。
3.  **Repository name** 輸入您想要的專案名稱（例如 `my-blog` 或 `portfolio`）。
4.  設定為 **Public**。
5.  **不要** 勾選 "Add a README file"（因為我們已經有了）。
6.  點擊 **Create repository**。

### 2. 連接並上傳 (在您的電腦上)
打開終端機 (Terminal) 或 VS Code 的終端機 (Ctrl+`)，確認您在專案資料夾內，然後依序執行：

```bash
# 1. 初始化 Git
git init

# 2. 加入所有檔案
git add .

# 3. 第一次存檔 (Commit)
git commit -m "First commit: Zen Minimalism Site"

# 4.設定分支名稱
git branch -M main

# 5. 連接到 GitHub (請將下面的 URL 換成您剛剛建立的 Repository 網址)
git remote add origin https://github.com/您的帳號/您的專案名稱.git

# 6. 推送上傳！
git push -u origin main
```

### 3. 開啟 GitHub Pages 功能
1.  回到 GitHub 網頁版，進入您的 Repository。
2.  點擊上方的 **Settings** 標籤。
3.  在左側選單找到 **Pages** (或 GitHub Pages)。
4.  在 **Build and deployment** > **Source** 選擇 **Deploy from a branch**。
5.  **Branch** 選擇 `main`，資料夾選擇 `/ (root)`。
6.  點擊 **Save**。
7.  等待約 1-2 分鐘，重新整理頁面，您就會看到這行字：**"Your site is live at..."** 點擊網址即可看到網站！

---

## ✍️ 日常編輯與發佈 (Daily Workflow)

當您想要新增文章或修改內容時，請依照以下步驟：

### 1. 編輯內容 (Edit)
1.  在 VS Code 中打開專案。
2.  **新增文章**：在 `_posts` 資料夾建立新檔案 (檔名格式：`YYYY-MM-DD-標題.md`)，貼上 Front Matter 並撰寫內容。
    *   *小撇步：在 VS Code 輸入 `new-essay` 按 Tab 可快速生成格式。*
3.  **修改文章**：直接編輯現有的 `.md` 檔案並儲存。

### 2. 發佈更新 (Publish)
打開 VS Code 的終端機 (Ctrl+`)，輸入以下三行指令：

```bash
# 1. 加入修改
git add .

# 2. 寫下這次改了什麼 (例如：新增了一篇讀書心得)
git commit -m "Add new essay about reading"

# 3. 推送到 GitHub
git push
```

完成！GitHub 會自動偵測到新的推送，並在幾分鐘內更新您的網站。

---

## 📱 推薦工作流 (Recommended Workflow)

**是的，非常建議您在首次發佈後，日常更新改用手機 App！**

這種「混合模式」是最輕鬆的經營方式：

### 什麼時候用手機 App？ (90% 的時間)
*   **發佈隨想 (Fragment)**：在捷運上、睡前想到一個點子，拿出手機 30 秒發文。
*   **撰寫純文字論述 (Essay)**：就像寫備忘錄一樣，專注於文字輸出。
*   **修改錯字**：發現文章有錯字，手機點開直接改，隨時隨地維護。

### 什麼時候用電腦？ (10% 的時間)
*   **發佈大型專案 (Project)**：需要整理多張高畫質截圖、寫複雜的技術文件時。
*   **修改網站設計**：想改顏色、字體、版型結構時。
*   **大量圖片上傳**：雖然手機也能傳圖，但電腦管理檔案還是比較快。

---

## ❓ 常見問題
**Q: 如果我想刪除一篇文章？**
A: **電腦**：直接刪檔並 Push。**手機**：在 App 裡進入 `_posts` 資料夾 -> 點選該文章 -> 點右上角 `...` -> `Delete file`。

**Q: 如果我想刪除一張圖片？**
A: **手機**：在 App 裡進入 `assets/images` 資料夾 -> 點選該圖片 -> 點右上角 `...` -> `Delete file`。
**注意**：刪除圖片後，記得也要把引用該圖片的文章內容修改一下，不然會出現破圖喔！

**Q: 圖片怎麼放？**
**手機 (推薦)**：在編輯介面點擊工具列的「圖片圖示」，選照片，它會自動上傳並產生 Markdown 代碼。這是最無腦的方式！
**電腦**：把圖片丟進 `assets/images/` 資料夾，然後寫 `![說明](/assets/images/檔名.jpg)`。

