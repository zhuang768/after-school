> Publication note: personal home-directory prefixes were replaced with `<HOME>`. The local original record is retained outside the public repository.

# 【第 2 輪修正】

標的：`c8c0d36cb3d2155c2c25f8059a8e1573e267c7d3`，第2輪完整獨立驗收仍未通過。固定P0為1通過／12失敗；原始需求仍以`docs/ORIGINAL_PROMPT.md`為準。完整結果在`docs/ACCEPTANCE_ROUND_2.md`、`docs/TEST_REPORT.md`，可重現harness／fixtures／JSON／PNG在ignored `output/acceptance-round-2/`。請完整閱讀三個子報告，不要只修摘要。

## 問題清單：檔案＋行號＋問題＋原因＋原始章節

1. **解鎖途中清除仍使資料復活**：`src/ui/state.tsx:161–171,194–206`。開始unlock，暫停native decrypt回傳，點Delete後DB已空，放行解密後workspace／vault回來。最高隱私原則、第9／13章、P0.10。production UI與真Provider均重現，見`browser/production-unlock-wipe.json`、`domain/state-supplement-results.json`。
2. **一般加密保存逆序會以舊蓋新**：`src/ui/state.tsx:54–61,75–77`。A較慢、B較新已寫入，再完成A，vault回A但畫面B、savePhase仍saved。第7.1／9／13章。相同generation、在加密後才排writeTail不能保證使用者更新順序。
3. **批次遇錯留下不能操作的假帳號列**：`src/ui/App.tsx:478–489`、`src/parser/zip-stream.ts:248`。同批有效EML→壞ZIP，仍列GitHub但無Mine，reload消失；CRC錯誤也留未驗證live結果。第0／6.1／6.2／9／12章。`parser/browser-format-results.json`, `batch-partial-error.png`。
4. **合法地址顯示名稱被當成真地址**：`src/parser/headers.ts:55–58`、`domains.ts:29`、`aggregate.ts:53–57`。`To: "Contact ada@school.example" <ada@personal.example>`誤schoolMatch；`From: "GitHub team@github.com" <team@unrelated.example>`誤歸GitHub。第6.1.4／6.2／12章。`parser/address-probe-results.json`兩案實際失敗。
5. **常見MIME格式漏掉開頭訊號**：`src/parser/mail-stream.ts:14–34,39–54,62`。mixed→alternative、合法`boundary = "x"`、UTF-8 quoted-printable中文、64／76字換行且受限截斷的base64前綴失敗。第6.2／11／12章。Node與production file input重現，`parser/FINDINGS.md P2-R2-03`。不是要求解析無界全文。
6. **一般電子報仍誤當帳號**：`src/parser/classify.ts:102–111`只排英文newsletter。中文「歡迎加入電子報」與「Welcome to the mailing list」有List-Unsubscribe、無其他訊號仍產生帳號。第6.2／12章。新23封集TP12/FP2/FN5/TN4，不能只對測試字串打補丁。
7. **同兩封信分EML或MBOX信心不同**：`src/ui/App.tsx:530–550`，merge只取原信心rank。welcome＋verification批次EML為count2/Low，完全相同MBOX為count2/High。第6.1／6.2。`parser/browser-format-results.json`含reload對照。
8. **允許的有效2,000封ZIP堆疊溢位**：`src/parser/zip-stream.ts:6,161,234,243`。普通短檔名小EML ZIP，系統`unzip -t`全OK，production Worker卻Maximum call stack size exceeded；200/500/1000對照成功。第6.1／6.2／11／12章。不是OOM；不得任意砍帳號。`parser/browser-extra-results.json`。
9. **大型信件計數備份失真**：`src/lib/workspace.ts:121–124,220–223`。300MiB可達的count/signals=1,655,647，JSON匯入count歸0、signal截1,000,000。第6.2／9章。`domain/large-count-roundtrip.json`。Scanner可產生與備份可還原的範圍不一致。
10. **正常手動新增產生重複ID，無法匯入自己的備份**：`src/ui/App.tsx:700–713`。同名同網域連加兩次→原樣匯出／匯入，UI拒絕valid workspace，帳號與衍生任務ID重複（production console未觀察到React警告）。第6.1／7.1／9／12章。`browser/duplicate-manual.json`, `duplicate-import-actual.json`。
11. **PDF寬字仍被紙張裁掉**：`src/lib/report.ts:60–68,88`。200個W的合成筆記，文字原檔雖完整，實際PDF65個字形超過612pt紙寬，最右984.56pt。第7.5／13章。`domain/wide-note.pdf`, `wide-note-page1.png`, `pdf-inspection.json`。
12. **schema仍未完整驗證**：`src/data/catalog.ts:8–45`、`tests/catalog.test.ts:42–48`。13個非法對照被接受；2個以未處理例外拒絕而未回傳診斷，涵蓋name/category/date/education/url/step型別/source/domain。第6.3／12／13章。`catalog/schema-probe.json`。不能以TS cast或固定contains斷言當schema。
13. **教育優惠與一般機構風險語義混用**：`src/types.ts:23`、`src/data/catalog.json:809–812,1070–1073,1101–1104,1132–1135`、`src/lib/planning.ts:81`。Zotero備援信箱、Trello管理網域、WordPress一般建議、Grammarly組織訂閱來源不證實學生優惠，卻標education=yes並各加50分。第6.3／7.2章。`catalog/method-probe.json`及`AUDIT.md`有本輪官方正文比對，不是因Unverified比例判錯。
14. **完成確認與安全提醒未補完整**：`src/ui/App.tsx:735–891`、`src/strings.ts:187–193`。實際GitHub Mark done後只改狀態，沒有完成確認、救援及2FA提醒；已知服務不走fallback，所以不能用fallback存在代替。第7.3／11章。`browser/done-guide.txt`。
15. **匯入拒絕沒有當場可操作的替代路線**：`src/ui/App.tsx:442–445,503–505`、`src/strings.ts:57`。實際選PST只看到不支援，沒有匯出檔取得／官方轉換或替代方案入口；school mail頁籠統說用Outlook複製也未提供可遵循來源。第6.1／7.4／12章。`browser/unsupported.txt`。
16. **Today假設未標示、已過期政策未同步**：`src/ui/App.tsx:288–302`、`src/strings.ts:37–45`。畢業日＋保留日推算仍顯確定「N days until...」，只有Timeline有assumption；Already expired仍是缺LegalHold／OneDrive例外及日期來源的舊30日文案。第5／7.4／8章。`browser/assumed-countdown.txt`, `expired.txt`。
17. **學校來源覆蓋與維護仍漏**：`src/strings.ts:213–278`、`scripts/check-catalog-links.mjs:6–18`。Drive磁碟複製、mail Takeout／Gmail限制、contacts不含於school-copy等句子各未在該任務列真正引用來源；新增Gmail/Contacts等學校URL沒全部進link audit。第5／7.4／12章。`catalog/AUDIT.md`, `school-links-not-in-script.json`。
18. **文件、方法與友善文案尚未一致**：`docs/RESEARCH.md:5–31`、`docs/DESIGN.md:3–27`、`docs/DECISIONS.md:23`、`src/strings.ts:167`、`src/parser/worker.ts:55`。缺具來源／日期的競品比較、抱怨／格式／API支援研究與設計案例；DECISIONS仍說未browser重做300MB；信心文字漏兩種Medium，lead使用base score未明；worker fallback硬寫且底層error.message直接給使用者。第1／5／9／10／13／14章。CI的`check.yml`已存在，不是空目錄；只有手動觸發可順便補PR/push檢查，未遠端執行不得稱已過。

## 修正要求：具體方式與預期結果

先將`docs/CURSOR_STATUS.md`寫為`IN_PROGRESS — FIX_ROUND_2`，舊READY不可沿用。優先修1–3的隱私與資料遺失，再完成其餘18組問題。所有來源與測資詳三份子報告。

- 保存以單調revision／operation token保護每次更新、unlock、wipe、模式切換及boot讀取；在每個await後、恢復password/allowSave/workspace前檢查。以使用者更新順序提交，較舊作業不能覆蓋新快照，Saved只對最新成功寫入成立。保留鎖定時清除出口及配額錯誤提示。
- 批次採一致的提交策略：已成功檔案可保存且能確認，或整批原子回滾並清空live；失敗ZIP內容不可當成功帳號。補有效→失敗、CRC錯、點擊確認及reload回歸。
- 在現有限額下正確剖析實際addr-spec與MIME；略過quoted display/comment文字，安全處理常見巢狀multipart／charset／QP／base64截斷前綴。附件仍跳過，絕不渲染HTML、不增無界全文保存。分類採語意正反例，保持真verification/password/receipt/security含unsubscribe仍可辨認。
- 把信心計算共用於合併後signals/evidence，EML/MBOX/ZIP與多次批次結果一致。ZIP分塊／callback深度應支援現行允許檔數，避免同步遞迴stack overflow；不可把有效檔當內部錯誤或刪測試降上限過關。
- 計數使用一致安全整數範圍；手動重複新增需明確去重／合併／阻止重複或給唯一ID，不能使匯出無法還原，不可丟既有筆記。PDF依字寬排版並實際渲染驗證，全部文字留在紙內。
- 建立完整runtime schema／validator並整合建置或目錄驗證；每個負向測試由有效entry只改一欄。分開教育方案存在／優惠影響／一般管理或救援因素，沒有官方證據的欄位誠實未知，保留服務與來源，勿憑記憶填值。
- 在已知及未知服務均提供適當完成確認（個人信箱可用、救援、2FA等），與主步驟分清楚、可保存勾選。下一輪分別驗確認清單、2FA與recovery，不得只讓一個關鍵字正規表示式過關。匯入區放明確取得支援檔案／不支援格式的官方替代指引。假設應在使用它的Today倒數顯示，expired與school guide共用政策／來源，逐項補學校來源及link audit集合。
- 真正補研究與設計參考，記錄讀過來源、日期、採用手法及限制；更新方法、Known Limitations、DECISIONS與實測現況。所有產品可見文字集中`src/strings.ts`，原始底層exception映射成友善訊息，技術診斷可留測試log。

## 必須使用的 skill／工具

開工列出**實際可用**skill／工具／MCP、用途與未使用原因；用能力改善工作，不只列名字。優先讀`diagnosing-bugs`／除錯流程、`security-best-practices`、Playwright、無障礙／impeccable設計審查、PDF與文件相關能力；若該Cursor環境沒有則如實說明並使用可用對等工具。

前輪稱security skill沒有React/JS參考，實際存在：`<HOME>/.codex/skills/security-best-practices/references/javascript-typescript-react-web-frontend-security.md`與`javascript-general-web-frontend-security.md`，請確實讀取相關內容。PDF若有現成測量／渲染能力請使用，勿只以字元數猜寬。Context7核對fflate/MIME相關API，不能假稱使用不存在的工具。官方內容要實際開頁。

使用Playwright production UI／真正Worker／SW網路監看、native WebCrypto／IndexedDB交錯探針、Vitest、CDP記憶體、axe／真Tab、PDF字形與渲染檢查。全部合成資料。不得用程式碼閱讀替代操作。

## 完成後的驗證指令與預期結果

- `npm run check`、`npm run test:e2e`、Firefox／WebKit同套production E2E、`npm run catalog:links`。NO_COLOR／FORCE_COLOR衝突是執行器環境警告，應如實區分；可用`env -u NO_COLOR npm run test:e2e`避免衝突，不能隱藏產品warning。
- 複製本輪`domain/vitest.config.ts`及測試到**新的Cursor驗證目錄**後執行65案、18日期、原Provider3案、state-supplement3案及PDF檢查。預期所有正式oracle通過，A/B最終B、unlock/wipe後無舊資料、1,655,647原樣還原、PDF無越界字形。
- 複製並重跑`parser/probe.mjs`、`expanded-probe-64k.mjs`、`address-probe.mjs`、`labeled-accuracy-extended.mjs`及`browser-format.mjs`／`browser-extra.mjs`；修完不應再有上述最小樣本FP/FN、假帳號列、包裝信心差異或2,000 ZIP stack overflow。記錄真實分類指標，不推論100%真實世界準確。
- 重跑root `browser-audit.mjs`、`browser-expanded.mjs`、`browser-critical.mjs`的正式斷言，正常操作產品對外請求0、無console錯誤警告、所有資料清除、備份可還原、完成確認與假設顯示可見。`critical-initial.json`／`initial-expanded.json`的selector錯誤已更正，不得把錯誤selector當產品需求。
- 完整schema13個誤接受案例須拒絕，另2個例外須回傳明確診斷、正常40筆通過，官方來源與日期完整、至少10筆email/export官方實讀比對。403仍標本次受阻，不能改成通過或猜測死鏈；必要時保留可追溯官方正文證據。
- 真正Worker重新做300MiB／2GiB／ZIP與取消，保存進度／bytes／心跳／Worker heap取樣與整個獨立瀏覽器RSS；這輪已有真Worker量測，不能退回只用Node宣稱通過。light/dark／390px／desktop／reduced-motion／axe／鍵盤完整回歸。
- Google／Apple／Outlook真實ICS匯入、OS提醒、VoiceOver/NVDA、實機手機/Safari、真安裝PWA離線沒實做就明列未實際執行。headless與SW reload不能冒充。

## 禁止事項

不得改壞已通過部分；不得為過關刪功能（包括PDF、通知、加密）、測試或服務資料；不得任意截斷帳號或放寬隱私／CSP／安全限額；不得用編造步驟或數字補缺漏、弱化oracle、隱藏warning；不得覆寫既有`output/acceptance-round-1/`或`round-2/`證據。重跑harness先複製到新目錄並修改輸出位置，保留歷史。

只改本專案與原聊天範圍，禁止remote／push／部署／公開。Codex的4173預覽已停止，你可自行啟動。自主完成後才回`READY_FOR_ACCEPTANCE — FIX_ROUND_2`，附新commit、真實命令、證據位置、未實測與限制；沒完成就如實IN_PROGRESS／INCOMPLETE，不把舊READY當結果。之後Codex進第3輪完整獨立驗收，最多8輪。
