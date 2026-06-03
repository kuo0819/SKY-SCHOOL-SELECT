畢業學分選課紀錄系統｜使用說明

檔案內容：
1. index.html：前端網頁
2. Code.gs：Google Apps Script 後端
3. README.txt：安裝說明

安裝步驟：

一、建立 Google 試算表
1. 開一個新的 Google 試算表。
2. 複製網址中的試算表 ID。
   例如網址是：
   https://docs.google.com/spreadsheets/d/ABCDEFG123456/edit
   試算表 ID 就是 ABCDEFG123456。

二、建立 Apps Script 後端
1. 在 Google 試算表點「擴充功能」→「Apps Script」。
2. 把 Code.gs 的內容全部貼上。
3. 將第一行：
   const SHEET_ID = "請貼上你的 Google 試算表 ID";
   改成你的試算表 ID。
4. 儲存。
5. 先執行 setupSheets() 一次，授權後會自動建立 Users 和 Selections 工作表。

三、部署 Web App
1. Apps Script 右上角點「部署」→「新增部署作業」。
2. 類型選「網頁應用程式」。
3. 執行身分：我。
4. 誰可以存取：任何人。
5. 部署後複製 Web App URL。

四、設定前端
1. 打開 index.html。
2. 找到：
   const API_URL = "請貼上你的 Google Apps Script Web App URL";
3. 把文字改成剛剛複製的 Web App URL。
4. 儲存 index.html。
5. 用瀏覽器開啟 index.html 即可使用。

五、設定最高管理員
1. 先在網頁註冊一個帳號，例如：admin。
2. 到 Google 試算表 Users 工作表。
3. 找到 admin 那一列。
4. 把 role 欄位從 user 改成 admin。
5. admin 登入後即可查看所有人的選課紀錄。

注意事項：
1. 密碼會用 SHA-256 雜湊後存入試算表，不會直接明文保存。
2. 這是適合校內作業、小型專題、展示用的版本。
3. 如果要正式上線給大量使用者，建議改用 Firebase、Supabase 或正式後端資料庫。
