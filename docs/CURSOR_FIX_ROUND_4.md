# 【第 4 輪修正】

獨立驗收版本 `be7d5dd840a9761a95bfa2a8918a3a89168bda17`，仍未通過。原始固定 13 項 P0：**6 通過／5 失敗／2 未完整實測**。第三輪既有自動回歸已通過，但新交錯操作重現清除後舊 vault 復活及新資料誤刪，不能以舊案例過關宣稱隱私問題結束。完整規格仍是 `docs/ORIGINAL_PROMPT.md`。

請先讀 `docs/ACCEPTANCE_ROUND_4.md`、本檔、`docs/TEST_REPORT.md` 最新段與 `output/acceptance-round-4/domain/FINDINGS.md`、`parser/FINDINGS.md`、`catalog/AUDIT.md`。先記 `IN_PROGRESS — FIX_ROUND_4`，自主完成後才回 `READY_FOR_ACCEPTANCE — FIX_ROUND_4`，附新提交與真實驗證。

## 問題清單：檔案＋行號＋問題＋原因＋原始章節

1. **最高優先：跨頁通知與已完成 epoch 讀取交錯，舊加密資料仍可在清除後讀回。** `src/ui/state.tsx:95–105,139–144`、`src/lib/epoch.ts:46–51`。實際 React Provider／native IDB／WebCrypto：B 的第 2 次 epoch 讀取已完成，只延後既有 await 的回傳；A wipe 後 keys 空；B 續寫舊 vault；真 BroadcastChannel wipe 通知先抵達並更新 `seenEpoch`；postcheck 因 `seenEpoch !== epochAtStart` 跳過 cleanup。第三頁重開 locked=true，以合成密碼解鎖回 true 並讀回 `SYNTHETIC_FENCE_OLD_SECRET`。沒有在 writeKey 入口新增 yield、沒有偽造資料庫或 crypto 結果。原第 0／9／11／12／13 章。證據 `domain/state-fence-results.json`、`state-fence.mjs` 及 bridge。
2. **舊作業整庫 cleanup 會刪掉 wipe 後的新工作區。** `src/ui/state.tsx:98–116`、`src/lib/epoch.ts:54–59`。B 舊寫入已 native commit 且連線已關，只暫停回傳；A wipe；C 新建並存好 `SYNTHETIC_FRESH_C`；B 恢復後 `deleteAppDatabase()` 把 C 也清掉。C 仍顯示 saved，reload 變空。延後真 BroadcastChannel 及沒有此 API 的降級兩案皆重現。原第 7.1／9／11／12／13 章。`domain/state-epoch-results.json` 第 1、2 案。這與第 1 組是不同結果：禁止用清整庫修復舊資料後，卻犧牲新資料。
3. **可正常接受並保存的工作區，仍無法還原自己的備份。** `src/lib/workspace.ts:4,84–85,168`、`src/ui/App.tsx:925–937`。實際 `scanReadable` 串流 1,867,969 bytes 合成 mbox 產生 10,001 帳號／10,005 任務，自己的 JSON 5,945,066 bytes 被 5MB 匯入限制拒絕。另一案正式 UI 可輸入／保存 100,001 字 notes，小型 JSON 仍被 100,000 字限制拒絕，實際 file input 匯入顯示 invalid workspace。5001／4001 舊案已過，不要只再抬兩個數字。原第 6／7.1／9／11／12／13 章。`domain/scanner-backup-10001.json`、`long-note-100001-roundtrip.json`、`browser/long-note-100001-import.json`。
4. **epoch 儲存失敗時，清除原因與狀態不實；重試成功仍留舊錯誤。** `src/ui/state.tsx:309–322`、`src/strings.ts:334`、`src/lib/epoch.ts:31–42,63–65`。實注 control DB put 的 QuotaExceededError 後，wipeDeviceData 未執行，原個人合成 policy 仍在 DB，畫面卻空白且 phase=saved，錯稱另一分頁開著。恢復 put 再 wipe 後 DB 清空，但錯誤永久殘留。原第 9／11／12／13 章。`domain/state-epoch-results.json` 第 3 案。保留原先一般 save quota 成功清錯的已過行為。
5. **escaped comment 的假地址成為寄件／學校證據。** `src/parser/headers.ts:106–115`。合法 comment 中 `\)` 是 quoted-pair，不應結束 comment；目前提前終止後採用 comment 內的假 school/GitHub 地址。Node 與正式 Worker 都重現。原第 6.2／9／12／13 章。`parser/fresh-probe-results.json`、`browser-fresh-probe-results.json` 與 `fixtures/address-escaped-comment-*.eml`。
6. **合法 angle addr-spec 的 atom local-part 漏判。** `src/parser/headers.ts:55–63,117–123`。`<o'connor@school.example>` 與 `<ada=class@school.example>` 被限制過窄的 ATOM 拒絕，To／From 共 3 個正式 Worker 案例完成卻為 0 帳號；bare apostrophe 對照正常。這是 ASCII 協定語法，與不阻擋的 IDN／SMTPUTF8 觀察不同。原第 6.2／9／12／13 章。相同 address/browser fresh probe 與 fixtures。根據本輪實讀 [RFC 5322 §3.2.1–3.2.3、§3.4.1](https://www.rfc-editor.org/rfc/rfc5322.html)，quoted-pair 可在 comment，atext 包括 apostrophe 和 equals；不要只加這兩字的測試特判。
7. **證據滿八筆後，新學校命中被截掉，合併信心與判斷依據錯誤。** `src/ui/App.tsx:558–587`，尤其 `:580,584–585`。未設定學校時先匯入 8 封 personal receipts→Low/count8；設定 school.example 後匯入第 9 封 school receipt，第二次 Worker 回 Medium／schoolMatch=true，但 UI 合併 count9 仍 Low，八筆證據全是 personal，reload 仍錯。原第 6.2／11／12／13 章。`parser/browser-evidence-merge-results.json`、`browser-evidence-merge.mjs`、`evidence-merge.png`。
8. **清除後仍有未說明的 control DB 技術殘留。** `src/lib/epoch.ts:1–3,45,63–65`、`PRIVACY.md:19–21`、`src/strings.ts:138,162–168`。正式 UI wipe 後逐一枚舉所有 IndexedDB，仍有 `after-school-control/kv/epoch` 隨機字串；local/session/cache/SW 均空且此 marker 沒有合成個資 sentinel。這不是個資外送，也不等同第 1 組復活，但原使用者要求全部本機資料清除，確認文字是 everything stored，且隱私頁／文件未交代 marker。原第 0／9／11／13／14 章及本聊天 2.1。`browser/storage-after-wipe-all-databases.json`。須兼顧清除承諾與跨頁安全，不可悄悄放寬要求或直接刪 marker 讓第 1 組復發。
9. **研究仍缺信箱探索／隱私工具比較與抱怨調查。** `docs/RESEARCH.md:53–59`，`:55` 明寫 Mine 沒讀而不列入；這一類實際未研究。其他目錄／官方匯出／API／DESIGN 已補，勿重述全缺。原第 5／14 章。`catalog/AUDIT.md` 有可讀官方 MineOS email-discovery FAQ、Discovery Radar 可供自行重讀；須明分企業 MineOS 與歷史消費者 Mine。抱怨目前全為未取得，誠實但未完成：真正查找、讀來源、記日期與障礙，單例只能稱觀察案例，不能把官方限制稱使用者抱怨或編造常見程度。
10. **兩筆官方內容仍欠獨立可回查證據。** `src/data/catalog.json:671` Coursera、`:1153` Evernote 及相應來源。第 4 輪仍只讀到 loading／challenge 殼，故 P0.3 保留未完整實測。不是已證錯誤、死鏈或造假；其他 11 服務成對抽核、40 筆來源日期、schema、Slack／PST／學校來源已過。原第 6.3／12／13／14 章。請提供原本逐步查證的可追溯證據，或合法可讀的官方等價來源；若不能確認欄位就誠實 Unverified，保留服務與可用備援，不得造步驟。12 個 HTTP403 不能自動改成通過，也不能只為使腳本 exit0 移除來源。

## 修正要求：具體作法與預期結果

- 先用實際 native await 交錯探針重現第 1、2 組，再檢討完整跨頁提交協定。清除與存入的有效性應在真正提交時受保護，不能依 UI `seenEpoch` 是否已更新來決定舊寫入是否安全；清理必須辨識自己過時的資料，不能刪新 epoch 已存資料。保留無 BroadcastChannel 降級與雙 unlock／replace／明密切換的既有保護。可用成熟瀏覽器協調原語，但須有可操作的支援界線及必要降級，不新增遠端服務。
- 第 3 組要統一接受、儲存、匯出、匯入的資源契約並涵蓋所有入口。既有已接受資料須有無損備份／還原途徑，不得截帳號或默默丟 notes。合理且明確的防濫用界線可以存在，但不能在檔案已下載後才讓同版產品拒絕它；測試應驗證契約與邊界，而非只換上更大的 magic number。
- 第 4 組讓失敗原因、畫面狀態、實際保存狀態一致；wipe 失敗不能顯示已成功刪除，重試成功清除該失敗訊息。完整保護仍應 fail closed，不能用忽略 control DB 錯誤來讓舊資料復活。
- 第 5、6 組統一處理結構、comment、quoted-pair、quoted local、angle／bare addr-spec 與 RFC2047 display token。優先評估成熟可本機 bundled 的地址 tokenizer／parser 或協定完整狀態機，保留 streaming／標頭長度上限；不用現成工具要有協定來源與跨語法測試依據，不繼續一個正規式補一個例子。
- 第 7 組分開「可界定大小的展示證據」與「分類所需完整聚合訊號」，保留必要 school-match 摘要及具代表性的依據；合併／順序／分批／保存重載應一致。不要改成無界保存信件主旨、本文或每封 evidence。
- 第 8 組須實際列舉全部 DB／store 驗證。以原要求達成清除與安全；若技術方案確實只能保留不含個資的 marker，必須在隱私頁、確認文案、PRIVACY／DECISIONS 明確說明用途、內容與生命週期，將偏離原全清要求列為未解決，不能自行授予隱私例外或宣稱通過。
- 第 9、10 組只補真正未完成的研究／查證，保留已過的設計與指南；記清未讀到正文的界線。七類行事曆／讀屏／實機／安裝驗證不是程式錯誤，沒真做仍列待驗證，不捏造完成。

## 必須使用的 skill／工具

開工先列本環境**實際可用**的 skill／工具／MCP、各自用途與未使用理由。優先使用除錯、資安審查與瀏覽器測試能力，讀可用的 `diagnosing-bugs`、`security-best-practices`（含 React／JS 參考）與 `npm-skill`；用既有 Playwright／Vitest／native IDB／WebCrypto／BroadcastChannel 精確控制既有 await 的完成通知，不能新增原本不存在的提交前 yield 來製造證據。請讓資安審查再獨立檢查整體協定。

地址實作反覆漏語法，請用 RFC 原文及 Context7 查可用 parser 工具、API、授權與 bundle 行為，評估成熟工具後再決定。新增依賴前說明用途、授權、體積、無執行期外連與成本；不新增也記原因及驗證。研究用官方文件與實讀來源；文件能力用於一致性審查。不要只列 skill 名稱卻未讀未用，也不要把 Codex 的環境能力誤稱你已使用。

## 完成後的驗證指令與預期結果

1. `npm run check`；`env -u NO_COLOR npm run test:e2e`；Firefox／WebKit 的 production E2E；`npx vitest run --config vitest.large.config.ts`。全部零警告、保留所有原斷言與功能。若 4173 被佔用先辨識同專案程序，不能關其他使用者服務。
2. **先複製** `output/acceptance-round-4/` 的 harness 至 `output/cursor-verify-round-4/` 並改所有輸出路徑，禁止覆寫任一 acceptance 歷史。domain 含 `state-epoch.mjs` 與 `state-fence.mjs`／bridge；root 包含新 `browser-long-note.mjs`；parser 包含 address／fresh／evidence merge／offline scan。來源 bundle 的重新編譯方式見各腳本，不能測舊 bundle。
3. root 本輪 31 案 30 過／1 失敗；domain 114 案 108 過／6 失敗，逐層數見 FINDINGS 與總報告；parser 舊 43＋17 核心皆過，新地址 5 失敗與 evidence merge 失敗需修。預期所有既有回歸與新案例都過；同一缺陷的 Provider／production 證據不合併成多個缺陷。任何測試 oracle 修正須保留理由與舊輸出，不能刪失敗。
4. 對第 1、2 組具體驗：wipe 後重開不可解鎖出舊資料；新工作區 C 保存後不被舊 B 清掉，reload 仍 C；通知提前／延遲／API 不存在均涵蓋。第 4 組 quota 後不誤報成功／原因，成功重試後 error 清空。正常所有 storage 清除逐一枚舉，不只讀 `after-school` 一個 DB。
5. 最終 build 若 parser 有改動，重測真正 Worker 300MiB、2GiB 單／多封、300MiB ZIP、2000 小 EML、取消、進度與 CDP heap／全 Chromium RSS；產品外連 0、惡意 HTML 執行 0。不能用 Node 數字當 Worker；不能沿用變更前大檔數據。保留分類集 TP/FP/FN/TN 與新增格式測例，勿宣稱真信箱準確率。
6. `npm run catalog:links` 真實執行並保存每 URL 狀態；403 保留未知。官方正文證據與研究來源可回查；全英文 UI 字串仍集中。重做 axe、真鍵盤、390px／桌面、深色 Expired 對比、reduced-motion、PDF 渲染與 JSON 往返，不只驗剛改處。
7. 更新真實 TEST_REPORT／Known Limitations／狀態；Google、Apple、Outlook 真 ICS 匯入及提醒、讀屏、真手機、OS 安裝 PWA 沒做就列未實際執行。完成後由 Codex 第 5 輪重新全面驗收，總上限 8 輪。

## 禁止事項

不得改壞已通過部分；不得為過關刪功能、測試、服務、PDF、通知、加密或帳號資料；不得捏造數字、步驟、官方閱讀或常見抱怨；不得弱化斷言／CSP／本機隱私。不可任意砍到 5000 或 10000 帳號，不可把大筆 notes 丟掉。IDN／SMTPUTF8 與只改 ZIP 加密旗標仍為原非阻擋觀察，不灌成新 P0。只有合成信箱可測。

只操作本專案與本聊天。不建立 remote／repo，不 push，不部署／公開。root 會在交接前停止自己的 4173 preview。先完整實作、實測與記錄，再回新 READY；未完如實 IN_PROGRESS／INCOMPLETE，不沿用 FIX_ROUND_3 的舊 READY。
