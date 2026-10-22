# 【第 1 輪修正】

完整驗收報告在 `docs/ACCEPTANCE_ROUND_1.md`。驗收版本 `37f3ac9c43cb5060ddb4aa42eb20a4d8cf982e38`。原始需求仍以 `docs/ORIGINAL_PROMPT.md` 為準。P0 為通過 1／失敗 12，尚未可交付。

## 問題清單：檔案、行號、問題、原因與原始章節

1. **清除後復活與加密模式競態**：`src/ui/state.tsx:34,79,136,141,148`。進行中的加密保存能在 wipe 後重建 vault，或在 Remove encryption 後把明文改回 vault。違反第 9/13 章。production 與獨立 Provider 都已重現，詳 `output/acceptance-round-1/domain/FINDINGS.md D01`、`browser/after-wipe-race.json`。
2. **鎖定時無清除出口、儲存失敗不告知**：`src/ui/App.tsx:64,232` 的 Unlock 沒有 Delete all my data；`src/ui/state.tsx:82` 雖設 error，workspace 存在時 App 不呈現。忘記密碼只能卡住，配額錯誤會讓使用者以為已保存。第 9/11 P0.10/P0.12 章。`browser/results.json`, `quota-error.json`, `locked-no-delete.png`。
3. **未完成保存就失去進度**：`src/ui/state.tsx:79–87` 的 200ms debounce 沒有可見 Saving/Saved 或未保存保護；按 Mine 立即 reload 會失去選擇，等待保存後三個引擎都正常。第 0/7/9 章。不要誤判為 Firefox/WebKit 不相容。
4. **ZIP 安全與損毀終態**：`src/parser/zip-stream.ts:59,67–77,119–173`。被排除的 big.bin 仍完整解壓 40MiB，繞過限制；60-byte 截斷檔永不 settle；少尾25 bytes 或破壞 CRC 仍成功。第 6.2/11/12 章。詳 `parser/FINDINGS.md P1-01/P1-02` 與最小 fixtures。
5. **取消與 ZIP 進度**：`src/lib/scan-client.ts:63`、`src/ui/App.tsx:405,434`、`src/parser/scan.ts:50,56,65`。cancel 只 terminate，UI 永遠 running；300MiB ZIP 7.1秒只有末尾一次進度、bytesRead 錯為65536。第 6.2/11 P0.1/P0.12。`parser/browser-worker-results.json`, `browser-worker-zip-results.json`。
6. **學校證據與私有後綴歸併錯誤**：`src/parser/aggregate.ts:54–60,88` 把本文地址當收件證據，個人收件未篩出，轉寄 recipientDomain 顯示個人網域；`src/parser/domains.ts:21` 合併不同 github.io 租戶。第 6.1.4/6.2 章。詳 `parser/FINDINGS.md P1-04/P2-09`。
7. **MIME 與行銷分類**：`src/parser/mail-stream.ts:93,133`、`src/parser/classify.ts:95`、`src/parser/aggregate.ts:48`。附件 welcome 被當帳號，base64 文字本文漏判，Welcome to our newsletter + List-Unsubscribe 也當註冊。第 6.2/12 章。16封獨立 corpus 為 TP10/FP2/FN2/TN2；不是要求捏造100%真實準確率。詳 parser 報告。
8. **排除再確認會刪使用者工作**：`src/lib/tasks.ts:73,131,153,159`、`src/ui/state.tsx:107`。Not mine→Mine 後 done/notes/steps 全重置。第 7.1/9 章。`domain/ownership-roundtrip.json`。
9. **報告漏項與 PDF 截字**：`src/lib/report.ts:34,68–70`。pending 存在時 Done 及其 notes 不在報告；長單字超90字元後段直接丟棄。第 7.5 章。`domain/mixed-report.txt`, `long-note.pdf`；根瀏覽器匯出也實得 `noteInReport:false`。
10. **ICS 結構注入與未知日期**：`src/lib/ics.ts:5,49,59`、`src/lib/workspace.ts:151,160`。ID 含 CRLF 可讓5任務變6個VEVENT；CRLF/CR筆記留下非法換行；未知日期被靜默改今日及昨天提醒；重複ID匯入被Map覆寫。第 8/9/13 章。詳 `domain/FINDINGS.md D04/D06/D07/D10`。
11. **Today 日期與看不到倒數**：`src/ui/App.tsx:258` 取 UTC 日，台灣凌晨把今日任務放 Coming up；Today/Timeline 沒呈現實際剩餘天數/停用日期。第 8 章。`domain/today-taiwan.html`, `browser/countdown-ui.txt`。
12. **任務類型與已完成清單未完整可達**：`src/lib/tasks.ts:68`、`src/ui/App.tsx:632–743,874`。五類中 Delete account 沒正常 UI 建立入口；已完成任務缺可找到的清單；已開始或完成任務缺重設 Not started 的明確操作。第 7.1/7.5/11 P0.4/P0.7。不是要求自動替每個帳號新增刪除任務。
13. **指南重要性、風險與資料來源缺漏**：`src/ui/App.tsx:632–743,828–868` 不呈現風險理由、學生方案影響與完整來源；完成後確認與救援操作不足。第 7.2/7.3。使用者應在每服務頁知道為何優先、優惠影響查證狀態與下一步；不能直接呈現 billing/data 等內部 key 當說明。
14. **學校資料指南沒有可追溯來源**：`src/strings.ts:210–227`、`src/ui/App.tsx:757–761`。三個學校頁實測官方連結都是0、沒有確認日期；Gmail轉寄只到驗證地址，漏回原Gmail啟用 Forward a copy... 和 Save Changes。第 5/7.4 章。官方依據 `https://support.google.com/mail/answer/10957?hl=en`；完整比對 `catalog/AUDIT.md`。
15. **匯入引導與已過期補救欠缺**：`src/ui/App.tsx:344–443`、`src/strings.ts:35–49,52–63`。PST等不支援格式沒有已查證轉換/替代路線、匯出檔取得流程不完整；缺通知重要聯絡人新信箱的英文可複製範本；已鎖帳號只說更換救援設定，沒有其他救援信箱/電話/備援方法的復原路徑。Microsoft30天敘述需來源與例外，不能暗示各校統一期限。第 6.1/7.4/8 章。
16. **通知按鈕是假功能**：`src/ui/App.tsx:1029–1038` 只 requestPermission，沒有通知產生或提醒排程。已過期合成情境權限呼叫1次、Notification呼叫0次。第 0/8 章。`browser/notification-due.json`。不能宣稱已測 OS 投遞。
17. **CSP 與正式頁面 console 錯誤**：`vite.config.ts:16` 的 frame-ancestors 在 meta 被忽略；`scripts/build-sw.mjs:43–46` 插入的 inline SW script 被自身CSP擋住，首頁2個console error。connect-src 是有效的，不要為解決錯誤改 unsafe-inline/unsafe-eval。第 9/13 章。
18. **對比、手機溢出與鍵盤焦點**：`src/styles.css:75–82,106–109,137–149,187–192`。穩定深色 banner對比1.32、quiet button1.03；390px Today/Report scrollWidth=736；file input焦點被裁掉且label無focus-within。第 9/10/11 P0.12。以 `browser/accessibility-stable.json` 和真Tab補測為準，排除初次動畫中的暫態淺色結果。
19. **動畫與清楚的狀態回饋不足**：`src/styles.css:182–185,211–221`、`src/ui/App.tsx:326`。有 arrive，但 progress ring沒有數值過渡，data-flip沒有實際重排行為；loading/取消/出錯、保存狀態需一致，重排/完成回饋需尊重 reduced motion。第 10/11 P0.7/P0.12。
20. **來源完整性、schema、字串與文件/CI**：`src/data/catalog.json:50–53,165,439,459–462`、`src/data/catalog.ts:4`、`tests/catalog.test.ts:20–26`；parser/scan-client/state 的多處可見字串；`docs/RESEARCH.md:5–25`, `docs/DESIGN.md:3–23`、空 `.github/workflows/`、缺 LICENSE/套件用途授權。第 1/5/6.3/9/10/13/14 章。11筆抽驗有官方依據，Unverified合法，403只是本次受阻，不得硬改通過。所有細節在 `catalog/AUDIT.md`。

## 修正要求：具體方式與預期結果

- 先修隱私/資料遺失、ZIP安全、取消/終態、學校證據，再修匯出/日期/可達性/指南/無障礙/文件。保存、清除與加密轉換要共用可證明的一致性機制；舊非同步作業不能在清除或模式切換後寫入。blocked 刪除必須誠實等待或報錯，不得 onblocked 假成功（`src/lib/store.ts:63`）。
- 保留帳號排除前的任務與使用者欄位，改在規劃/進度層隱藏；JSON 驗證唯一ID、參照、日期、控制字元及檔案大小。輸出 UID 使用安全編碼/穩定雜湊，對所有文字欄位正確處理換行與折行。無日期的行事曆明確要求設定日期或輸出無虛構日期的待辦。
- ZIP不需要的項目不要解壓，或所有輸出必須受一致資源限制；任何EOF/throw/cancel都只能且必須settle一次。加入中央目錄/CRC/完整度驗證，串流與Worker架構不可倒退成整檔載入。
- 只從明確的收件/轉寄標頭建立學校證據，保留真正匹配的來源；MIME文字part採有界解碼、略過附件，區分newsletter welcome。PSL要處理private boundary。多樣網域容量需實測並定義資源預算：原需求沒有5000帳號上限，不可為過探針任意刪掉超額帳號。對2-byte signature/未跳脫From的低優先健壯性案例如有處理，別拿它們取代主要缺陷。
- 報告永遠列完整任務/狀態/notes，PDF長字串必須完整換行，禁止移除PDF按鈕過關。五類任務有正常UI入口（刪帳只作選擇性指南，不直接刪外部帳號）；已完成列表、重設狀態、明確倒數與風險解釋可見。
- 所有平台步驟重新實讀官方文件；學校來源/日期在頁面可點，包含校方不同提示；來源對應與目錄generator同步。新增聯絡人通知範本與真實匯入指引、補救路徑。不能用記憶或未讀來源填空。
- 修正對比/字級/換行/窄螢幕min-width/表單與pre、匯入label的可見鍵盤焦點；做真實重排與進度過渡，reduced-motion靜態可用。通知需在授權且適當待辦情境真的呼叫提醒，誠實說明分頁關閉限制。
- SW註冊只走同源外部模組；CSP transport及frame-ancestors以實際可生效配置/文件處理，不放寬隱私。保留原本通過的SW離線能力。實際安裝PWA後離線尚待實測，installabilityErrors=[]不是安裝證明。
- 全部可見字串集中strings.ts（官方目錄英語資料維持版本JSON）；完成可執行schema和負向測試、對齊npmcheck/E2E的CI、MIT LICENSE與逐套件用途/授權、具來源的RESEARCH/DESIGN。Methodology說明分數×10、門檻與期限加分等實際規則。

## 必須使用的 skill / 工具

開工前列出本輪實際可用的能力及採用/不採用原因，不可只說用了但無執行紀錄。

- `diagnosing-bugs` 或可用等效除錯流程：用最小合成fixture重現、先確認根因再修。
- `security-best-practices` / 可用資安審查能力：保存競態、ZIP限制、匯入/ICS信任邊界、CSP。沒有對應skill時如實說明，以現有測試/官方標準替代，不安裝不明工具。
- Playwright：production E2E、context/Worker/SW網路紀錄、真file input、取消、清除、race、keyboard、桌面/手機與light/dark。
- `@axe-core/playwright` 與實際鍵盤；設計使用既有 `impeccable` / `ui-ux-pro-max` 等適用能力，修明確缺陷並維持本產品視覺，不另換設計世界。
- 官方網頁查證工具與Context7（若可用）：查最新API/官方流程，不以服務首頁或HTTP200冒充內容查證。
- Vitest/WebCrypto/IndexedDB/CDP：有界解析、確定性交錯、日期/ICS/JSON、真Worker記憶體取樣。已有harness可直接閱讀重用，不要把Node direct結果寫成瀏覽器Worker。

## 完成後驗證指令與預期結果

1. `npm run check`：格式、lint零警告、typecheck、全部單元、production build均成功。
2. `npm run test:e2e`：保留原測試並加入上述失敗案例，所有必要斷言通過；監控整個掃描→確認→遷移→倒數→匯出；對外請求0，正常操作console無錯誤/警告。
3. `npm run catalog:links`：保存真實結果。403/429未知，不得冒稱通過；以實際可讀官方頁重新確認或明確Unverified。至少40筆、完整schema、來源日期/網域唯一/負向測試通過。
4. `npx vitest run --config vitest.large.config.ts` 仍要跑；另補production Worker的300MiB、至少2GiB、多樣網域、ZIP進度/取消/記憶體實測。根據修後介面更新獨立harness即可，但不能移除oracle或改為接受錯誤行為。
5. 可讀並重跑 `output/acceptance-round-1/domain/`、`parser/` 與 `browser-audit.mjs`/`browser-supplement.mjs` 的有意義案例。現有自訂5000上限/非標準From/2byte chunk及初次程式焦點探針不是本輪阻擋要求；穩定axe和真Tab、保存前後的對照才是有效界線。
6. Chromium/Firefox/WebKit各跑主流程與保存，明確區分引擎和實際Safari/手機；390px無整頁橫向溢出、light/dark穩定畫面axe通過、鍵盤看得見焦點、reduced-motion可用。
7. Google/Apple/Outlook真實ICS匯入、VoiceOver/NVDA、實機手機、實際安裝PWA離線若未執行，逐項標未實際執行及證據限制，不可宣稱全面通過。不得自行接外部帳號、發布或部署來補測。

## 禁止事項

- 不得刪功能、PDF、通知、測試、服務資料或放寬隱私來過關；不得把failed改skip/弱化assertion。保留已通過行為，只改必要且與缺陷相關的部分，新增適當回歸。
- 不得把Unverified硬改verified、捏造官方內容、測試數字、完整驗收通過或「所有瀏覽器已測」。
- 不得以硬寫5000門檻砍資料；不得以微小synthetic corpus聲稱真實信箱100%準確。
- 不得使用真實信箱、服務密碼/憑證；不得推送GitHub、建立remote、部署或公開。網域與公開均等使用者決定。
- Codex不代寫功能。你完成後再由Codex做整輪獨立回歸；最多8輪，這是第1輪。

請先在 `docs/CURSOR_STATUS.md` 寫 `IN_PROGRESS — FIX_ROUND_1`，再自主修復。完成後保留原驗收文件及所有證據，更新自己的TEST_REPORT和狀態檔，附新commit/指令/結果/未實測項目；完全修完本輪要求才回 `READY_FOR_ACCEPTANCE — FIX_ROUND_1`，有未完項如實標 `INCOMPLETE` 或 `BLOCKED`。
