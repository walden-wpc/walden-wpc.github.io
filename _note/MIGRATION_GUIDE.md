# 🔄 如何覆蓋舊的 GitHub 網站 (Migration Guide)

如果您已經有一個舊的個人網站 (例如 `yourname.github.io`)，並且想要**徹底刪除舊內容，換成這個新網站**，請依照以下步驟操作。

**⚠️ 警告：這會永久刪除舊網站的所有歷史紀錄，請確定您已經備份了舊資料！**

## 步驟 1：準備工作 (在 VS Code)
1.  打開 VS Code，確認您在這個網站的專案資料夾中。
2.  按 `Ctrl + \`` 打開終端機 (Terminal)。

## 步驟 2：設定與推送 (Force Push)
請將下面的 `[您的舊倉庫網址]` 換成您實際的 GitHub 網址 (例如 `https://github.com/wang/wang.github.io.git`)。

依序複製並貼上以下指令：

```bash
# 1. 初始化 Git (如果之前沒做過)
git init

# 2. 將所有新檔案加入暫存區
git add .

# 3. 提交第一次版本
git commit -m "Walden Reborn: Initial Commit"

# 4. 設定分支名稱為 main
git branch -M main

# 5. 加入舊倉庫的網址 (作為遠端 origin)
# 注意：如果出現 "error: remote origin already exists"，請先輸入: git remote remove origin
git remote add origin [您的舊倉庫網址]

# 6. 強制蓋掉舊網站 (關鍵指令！)
# -f 代表 force (強制)，這會無視舊的紀錄，直接用新的覆寫
git push -f origin main
```

## 步驟 3：完成
執行完最後一行後，GitHub 就會把您的舊網站「洗掉」，換成這個全新的 Walden 網站。
大約等待 1-2 分鐘，重新整理您的網址，應該就能看到新風貌了！
