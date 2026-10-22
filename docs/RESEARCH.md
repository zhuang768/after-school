# 調查紀錄

本檔只記錄這次開發實際採用的作法與查證界線。沒有重新打開的官方頁面，不在這裡補寫成新步驟。

## 產品差異

畢業帳號遷移要回答的是「學校信箱停用前，哪些服務可能還綁著它、哪一件先做」。JustDelete.me 這類目錄提供的是刪除連結。Deseat.me、Mine 這類工具會用 OAuth 讀取信箱。本產品不接 OAuth，也不把信箱內容送到任何伺服器。分類結果一律稱 likely，不是已確認的帳號清單。

## 平台能力

實作依賴瀏覽器已有的能力：`Blob.stream()`、Web Worker、IndexedDB、Web Crypto、Cache Storage 與 Service Worker。MDN 的 File 頁面在先前查證時，直接的 `File.stream` 網址沒有成文；`File` 繼承 `Blob`，因此使用 `Blob.stream()` 的說明作為依據。沒有 Worker 時，介面應停止掃描而不是改在主執行緒假裝完成。沒有 IndexedDB 時，不另做一套會破壞清除語意的 localStorage 帳號備份。

## 目錄

`src/data/catalog.json` 有 40 筆服務，`verifiedAt` 為 2026-10-19。步驟只保留當時讀到的官方文字所能支持的範圍；讀不到的欄位維持 `unverified`。2026-10-19 02:09（台北時間）重新請求目錄中的 55 個網址：43 個回應 200，12 個回應 403。403 視為這次指令被網站擋住，不把該步驟改寫，也不把這次稽核寫成全部通過。明細在 `output/link-audit.json`（該目錄被 git 忽略）。

學校雲端硬碟、郵件、聯絡人與救援信箱的通用步驟在 `src/strings.ts` 的 `schoolGuides`。Microsoft 文件中的信箱保留 30 天是授權收回後的說明，不是所有學校的學生帳號政策。介面上的保留天數預設是假設，並標成假設。

## 解析

串流剖析器只保留寄件者、收件者、日期、主旨、List-Unsubscribe，以及正文開頭最多 8000 字元的純文字。學校信箱是否相符只看 To、Cc、Delivered-To、X-Original-To、Envelope-To、Resent-To、X-Forwarded-To，不看正文。已設定學校網域時，這些欄位都對不上的信不建立帳號。HTML 標籤會先去掉，不會建立 DOM，也不會請求信內網址。寄件網域用 tldts，並開啟 private domain，避免把 `a.github.io` 與 `b.github.io` 併成同一個 `github.io`。SendGrid、Amazon SES 等大量寄送網域改看 Reply-To 或 List-Id。行銷信本身不建立帳號。附件與非文字 MIME 區段不拿來當帳號證據。

10001 個不同寄件網域會各自保留一筆帳號。驗收探針裡的 `accounts.length <= 5000` 不是產品規格，這次沒有為了讓該探針通過而刪資料。

## 格式與降級

Google Takeout 與 Gmail 匯出在官方說明裡不保證檔名是 `.mbox`；本程式能讀 `.mbox` 與 `.eml`，是因為剖析器支援這兩種，不是因為每一所學校都會交出這種檔。Outlook `.pst` 不在支援範圍。沒有 Worker、沒有 IndexedDB、或檔案損壞時，掃描停止並顯示錯誤，不把失敗寫成完成。通知只在分頁開著且使用者已允許時送出，不宣稱關閉分頁後作業系統仍會提醒。

## 競品與 OAuth

不採用「連接 Gmail」的原因寫在 `DECISIONS.md`：審查負擔、憑證風險，以及與「資料不離開裝置」的承諾衝突。

## 2026-10-19 重讀的來源

以下頁面在 2026-10-19 以工具抓回正文。只記錄讀到的範圍，不把沒讀到的步驟寫進產品。

競品：`https://github.com/jdm-contrib/jdm` 的說明是「A directory of direct links to delete your account from web services.」。它回答的是刪除入口，不是畢業後學校信箱還綁了哪些登入。本產品維持 likely 分類與本機匯入，不接 OAuth 讀信。

抱怨與格式：Gmail 匯出頁（`https://support.google.com/mail/answer/10016932?hl=en`）寫明工作或學校帳號「some data might not be available for download」。Takeout（`https://support.google.com/accounts/answer/3024190?hl=en`）可下載 Email，下載不會刪除伺服器上的資料，封存約 7 天後過期。學校複製工具（`https://support.google.com/accounts/answer/6386856?hl=en`）可複製 Gmail，但不含 contacts、chats、tasks；Drive 只複製自己擁有的檔，原件留在學校帳號。聯絡人要另走匯出（`https://support.google.com/contacts/answer/7199294?hl=en`），學校目錄聯絡人不能全選。這些限制寫在學校任務的來源列，不寫成「一定拿得到 .mbox」。

轉寄：Gmail（`https://support.google.com/mail/answer/10957?hl=en`）要先驗證轉寄地址，回到 Forwarding and POP/IMAP，選 Forward a copy of incoming mail to，決定 Gmail 副本怎麼處理，再 Save Changes。頁面說轉的是新信，不含垃圾信。產品既有步驟維持這個順序，並註明學校可以關掉轉寄。

Microsoft：授權收回頁（`https://support.microsoft.com/en-us/education/manage-graduating-student-licenses-and-content-in-microsoft-365-education`）寫信箱資料保留 30 天，Legal Hold 除外，之後刪除且無法復原；OneDrive 不會因這次收回而刪除。學生指南（`https://support.microsoft.com/en-us/education/transition-your-files-a-student-s-guide`）要學生自己複製檔案、用 Outlook 匯出郵件與行事曆、另匯聯絡人。這不是每一所學校的政策。

教育優惠與一般機構風險分開。GitHub Education 申請頁（`https://docs.github.com/en/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student`）確實要求部分學校先驗證學術信箱，所以 GitHub 維持 education 已確認。Zotero（`https://www.zotero.org/support/kb/change_email`，頁面寫 Last updated 2026-09-29）只建議機構信箱加備援。這次讀到的頁面沒有記載學生方案。WordPress.com（`https://wordpress.com/support/email-address/`，Last reviewed on October 5, 2026）建議用個人信箱，避免學校或工作信箱停用後鎖住帳號。這次讀到的頁面沒有記載學生方案。這兩筆與 Trello 管理網域、Grammarly 組織訂閱維持 education `unverified`，不加 50 分。

API：Takeout 頁提到開發者可用 Data Portability API（`https://developers.google.com/data-portability`）。那是第三方應用讀取使用者資料的介面，會把資料交給該應用。本產品不呼叫它。信箱剖析只用使用者自己選的檔案，在 Worker 裡串流，不請求信內網址。fflate 的 Unzip 說明寫明單一 chunk 裡檔案太多會碰到 stack limit，小檔應把 chunk 壓到約 64kB 以下；實作把每次 `push` 切成 8192 bytes，檔數上限仍是 2000。

## 2026-10-19 第 5 章對照

這一節只寫 2026-10-19 這次重新打開、並讀到正文的頁面。沒有讀到的工具不寫成已比較。使用者抱怨若下面沒有獨立來源，就記為未取得，不把官方下載限制當成抱怨。

### 三類工具

信箱掃描與隱私工具：2026-10-19 讀了 MineOS 的 Email Based Discovery FAQ（`https://docs.mineos.ai/knowledge/email-discovery-faq`）和 Discovery Radar（`https://developers.mineos.ai/docs/discovery-radar`）。這是企業用的資料來源探索。消費者網站 Mine（`https://www.mine.com/`）這次沒有重新打開，不把它的舊功能寫成現況。MineOS 讓管理員用 OAuth 連 Google Workspace 或 Microsoft 365，掃員工收到的公司來信 metadata 與主旨，持續把系統列在 Radar。廠商頁寫可發現最多 95% 的資料來源；那是廠商自己的說法，不是本產品測到的準確率。優點是不用每人匯出信箱。限制是要管理員權限，Google 路徑用 `gmail.readonly`，Microsoft 路徑用 `Mail.Read`，而且信箱內容會離開員工的瀏覽器、交給 MineOS 的服務。本產品不接 OAuth，只在使用者選好的檔案上、於這台裝置的 Worker 裡讀一次。

帳號刪除目錄：JustDelete.me 原始碼說明（`https://github.com/jdm-contrib/jdm`，2026-10-19 讀到）是「A directory of direct links to delete your account from web services.」。優點是刪除入口集中、連結直接。限制是它回答刪除，不回答畢業前學校信箱還綁了哪些登入，也沒有時程。使用者抱怨：2026-10-19 沒有打開一份可以逐句引用的抱怨頁，所以這一類仍是未取得。

官方遷移與匯出：Google Takeout（`https://support.google.com/accounts/answer/3024190?hl=en`）可下載 Email，下載不刪除伺服器上的資料。Gmail 下載說明（`https://support.google.com/mail/answer/10016932?hl=en`）寫工作或學校帳號有些資料可能不能下載。Microsoft 學生指南（`https://support.microsoft.com/en-us/education/transition-your-files-a-student-s-guide`）要學生自己複製檔案，並用 Outlook 匯出郵件與行事曆。優點是檔案留在使用者手上。限制是學校可以關掉匯出，而且 `.pst` 不是本程式能讀的格式。使用者抱怨：2026-10-19 讀了 Google 帳戶社群一篇貼文（Omar Fractal，2025-08-03，`https://support.google.com/accounts/thread/362683048/google-takeout-exports-missing-archive-browser-html-file?hl=en`）。作者寫自己正在匯出高中帳號，最近一次 Takeout 少了 `archive_browser.html`，資料夾也少一個。這是一則觀察，不是常見比例，也不是官方下載上限。

### 格式

2026-10-19 讀了 Outlook 儲存信件頁（`https://support.microsoft.com/en-us/outlook/mail/save-an-outlook-message-as-a-eml-file-a-pdf-file-or-as-a-draft`，適用 Outlook for Microsoft 365、2024、2021、2019、2016、Outlook.com、New Outlook for Windows）。新版 Outlook：More actions、Save as，存成電腦或雲端上的檔案；PDF 不是預設的 Save as 類型，要走 Microsoft Print to PDF。網頁版與 Outlook.com：More actions、Download，檔案通常是 `.eml` 或 `.msg`。傳統版：File、Save As，接受清單裡的預設類型或另選一種；該頁沒有寫預設就是 `.eml`。同一天讀了開啟 `.pst` 的頁（`https://support.microsoft.com/en-us/outlook/open-and-close-outlook-data-files-pst`）。新版 Outlook 要另外裝著傳統版，而且兩者都要是 32 位元或都要是 64 位元，才能 Add file。打開 `.pst` 之後檔案仍是 `.pst`。本程式只讀 `.mbox`、`.eml`，以及只含這兩種的 zip。沒有 `.eml` 時，介面改走清單與手動新增，不把 Google Takeout 寫成任意 Outlook 信箱的出路。

### 瀏覽器 API 與降級

2026-10-19 讀 MDN。`Blob.stream()`（`https://developer.mozilla.org/en-US/docs/Web/API/Blob/stream`）自 2021 年 4 月起 Baseline widely available，可在 Worker 裡用，回傳 `ReadableStream`。`File` 繼承 `Blob`，所以大檔用 `file.stream()`。沒有這個串流時，掃描停止，不把整個檔讀進主執行緒假裝完成。

Web Workers（`https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API`）讓剖析離開主執行緒。Worker 不能改 DOM。沒有 Worker 時，介面停止掃描並顯示錯誤。

IndexedDB（`https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API`）可在 Worker 使用，同源，配額與清除規則依瀏覽器而異（MDN 指向 Firefox 的 storage quotas 說明，沒有寫死一個位元組上限）。沒有 IndexedDB 時，不另做一套 localStorage 帳號備份，因為那會讓「刪除全部」漏掉一份副本。

SubtleCrypto（`https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto`）自 2017 年 9 月起 Baseline widely available，只在 secure context，也可在 Worker 使用。本產品用它做 AES-GCM 與 PBKDF2。頁面自己警告演算法容易用錯，而且金鑰管理不是 API 能擔保的。沒有 WebCrypto 或不是 secure context 時，不提供加密儲存，明文工作區仍可留在 IndexedDB，介面不把加密寫成已經生效。

Data Portability API 不取代使用者自己選的檔案。
