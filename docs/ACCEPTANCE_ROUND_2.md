# 第 2 輪獨立驗收

日期：2026-10-19（Asia/Taipei）。驗收提交：`c8c0d36cb3d2155c2c25f8059a8e1573e267c7d3`，對應 Cursor 的 `READY_FOR_ACCEPTANCE — FIX_ROUND_1`。已確認 Cursor 完成、沒有生成中的操作，且檔案停止變動後才開始。

**本輪仍未通過。** 第一輪多項缺陷已修復，但新交錯操作仍會讓清除的資料復活，也有常見信件格式、批次匯入、備份與列印缺陷。Codex 僅寫獨立驗收 harness、合成測資及驗收文件，沒有修改正式功能。沒有建立 remote、推送、部署或公開。

## 固定 P0 分母：13 項

| 原始 P0                    | 判定 | 本輪實測與必要缺口                                                                                                                                                          |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 本機解析引擎            | ❌   | 真正 Worker 完成 300 MiB／2 GiB，取消、ZIP 進度與舊炸彈案例已通過；但巢狀 MIME、編碼、地址剖析、電子報、跨檔信心及有效 2,000 封 ZIP 仍有失敗。                              |
| 2. 三種輸入與學校網域      | ❌   | 匯入、目錄、手動、未知服務手動歸類都實際可用；重複手動新增會產生相同 ID，學校地址顯示名稱也能誤造收件證據。                                                                 |
| 3. 40 筆服務目錄           | ❌   | 40 筆／50 唯一可註冊網域／日期來源存在，14 筆同時重新核對官方 email/export；但完整 schema 負向驗證與教育方案語義未過。12 網址 HTTP 403，3 服務正文未成功讀取。              |
| 4. 任務與風險              | ❌   | 五類任務可達、五狀態、備註、勾選、排除再確認保留工作皆通過；一般機構風險被當成教育優惠失效，實測各多加 50 分。                                                              |
| 5. 逐項／通用引導          | ❌   | 已有風險理由、來源、官方新分頁、備援步驟、可複製客服訊息；完成 GitHub 任務後仍缺完成確認與救援／雙重驗證提醒。                                                              |
| 6. 學校資料遷移            | ❌   | 三類學校任務與 recovery 均能開啟、複製；官方連結與日期已補，Gmail 啟用轉寄步驟正確；但各任務部分主張缺對應來源，新增來源未全納入連結維護。                                  |
| 7. 儀表板與報告            | ❌   | 完成清單、進度、混合狀態文字報告及筆記完整；PDF 保留原文後，寬字母仍超出紙張被裁切。                                                                                        |
| 8. 倒數／Today／ICS        | ❌   | 台灣凌晨實際 UI、期限變更、Today、已過期、ICS 結構與未知日期 VTODO 通過；Today 的推算停用日沒有標為假設；三套行事曆真實匯入尚未執行。                                       |
| 9. Already expired         | ❌   | 已過期橫幅、IT／校友／客服／其他救援信箱電話與備援碼路線可達；Today 政策仍用缺來源日期與例外的舊文案，和學校郵件頁不一致。                                                  |
| 10. 保存／清除／備份／離線 | ❌   | 舊保存後清除競態、所有儲存區與 SW 清除、配額錯誤提示、鎖定時清除出口及一般往返通過；解鎖後清除競態、加密逆序保存、大型計數與重複手動帳號備份仍失敗。真安裝 PWA 後離線未做。 |
| 11. 示範與首次使用         | ✅   | 首屏直接說明用途與資料留在裝置；示範有合成標示，能確認、完成、保存及匯出。此判定不涵蓋其他列已確認的缺陷。                                                                  |
| 12. 無障礙／響應式／狀態   | ❌   | 等動畫穩定後 16 路由變體 axe 零違規、390px 無橫向溢出、真 Tab 焦點可見、減少動態生效；不支援格式缺現場操作指引，部分底層錯誤與失敗後暫存列仍不友善。讀屏與實機未做。        |
| 13. 隱私與 Methodology     | ❌   | 正常操作及 Worker 外部請求 0，CSP header/meta 與阻擋探針生效；清除承諾仍違反解鎖競態，Methodology 的信心條件尚未完整一致。                                                  |

合計：**通過 1、失敗 12、未判定 0**。這不是說第一輪修正沒有進展；固定主項只要仍有一個必要子項失敗，就不能改成通過。另有 **7 項指定的外部／實機／安裝測試未實際執行**，列於文末，不會因主項失敗而省略。

## 真實命令、數字與證據

根目錄：`output/acceptance-round-2/`（Git 忽略）。不同層級會覆蓋同一缺陷，以下數字不相加成缺陷數或完成率。

| 實際執行                                                         | 結果                                                                                                             | 證據                                                                              |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `npm run check`                                                  | 退出碼 0；格式、零 lint 警告、型別、6 檔 22 單元、production build 通過                                          | `check.log`                                                                       |
| `npm run test:e2e`                                               | production Chromium 3／3 通過；初次執行器有 NO_COLOR／FORCE_COLOR 環境警告                                       | `baseline-e2e.log`                                                                |
| `env -u NO_COLOR npm run test:e2e`                               | 退出碼0，3／3通過，沒有執行器環境警告；只清除衝突環境變數，沒有隱藏產品錯誤                                      | `baseline-e2e-clean-env.log`                                                      |
| Firefox／WebKit production E2E                                   | 各 3／3 通過；獨立 config 使用同一 production preview                                                            | `firefox-e2e.log/.json`, `webkit-e2e.log/.json`                                   |
| `env -u NO_COLOR npx vitest run --config vitest.large.config.ts` | 1／1通過；Node直接parser 300MiB，8,383ms，heap取樣峰值95,010,024 bytes、RSS235,651,072 bytes；與下方真Worker分開 | `large-node.log`, `large-node.json`                                               |
| root 獨立 production 瀏覽器                                      | 25 案：19 通過／6 失敗                                                                                           | `browser/results.json`（10／0）、`expanded.json`（8／3）、`critical.json`（1／3） |
| 任務／排程／匯出 Vitest                                          | 65 案：64 通過／1 失敗                                                                                           | `domain/results.json`                                                             |
| 3 時區真正 DST／日期邊界                                         | 18／18 通過                                                                                                      | `domain/date-boundaries-results.json`                                             |
| 真 Provider／IndexedDB／WebCrypto                                | 舊 3／3 通過；新 3 案 1 通過／2 失敗                                                                             | `domain/state-browser-results.json`, `state-supplement-results.json`              |
| 真 PDF 字形與渲染檢查                                            | 3 案：2 通過／1 失敗                                                                                             | `domain/pdf-inspection.json`, `wide-note-page1.png`                               |
| parser 舊回歸，撤回自訂截斷 oracle                               | 25／25 通過                                                                                                      | `parser/probe-results.json`                                                       |
| parser 新格式探針                                                | 固定 64 KiB 版本 16 案：7 通過／9 失敗；Node Blob.stream 對照16案：8通過／8失敗，保留差異                        | `parser/expanded-probe-64k-results.json`, `expanded-probe-results.json`           |
| quoted address 探針                                              | 2 案皆失敗                                                                                                       | `parser/address-probe-results.json`                                               |
| production 格式／批次／HTML／大量 ZIP                            | MIME、電子報、批次失敗與信心差異正式 UI 重現；ZIP 200／500／1,000 通過，2,000 堆疊溢位；HTML 純文字及無外連通過  | `parser/browser-format-results.json`, `browser-extra-results.json`                |
| 完整目錄負向驗證                                                 | 有效對照 1 通過；13個非法案例被接受；2個以未處理例外拒絕、未回傳預期診斷                                         | `catalog/schema-probe.json`                                                       |
| `npm run catalog:links`                                          | 退出碼 1；56 網址：44 HTTP 200、12 HTTP 403                                                                      | `catalog/independent-link-audit.json`                                             |

root 最初寫錯幾個按鈕／任務名稱，已按實際 UI 修正測試後重跑；`initial-expanded.json` 與 `critical-initial.json` 留存，不將 selector 錯誤當產品缺陷。最終數字只用更正後結果。domain 的最初 33 回歸已包含於最終 65，不重複計數；分類 corpus 也不當額外回歸案例累加。

## 對應 2.1–2.10 的全面驗收

| 範圍                   | 判定   | 已實際驗證與剩餘問題                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.1 隱私               | ❌     | 掃描惡意 HTML→確認→筆記／步驟→完成→倒數→ICS／報告／JSON，產品對外請求 0。預設完整本文與主旨 sentinel 不在 IDB。正常 wipe 後 localStorage/sessionStorage/cache/SW/本 DB 全清空。**另一路解鎖途中 wipe 會復活 vault**，production 與 Provider 都重現。沒有觀察到外送。CSP connect-src 真阻擋，header frame-ancestors 生效，首頁與成功流程 console 無錯誤；重複新增的資料ID問題另列。依賴／程式未發現追蹤、廣告或第三方執行腳本。 |
| 2.2 資料真實性         | ❌／⚠️ | 所有 40 筆欄位結構、來源日期、50 網域及 generator 一致已查；本輪 37 服務讀到主要正文，其中 14 同時核對 email/export。Coursera 空殼、Amazon 503、Evernote 無法讀取，不能稱全40重新核對。403 不等於死鏈。完整 schema、教育語義、學校來源覆蓋仍不足，並非因 Unverified 比例判失敗。                                                                                                                                               |
| 2.3 本機解析           | ❌     | 真正串流 Dedicated Worker、300 MiB／2 GiB、進度、取消、容量與炸彈回歸、純文字 HTML 均實跑；新 MIME／地址／電子報／批次與2,000 ZIP 缺陷見 parser 報告。沒有使用真實個人信箱。原檔不保存，串流樣本有上限；不能把 GC 當作可證明立即實體清零。                                                                                                                                                                                     |
| 2.4 輸入／任務／風險   | ❌     | 三輸入、多學校網域、手動歸類、五類五狀態、筆記勾選、ownership 往返、決定性、五因子／權重與 recovery 路線已實跑。一般組織建議被當教育優惠加分；手動重複 ID 可由正常 UI 產生。                                                                                                                                                                                                                                                   |
| 2.5 指南／學校遷移     | ❌     | 每服務頁來源與風險理由已有、官方連結新分頁／rel 正確，客服與學校範本可實際複製。學校三類任務加 recovery，連結數 2／2／2／1，皆顯日期；尚缺部分主張來源。GitHub done 後沒有完成確認／2FA／recovery 提醒；不支援匯入現場也沒操作路線。畢業日加保留日數實際改變期限與任務日。                                                                                                                                                     |
| 2.6 倒數／提醒／過期   | ❌／⚠️ | 台灣 00:30 本機日曆日、今日任務、已過期與畢業已過／無帳號等邊界已跑。期限變動、逾期加分、完成後推進及未知日期 VTODO 通過。通知權限與建立呼叫實際被觀察到，**不是 OS 投遞驗證**。Today 未標推算假設；expired 的政策來源與例外不一致。三套行事曆匯入未做。                                                                                                                                                                       |
| 2.7 儀表板／匯出／離線 | ❌／⚠️ | 完成清單、進度環過渡、混合完成報告含筆記、JSON 一般往返、SW 控制後離線完成流程通過。寬字 PDF 裁切，大計數匯入失真、重複手動帳號不能還原自己的備份。SW 控制瀏覽器離線不是 OS 安裝 PWA 冷啟動，後者未做。                                                                                                                                                                                                                        |
| 2.8 UI／無障礙／動態   | ❌／⚠️ | 1440px 淺色／390px 深色各8路由，等400ms後 axe零違規、無橫向溢出；真Tab檔案標籤2px可見焦點。已實看截圖，暖紙／墨綠／serif資訊版面，沒有紫藍漸層、emoji圖示或卡片牆。進度環 transition 0.24s，reduce時0s；出現動畫與FLIP實作存在，未把存在當作每種重排均已實測。底層錯誤文案與不支援格式引導仍不足。讀屏、真手機尚未做。                                                                                                         |
| 2.9 建置／測試／部署   | ❌／⚠️ | check、22單元、Chromium／Firefox／WebKit各3既有E2E通過，獨立測試仍有失敗。引擎是headless，不宣稱原生Safari或實機。沒有remote、沒有部署、公網址與正式host header尚未驗；由使用者決定repo／網域／公開。                                                                                                                                                                                                                          |
| 2.10 文件              | ❌     | README、英文PRIVACY、CATALOG_GUIDE、Methodology、RESEARCH、DESIGN、DECISIONS（含不做OAuth）、TEST_REPORT、Known Limitations均存在（後兩者部分為同檔章節），LICENSE與套件授權已補。RESEARCH／DESIGN仍缺要求的具來源研究，DECISIONS舊大檔說法與新實測矛盾，方法與字串仍有不一致。CI存在，只有手動觸發，尚無遠端job實跑。                                                                                                         |

## 大型 Worker 的實際量測

| 合成情境                 | bytes／信件數          | Worker時間  | 進度次數 | Worker heap取樣峰值／樣本數 | Chromium全程序RSS取樣峰值 |
| ------------------------ | ---------------------- | ----------- | -------- | --------------------------- | ------------------------- |
| 300 MiB 重複短信         | 314,572,800／1,655,647 | 12,298.5 ms | 51       | 49,488,900 bytes／30        | 380,649,472 bytes         |
| 2 GiB 單巨大 binary 附件 | 2,147,483,648／1       | 2,693.7 ms  | 15       | 1,115,640 bytes／6          | 432,799,744 bytes         |
| 2 GiB 多封 binary 本文   | 2,147,483,648／32,768  | 3,220.1 ms  | 17       | 84,155,284 bytes／61        | 541,835,264 bytes         |
| 300 MiB stored ZIP       | 314,572,942／1,655,647 | 10,896.3 ms | 48       | 49,235,492 bytes／208       | 436,813,824 bytes         |

來源為 production file input／File.stream／Dedicated Worker，CDP採 heap，按獨立 Chromium PID集合採RSS。各情境產品外部請求均0。ZIP首筆progress為28.7ms，末次bytes正確。主執行緒持續心跳；300MiB最大空檔354.8ms，不宣稱零延遲。2GiB稀疏binary測資不是真實Takeout速度基準；RSS含瀏覽器／GPU等成本，取樣峰值不保證捕捉瞬間最高值。取消案沒有有效heap樣本，0不能解讀為不用記憶體。細節與全部raw JSON在parser報告。

分類分開報告：舊16封合成集 TP12／FP0／FN0／TN4；擴充23封為 TP12／FP2／FN5／TN4，precision **85.71%**、recall **70.59%**、accuracy **69.57%**。只代表刻意加入合法格式邊界的小型合成集，不推論真實信箱整體準確率。沒有任意5,000帳號截斷規格，也沒有宣稱測到OOM。

## 嚴重問題與可重現證據

- 解鎖途中清除：production實際暫停native decrypt完成回傳→點鎖定頁Delete→確認DB空→放行decrypt，vault及敏感合成內容回來。`browser/production-unlock-wipe.json`；Provider獨立亦重現於`domain/state-supplement-results.json`。
- 一般加密A／B逆序：較新B已寫入後釋放舊A，畫面B但vault變A且顯示saved。只控制native crypto的完成順序，不替換加密／IDB實作。
- 有效EML→壞ZIP：GitHub暫存列仍可點，但無Mine，reload後消失；quoted顯示名稱可偽造地址；MIME與ZIP大量小項目均有正式Worker重現。`parser/FINDINGS.md`。
- 正常UI連續新增同名同網域兩次→下載JSON→原樣匯入，實得“That file is not a valid workspace.”。`browser/duplicate-import-actual.json`。
- 1,655,647信件數（300MiB可達）JSON匯入歸0；寬字PDF實際65個字形越過612pt頁面，最右984.56pt。`domain/large-count-roundtrip.json`, `pdf-inspection.json`。

## 未實際執行與使用者專屬事項

七項指定測試未實際執行：Google Calendar真實ICS匯入與提醒、Apple Calendar、Outlook Calendar、VoiceOver／NVDA人工抽測、實體iOS Safari、實體Android Chrome、真正OS安裝PWA後冷啟動離線完整流程。沒有因headless／SW測試通過而把它們改成通過，也沒有宣稱環境必然不能完成；功能修正後須繼續驗證或明確交付待驗清單。

另外由使用者決定／親驗：在自己的電腦用真實信箱（不上傳）、抽查常用服務、指定GitHub repo／是否建立、決定網域與公開上線。這些不當成自動修正迴圈的卡關。尚未公開或部署。

## 下一步

將`docs/CURSOR_FIX_ROUND_2.md`交原Cursor聊天，優先修隱私交錯與資料遺失。完成後第3輪重新完整驗收，最多8輪。保留本輪所有原始證據與第一輪歷史，重跑請複製harness到新的目錄，不能覆寫舊結果。
