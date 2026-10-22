# 設計紀錄

## 採用

視覺以 `PRODUCT.md` 為準：暖白紙色 `#f3efe4`、墨綠 `#1e4a38`、萊姆 `#d7e48a`。字體只用本機的 serif 與 sans 字型堆疊，不載入任何外部字型。版面是左側工作列加上一篇主文，而不是均一的卡片牆。沒有 emoji，沒有紫色漸層。

動效有短的出現動畫、進度環的數值過渡，以及清單重排時的 FLIP。`prefers-reduced-motion: reduce` 時關掉動畫與環的過渡。焦點框至少 2px，檔案選擇的標籤用 `:focus-within`，因為真正的 input 被裁切。主要控制項高度約 44px。窄螢幕改成單欄，長網址與 `pre` 可以折行。

深色主題的萊姆橫幅維持淺底深字。次要按鈕不套用主按鈕的深色字，避免深字落在深底上。

對比與資訊層次參考 WCAG 2.2 的對比與焦點可見要求，以及本機優先的隱私介面：狀態（儲存中、已儲存、錯誤）寫在畫面上，不靠顏色單獨表達。

文案全部在 `src/strings.ts`。介面語言是英文。

## 查過但沒有採用

ui-ux-pro-max 對「隱私、生產力、清單」給過一套 teal / orange、Plus Jakarta Sans 與 GSAP 的建議。沒有採用。外部字型會在產品執行時發出請求；GSAP 是額外依賴；那組顏色和 `PRODUCT.md` 已經指定的暖紙與墨綠不一致。

lucide-react 留在既有依賴裡，介面沒有用圖示字元，避免再堆一層裝飾。

## 無障礙

自動化檢測用 `@axe-core/playwright`，在 production 的 Settings 頁跑過，該次沒有違規。鍵盤路徑跟著 Playwright 的點擊與原生控制項。沒有用 VoiceOver 或 NVDA 做人工抽測，不能寫成螢幕閱讀器已通過。

## 沒有做的視覺品

沒有為這個工具做行銷首頁或插畫。首次畫面用一段話說明用途與資料留在裝置上，並提供示範資料。

## 2026-10-19 採用的資訊設計

Today 的倒數若來自畢業日加保留天數，同一句後面標假設。假設只寫在用到它的地方，不另做確定日期。已過期清單與學校郵件指南共用 Microsoft 授權收回的 Legal Hold、OneDrive 例外，以及該頁連結與查證日期。

完成確認是主步驟後面的另一份清單：個人信箱打得開、救援方式、雙因素驗證。勾選另外編號，避免和官方步驟的索引混在一起。匯入區在選檔之前就寫不支援 `.pst`，並連到 Outlook 儲存成信件檔與開啟資料檔的官方頁。`.msg` 與 PDF 不拿來當可掃描的信箱。

## 2026-10-19 讀過的外部案例

只借手法。沒有複製這些頁面的句子、圖片或程式。日期是這次打開頁面的日子。

資訊設計。GOV.UK Service Manual，Writing for user interfaces（`https://www.gov.uk/service-manual/design/writing-for-user-interfaces`，頁面最後更新 2018-04-16，這次於 2026-10-19 讀到）。它要求一句一個意思、重要的字放前面，而且不能只靠顏色、形狀或位置表達。連結文字要自己看得出目的。採用：學校步驟用短句，儲存狀態寫成文字，過期橫幅上的連結有底線與自己的字色。沒有改寫成他們的語氣。

進度與清單。Nielsen Norman Group，Katie Sherwin，Progress Indicators Make a Slow System Less Insufferable（`https://www.nngroup.com/articles/progress-indicators/`，2014-10-26，這次於 2026-10-19 讀到）。超過大約 10 秒的工作要用看得出完成比例的指示，並讓人可以停止。採用：掃描時顯示已讀進度，並提供 Cancel。Material Design 3 的 Progress indicators（`https://m3.material.io/components/progress-indicators/overview`，頁面記 2023-12 提高軌道與指示器的對比，這次於 2026-10-19 讀到）把線型與環型分開，並提醒非文字也要有對比。採用既有的進度環。沒有採用 2024-08 的波浪軌道。

安全與隱私產品。Bitwarden Security Whitepaper（`https://bitwarden.com/help/bitwarden-security-white-paper/`，這次於 2026-10-19 讀到）。它寫金鑰在用戶端產生，加密在本機完成，服務端看不到主密碼，忘記主密碼就無法由廠商救回。採用：密碼只留在這台裝置，忘記密碼的說明維持無法復原。沒有改用他們的 AES-CBC。Firefox Privacy Notice（`https://www.mozilla.org/en-US/privacy/firefox/`，生效日 2026-05-04，這次於 2026-10-19 讀到）把預設隱私、看得見的控制，以及清除不需要的紀錄放在同一篇說明裡。採用：Delete all data 是真的清除，不是藏在說明文字裡的句子。

設計社群。Nielsen Norman Group，Jakob Nielsen，10 Usability Heuristics for User Interface Design（`https://www.nngroup.com/articles/ten-usability-heuristics/`，最後審閱 2024-01-30，這次於 2026-10-19 讀到）。系統狀態要看得見，錯誤要用白話並指出下一步，說明要放在用到的地方。採用：Saving、Saved 與錯誤寫在畫面上，清單步驟留在任務旁邊。W3C，Understanding SC 1.4.3 Contrast (Minimum)（`https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html`，這次於 2026-10-19 讀到）要求一般內文至少 4.5:1；大約 24px，或大約 18.5px 的粗體，才降到 3:1。16px 的過期連結沿用 4.5:1，不把 axe 的 violations 為空當成對比已經夠。

介面沒有為了這些案例重畫。暖紙、墨綠與萊姆仍以 `PRODUCT.md` 為準。

PDF 用 Helvetica 11pt，文字從 x=50 起，可用寬度低於 612pt 頁寬。換行按字寬而不是字數，避免一連串 W 畫出紙張。

隱私狀態（Saving、Saved、錯誤）寫成文字。解鎖與清除用同一組世代與修訂編號：清除使進行中的解密不能把舊工作區寫回；較新的儲存完成後，較舊的加密結果不再寫入。這是為了避免「畫面是新的、磁碟是舊的」或「按了清除又回來」。
