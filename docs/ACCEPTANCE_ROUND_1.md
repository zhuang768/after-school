# 第 1 輪獨立驗收

日期：2026-10-19（Asia/Taipei）。驗收版本：`37f3ac9c43cb5060ddb4aa42eb20a4d8cf982e38`，功能提交為 `b070e03e799097e554df0facbdfdb61416e2c637`。

**本輪未通過。** Codex 只執行驗收與撰寫交接文件，沒有替 Cursor 修改功能。所有信箱、筆記、密碼及工作區測資均為合成資料。沒有推送、發布、部署或修改外部帳號。

## P0 的固定分母：13 項

| 原始 P0                        | 判定 | 實測結果與尚缺內容                                                                                                                                                           |
| ------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 本機解析引擎                | ❌   | 真正 Worker 完成 300 MiB / 2 GiB；但 ZIP 防護、損毀處理、取消終態、學校證據、MIME 分類與 ZIP 進度有失敗。                                                                    |
| 2. 三種輸入與學校網域          | ❌   | 匯入、手動新增、目錄加入及保存可操作；指定學校網域仍混入純個人收件，本文還能誤造 schoolMatch。                                                                               |
| 3. 40 筆官方服務目錄           | ❌   | 40 筆、8 類、日期及來源欄位存在；11 筆官方內容抽驗有依據，但來源對應缺漏、schema/負向驗證不足，12 網址本輪被 403 阻擋。                                                      |
| 4. 任務與風險排序              | ❌   | 五因素與決定性測試通過；Not mine → Mine 遺失筆記/步驟/狀態，正常 UI 無建立刪除任務入口。                                                                                     |
| 5. 逐項及通用引導              | ❌   | 服務步驟、勾選與客服範本可操作；重要性、風險理由、學生方案影響及完成後確認不足，來源未完整呈現。                                                                             |
| 6. 學校雲端、郵件、聯絡人      | ❌   | 三個任務都能開啟；實際頁面三者的官方連結數均為 0，沒有確認日期；Gmail 轉寄缺啟用及 Save Changes。                                                                            |
| 7. 儀表板與報告                | ❌   | 進度會更新，下載可用；混合狀態報告漏掉 Done 任務及筆記，已完成清單不可充分找到，PDF 會截斷長字串。                                                                           |
| 8. 倒數、Today、時間表、ICS    | ❌   | 排程基礎、日期邊界與完成後推進可用；Today 有 UTC/台灣日期差異、未知日期被改成今日、ICS 可被 ID 注入、換行處理有錯；畫面未提供實際剩餘天數。                                  |
| 9. Already expired             | ❌   | 實際設定已過期日期後有補救橫幅、IT/校友/客服指引；目前救援內容以更換設定為主，缺少使用其他救援信箱/電話/備援方法嘗試復原已鎖帳號的清楚路線。一般政策亦缺來源日期及例外說明。 |
| 10. 本機保存、清除、備份、離線 | ❌   | 一般保存、JSON 往返、SW 控制瀏覽器離線流程可用；清除後舊加密保存可寫回；儲存失敗不顯示；忘記密碼後無清除入口。實際安裝 PWA 後離線未執行。                                    |
| 11. 示範與首次使用             | ✅   | 首屏直接說明用途與本機隱私，示範有標示；已實際走過示範確認、遷移、完成、保存及匯出。此通過不代表其他引導或報告缺陷已通過。                                                   |
| 12. 無障礙、響應式與各種狀態   | ❌   | 穩定畫面仍有 8 筆 axe 對比違規紀錄；390px Today/Report 寬到 736px；匯入控制項的鍵盤焦點被裁掉；損毀/取消/儲存錯誤狀態不完整。                                                |
| 13. 隱私與 Methodology         | ❌   | 兩頁存在，connect-src 實際阻擋外連；但清除承諾與競態不符，部分 UI 字串未集中，Methodology 未完整揭露分數/門檻與日期規則。                                                    |

合計：**通過 1、失敗 12。** 各項只要有必要子項已證實失敗，就列失敗；尚未執行的子項仍另列，不會因主項已失敗而消失。

## 實際命令與證據

證據根目錄：`output/acceptance-round-1/`，依原設定被 Git 忽略。

| 測試                                                      | 結果                                                                    | 證據                                              |
| --------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| `npm run check`                                           | 退出碼 0；格式、lint、型別、15 單元測試、production build 通過          | `check.log`                                       |
| 原有 production E2E，用獨立設定連接相同 production server | 退出碼 0；3 通過                                                        | `baseline-e2e.log`, `baseline-e2e.json`           |
| 任務/匯出獨立 Vitest                                      | 33 案：23 通過、10 失敗                                                 | `domain/results.json`, `domain/FINDINGS.md`       |
| 真 Chromium Provider + IndexedDB + WebCrypto              | 3 案：1 通過、2 失敗                                                    | `domain/state-browser-results.json`               |
| 3 時區 × 6 純日期邊界                                     | 18/18 通過                                                              | `domain/date-boundaries-results.json`             |
| 解析器獨立探針                                            | 原始 25 案：11 通過、14 探針斷言失敗；其中 3 案不作規格失敗，見下方限定 | `parser/probe-results.json`, `parser/FINDINGS.md` |
| 主要瀏覽器流程                                            | 10 個有效執行紀錄：2 通過、8 失敗；另 1 個初次程式焦點探針不採用        | `browser/results.json`                            |
| 補測引擎、手動/目錄輸入、真 Tab、三個學校指南             | 6 組：4 通過、2 失敗                                                    | `browser/supplement.json`                         |
| 目錄連結稽核                                              | 退出碼 1；55 網址：43 HTTP 200、12 HTTP 403，未發現 404                 | `catalog/independent-link-audit.json`             |
| 服務結構獨立檢查                                          | 40 唯一 ID、50 唯一可註冊網域、8 類，當前資料結構檢查通過               | `catalog/structure.json`                          |

**計數界線：**以上選定的獨立回歸執行紀錄，排除 3 個非規格阻擋的 parser oracle 及 1 個已由真 Tab 補測取代的焦點探針後，為 **92 個有決定性的案例：59 通過、33 失敗**；另有 4 個不採作阻擋判定的探針。這不是 33 個獨立缺陷，也不是 P0 分母。既有 15 單元與 3 E2E 另列，16 封分類樣本不是另外 16 個回歸案例。

三個 parser 非阻擋探針是：自行訂的 5,000 帳號上限、正式 File UI 未重現的 2-byte signature 切分、非標準未跳脫的 From 本文。10,001 帳號的結果增加屬容量風險，不能據此宣稱已測到 OOM，也不能要求任意刪掉超過 5,000 的資料過關。

E2E 執行器另出現一則 NO_COLOR/FORCE_COLOR 環境設定警告，和應用程式本身的 CSP console 錯誤分開記錄；未將它們隱藏為零警告。

## 隱私與安全

- 實際掃描含惡意 HTML / 遠端圖片的合成 mbox → 確認 Mine → 填寫筆記與勾選 → 完成 → 日期/時間表 → ICS/文字報告/JSON 往返：觀察到對外請求 **0**。網路紀錄在 `browser/results.json`；Worker 大檔也各為 0。
- `BODY_SENTINEL_79361` 未存入 IndexedDB；預設不保存的 `SENSITIVE_SUBJECT_SENTINEL` 也未存入。實際檔案證據為 `browser/stored-after-scan.json`。這不等於能證明瀏覽器 GC 立即實體清零。
- 個別測試主動發出合成 fetch 探針，觀察到 `securitypolicyviolation` 的 `connect-src`，證明該限制有生效。此測試探針和產品自發請求分開，不算產品外送。
- `frame-ancestors` 放在 meta 會被忽略；建置腳本額外插入 inline SW script 被自身 script-src 阻擋。正式頁面初次載入有 2 個 console error，不能稱 CSP 全部失效，也不能稱零錯誤。
- **已證實清除競態：**暫停 WebCrypto 加密結果完成，先清除，再讓原作業完成，IndexedDB 的 vault 被寫回。production 重現的 `browser/after-wipe-race.json` 和獨立 Provider 測試互相支持。沒有觀察到這些資料外送。
- 儲存配額故障注入後，筆記消失但沒有 alert；已鎖定畫面沒有 Delete all my data。均使用獨立合成 browser context。
- 被略過的 40 MiB big.bin ZIP 項目仍被完整解壓 41,943,040 bytes，避開限制；截斷 ZIP 有卡住或誤報完成。詳 `parser/FINDINGS.md`。
- 匯入 ID 的 CRLF 可讓 5 任務輸出 6 個 VEVENT；僅測檔案結構，沒有將惡意 ICS 匯入外部帳號。詳 `domain/FINDINGS.md`。

## 大檔 Worker 與分類

| 情境                          | 真正讀取量          | Worker 時間 | 進度事件      | Worker heap 取樣峰值 | 獨立 Chromium 全程序 RSS 取樣峰值 |
| ----------------------------- | ------------------- | ----------- | ------------- | -------------------- | --------------------------------- |
| 300 MiB / 1,655,647 封        | 314,572,800 bytes   | 5,711.5 ms  | 28            | 49,397,040 bytes     | 421,986,304 bytes                 |
| 2 GiB / 32,768 封 binary 本文 | 2,147,483,648 bytes | 1,661.6 ms  | 10            | 156,291,772 bytes    | 705,183,744 bytes                 |
| 300 MiB stored ZIP            | 314,572,942 bytes   | 7,088.6 ms  | 僅完成前 1 次 | 57,282,260 bytes     | 449,167,360 bytes                 |

這些均由正式版 file input 啟動 Dedicated Worker，以 CDP 取 Worker heap、按 Chromium PID 集合讀 RSS；主執行緒心跳持續。RSS 包含 browser/renderer/GPU 等成本。2 GiB 是節省磁碟的稀疏合成 binary 內容，不能推論真實 Takeout 吞吐或任意大量帳號的記憶體上限。取樣峰值不是保證捕捉的瞬間最大值。另一次 2 GiB 單封只有兩次 heap 取樣，不用來證明峰值。

獨立 16 封標記合成 EML 得 TP10 / FP2 / FN2 / TN2：precision 83.33%、recall 83.33%、accuracy 75%。誤判包含歡迎電子報與附件 welcome；漏判包含 base64 驗證/重設本文。這只代表小型、刻意含陷阱的合成集，不是真實信箱準確率。原始資料與方法在 `parser/labeled-accuracy-results.json`。

## 介面、無障礙與跨引擎

- Chromium 156.0.8078.4、Firefox 157.0、WebKit 27.2 均實際啟動，示範確認並等待保存後重新載入通過。這些是 headless 引擎，不能稱為實機手機或原生 Safari。
- 兩個首次即時 reload 案例在 200ms debounce 內失去剛選的 Mine；等待 700ms 的對照皆通過。這是保存視窗問題，不是 Firefox/WebKit 特有不相容，也不是未執行。
- 1440×960 淺色、390×844 深色，各測 8 路由，等出現動畫結束後跑 axe：深色有 8 筆對比違規紀錄，banner 約 1.32:1，quiet button 約 1.03:1。初次淺色動畫中的暫態對比結果不作阻擋依據。正式證據為 `browser/accessibility-stable.json`。
- 390px 的 Today/Report scrollWidth 實測 736px；未換行的 pre 造成橫向溢出。
- 真實 Tab 可到 file input，且 input 符合 focus-visible，但 outline 被 `clip: rect(0 0 0 0)` 裁掉，wrapper 無可見焦點。證據 `browser/real-keyboard-focus.json` 與圖片。
- SW 控制後可離線重新載入、跑示範確認/完成/日曆匯出；Chromium installabilityErrors 為空。兩者都不是「已實際安裝 OS PWA 後完成離線流程」。
- 提醒按鈕在已過期案例只呼叫 requestPermission，沒有建立 Notification 呼叫；使用替代 Notification 觀察，沒有測 OS 投遞。

## 規範檢查（Standards）

依 AGENTS.md 與原始第 1/9/13/14 章：使用者可見錯誤仍散落 parser、scan-client、state；CI 目錄為空；缺 LICENSE 與依賴用途/授權文件。RESEARCH 與 DESIGN 缺原需求要求的具體來源與研究。完整逐項記錄在 `catalog/AUDIT.md`。本案是新 repo，以整個 HEAD 為審查範圍，規格直接採使用者提供的原始檔案，沒有虛構議題追蹤器或既有比較分支。

## 規格檢查（Spec）

以原始 13 項 P0 為固定分母；功能性缺陷見上表及 `parser/FINDINGS.md`、`domain/FINDINGS.md`。沒有因單元通過而把漏項改成通過；沒有因 Unverified 比例高就指稱資料編造。11 筆官方摘要大致有依據，其餘 29 筆本輪未逐頁重新抽驗；40 筆全部的來源欄位與結構另已查核。

## 未實際執行與使用者親驗

本輪尚未執行的 7 個具體驗證：Google Calendar 真實 ICS 匯入、Apple Calendar 真實匯入、Outlook Calendar 真實匯入、VoiceOver/NVDA 人工抽測、實體 iOS Safari、實體 Android Chrome、實際安裝 OS PWA 後離線完成全流程。原生 Safari 亦不能以 WebKit 引擎結果代替。這些尚未實測，不宣稱一定是環境無法完成；修正後應續驗。

使用者專屬事項另列，不當成迴圈卡關：自己的真實信箱在自己的電腦測一次、不上傳；抽查自己常用服務；決定 GitHub repo、網域與是否公開。這些目前沒有執行。

## 下一步

將 [CURSOR_FIX_ROUND_1.md](./CURSOR_FIX_ROUND_1.md) 原樣交給原 Cursor 聊天修正。保留已通過的行為、資料及測試，不自行代寫功能。Cursor 回報後，重新做完整驗收而非只重測修補處；最多 8 輪。
