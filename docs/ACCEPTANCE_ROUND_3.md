# 第 3 輪獨立驗收

2026-10-19（Asia/Taipei），提交 `9cab6391a961c55074dcda11a2dfa7d108cfaf3c`，對應 `READY_FOR_ACCEPTANCE — FIX_ROUND_2`。已確認新 READY、乾淨工作區與停止變動才開始，沒有重驗舊提交。

**仍未通過。** 上輪已執行的自動回歸案例皆通過；部分來源、指南及研究文件缺口仍延續，但擴充測試重現跨分頁清除後資料復活、重複解鎖覆蓋新編輯、可達工作區無法還原、PDF其他寬字元裁切與合法郵件格式漏判。正式功能／測試碼未由Codex改動；只新增ignored驗收證據及本報告／修正prompt／TEST_REPORT。未建立remote、推送、部署或公開。

## 原始固定13項P0

| P0                          | 判定 | 本輪實測結果與缺口                                                                                                                                                                     |
| --------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 本機解析引擎              | ❌   | 上輪25＋16＋2回歸、23封分類集、大檔Worker／ZIP2000／取消／進度皆過；新RFC2047顯示名稱、quoted local-part、內層folded MIME、QP硬換行共6個核心格式案例失敗。                             |
| 2 三種輸入及學校網域        | ❌   | 匯入／目錄／手動、重複手動ID及手動歸類都已過；encoded顯示名稱仍誤造學校／寄件證據，PST指引未真正通往支援格式。                                                                         |
| 3 服務目錄                  | ❌   | 40筆／50唯一網域／來源日期／generator、schema16案均過；本輪11服務成對官方email/export重查。OneDrive來源少量缺漏、Slack匯出角色及可操作步驟待補；12網址403、Coursera/Evernote正文未驗。 |
| 4 任務、狀態、風險          | ✅   | 五類五狀態、notes/勾選、ownership往返、權重／決定性／五因素／recovery與日期優先序通過；前輪四筆教育誤加50分已修。此項不把保存交錯缺陷重述成模型失敗。                                  |
| 5 逐項及通用指南            | ❌   | 來源／理由／備援／客服範本與新增完成確認可操作，三個確認勾選reload仍保留；Slack逐項export仍只有概述、漏Admin及執行入口。                                                               |
| 6 學校資料遷移              | ❌   | 三類任務、日期／政策輸入、官方連結、Gmail轉寄／Contacts與範本都已過；Drive磁碟複製句子未列真正引用來源，PST說明仍不夠可操作。                                                          |
| 7 儀表板／報告              | ❌   | 完成清單、進度／文字報告／混合狀態／原文保留與W寬字回歸已過；@與%仍實際超出PDF頁面。                                                                                                   |
| 8 倒數／Today／時間表／ICS  | ⚠️   | 台灣本機日期、假設標示、已過期／無帳號、逾期／完成推進、ICS格式／escaping／alarm／未知日期VTODO皆過；Google/Apple/Outlook實際匯入與提醒未執行，不能整項標通過。                        |
| 9 Already expired           | ✅   | 期限過後實際出現IT／校友／客服及其他救援信箱電話備援碼路線；政策LegalHold／OneDrive例外、各校不同、來源日期已補。深色連結可讀性另在P0.12判失敗，未宣稱全頁AA。                         |
| 10 保存／清除／備份／離線   | ❌   | 上輪單Provider競態、一般保存、正常JSON／SW離線全過；跨頁舊加密能在清除後寫回，兩次unlock能以舊蓋新，5001帳號與4001字notes備份不能原樣還原。OS安裝PWA後離線未做。                       |
| 11 示範／首次使用           | ✅   | 首屏用途／本機隱私、合成標示，demo確認、完成、保存與匯出全流程可走。                                                                                                                   |
| 12 無障礙／響應式／錯誤狀態 | ❌   | 前輪16路由變體／390px／真Tab／reduced-motion回歸過；深色Expired官方連結前景=背景、16px字對比1:1，實看消失。quota恢復後仍留失敗訊息；讀屏／真手機未做。                                 |
| 13 隱私／Methodology        | ❌   | 成功掃描遷移倒數流程、惡意HTML、Worker產品外部請求0，CSP實阻擋、方法已一致；但跨分頁wipe仍違反清除承諾。                                                                               |

固定分母合計：**3通過／9失敗／1未完整實測**。另列7類指定未執行測試，不與P0主項相加。任一必要子項失敗主項即失敗；只剩必要實測未完成者列⚠️。

## 實際命令與分層證據

證據：`output/acceptance-round-3/`。每層會重測同一缺陷，不合併成缺陷總數或完成率。

| 實際執行                           | 結果                                                                        | 證據                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `npm run check`                    | exit0，格式／零lint警告／型別／7檔29單元／production build                  | `check.log`                                                            |
| `env -u NO_COLOR npm run test:e2e` | Chromium原3案全過，無環境顏色衝突警告                                       | `baseline-e2e.log`                                                     |
| Firefox／WebKit原production E2E    | 各3／3，清除NO_COLOR衝突變數；headless非實機Safari                          | `firefox-e2e.log/.json`, `webkit-e2e.log/.json`                        |
| large config Node直接parser        | 1／1，300MiB，7,381ms，heap取樣峰值89,636,568 bytes、RSS251,396,096 bytes   | `large-node.log/.json`                                                 |
| root舊production回歸               | 25／25通過                                                                  | `browser/results.json`, `expanded.json`, `critical.json`               |
| root新增production情境             | 5個不同案例：1過／4失敗，合併舊案為30案26過／4失敗                          | `browser/edge.json`及`edge-followup-*.json`；同一cross-tab補強不重複算 |
| domain Vitest                      | 68案67過／1失敗；原65全過                                                   | `domain/results.json`                                                  |
| 日期3時區×6                        | 18／18                                                                      | `domain/date-boundaries-results.json`                                  |
| 真Provider／IDB／native WebCrypto  | 原3＋上輪3全過；新10案7過／3失敗                                            | `domain/state-*-results.json`                                          |
| PDF實際字形與渲染                  | 原3案全過；新增@/%兩案全失敗，同一字寬缺陷                                  | `domain/pdf-extra-inspection.json`及PDF/PNG                            |
| domain分層合計                     | 107案101過／6失敗，對應4個獨立缺陷                                          | `domain/FINDINGS.md`, `domain/summary.json`                            |
| parser舊回歸                       | 25＋16＋2＝43案全過；舊23封集TP17/FP0/FN0/TN6                               | `parser/*probe-results.json`, `labeled-accuracy-extended-results.json` |
| parser新核心格式／安全             | 17案11過／6失敗；另3觀察不阻擋                                              | `parser/validate-new-boundaries-results.json`, `FINDINGS.md`           |
| parser正式格式UI                   | 舊12／12過；新6個核心負例正式Worker重現                                     | `parser/browser-new-boundaries-results.json`, `validate-format.mjs`    |
| schema／目錄／links                | schema16／16；40筆50網域／generator一致；59URL：47×200、12×403，links exit1 | `catalog/AUDIT.md`, `schema-probe.json`, `independent-link-audit.json` |

root新情境中的「初始viewport axe零violations」僅是工具執行結果，**不是AA通過**；scroll到連結後仍有color-contrast incomplete，實際計算及截圖證明1:1，故另案失敗。沒有把incomplete當pass來掩蓋。@/%兩個PDF案例、plain/encrypted兩個quota案例是同類問題的多層證據。

## 2.1–2.10全面驗收

| 範圍            | 判定   | 操作、發現與界線                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1隱私         | ❌     | 掃描惡意HTML→確認→notes/steps→完成→倒數→ICS/文字報告/JSON往返及所有大型Worker，產品外部請求0。IDB無完整本文／預設主旨sentinel；一般wipe清空local/session/cache/SW/本DB，CSP connect-src探針實阻擋且header frame-ancestors生效。依賴及程式未見追蹤／廣告／第三方執行腳本。另同一browser context兩頁：A清空DB後，B先前加密完成寫回vault，重開以合成密碼解鎖讀回原policy。無資料外送，但清除承諾未過。 |
| 2.2真實性       | ❌／⚠️ | 全40欄位來源日期與50網域已驗，11服務官方email/export本輪重開；Amazon export正文新增成功。Coursera/Evernote仍未取得正文，不說造假也不說已核。schema／教育語義已修。Drive/OneDrive來源及Slack步驟仍缺，403屬受阻。                                                                                                                                                                                    |
| 2.3解析         | ❌     | 最終HEAD新build的真正Worker 300MiB/2GiB/ZIP、取消、進度、炸彈／損毀／大量小項目／HTML全過；4組合法格式仍失敗。所有資料合成，未用真信箱。原檔不持久化，bounded樣本不等於可證明GC立即實體清零。                                                                                                                                                                                                       |
| 2.4輸入任務風險 | ❌／✅ | 三輸入／手動歸類／五類五狀態／notes/steps/ownership／風險黃金測資與調權重皆實跑。任務／風險通過，地址誤證據、PST路線及保存交錯另失敗。                                                                                                                                                                                                                                                              |
| 2.5指南與學校   | ❌     | 已知／未知指南、官方新分頁與host限制、客服／IT／通知聯絡人範本複製、完成確認3項reload保存皆過。學校Drive/mail/contacts/recovery有日期及來源，來源納link audit；仍有少量來源歸屬和Slack/PST操作缺口。畢業日＋保留日數實際改變倒數／任務日。                                                                                                                                                          |
| 2.6倒數與提醒   | ⚠️     | Today／假設／已過期與日期邊界、完成推進／逾期提權／ICS檔案皆實測。瀏覽器通知有實際constructor呼叫，頁面誠實說明關閉可能收不到；不是OS投遞測試。三套行事曆實際匯入未做。                                                                                                                                                                                                                             |
| 2.7儀表板與離線 | ❌／⚠️ | 進度環、完成清單、混合狀態文字摘要、一般JSON、SW控制離線demo流程全過；5001帳號及4001字筆記無法還原備份，@/%列印裁切。真正安裝OS PWA後離線未執行。                                                                                                                                                                                                                                                   |
| 2.8UI無障礙動態 | ❌／⚠️ | 16路由變體穩定後axe無violations、手機無溢出、真Tab焦點／reduced-motion通過；額外深色Expired link同色1:1，已scroll觀察截圖、不是只看CSS。暖紙／墨綠／serif版面及文案冷靜，無紫藍漸層／emoji卡片模板。FLIP存在但不冒稱每種重排都人工驗過。quota復原仍有矛盾error；讀屏／實機未執行。                                                                                                                  |
| 2.9建置測試部署 | ❌／⚠️ | check29單元、large1、三引擎各3 E2E皆過且clean env無警告；獨立回歸仍失敗。正式Worker針對最後ZIP8MiB變更重新build實測，未沿用Cursor變更前數據。沒有遠端CI／公開host／部署驗證，尚無remote，等待使用者repo/網域/公開決定。                                                                                                                                                                             |
| 2.10文件        | ❌     | README/英文PRIVACY/CATALOG_GUIDE/Methodology/RESEARCH/DESIGN/DECISIONS/TEST_REPORT/限制清單齊全；CI/授權/方法與舊Worker紀錄已對齊。RESEARCH仍缺原第5章三類比較/實際抱怨/格式/API支援研究，DESIGN仍缺第10章外部案例研究。PRIVACY清除說法仍與跨頁實測不符。                                                                                                                                           |

## 最終build Worker量測

| 情境              | bytes／封數            | 時間      | progress | Worker heap取樣峰值／樣本數 | 獨立Chromium全程序RSS峰值 |
| ----------------- | ---------------------- | --------- | -------- | --------------------------- | ------------------------- |
| 300MiB重複短信    | 314,572,800／1,655,647 | 6,671.3ms | 31       | 62,313,640 bytes／16        | 431,472,640 bytes         |
| 2GiB單binary附件  | 2,147,483,648／1       | 818.1ms   | 6        | 705,112 bytes／僅2次        | 396,427,264 bytes         |
| 2GiB多封binary    | 2,147,483,648／32,768  | 1,340.4ms | 8        | 94,930,060 bytes／26        | 585,072,640 bytes         |
| 300MiB stored ZIP | 314,572,942／1,655,647 | 8,252.6ms | 41       | 17,851,784 bytes／159       | 422,313,984 bytes         |

每次為production file input→Dedicated Worker／File.stream，CDP採heap，按獨立Chromium PID集合採RSS；source/dist hash在`parser/final-build-*.json`，含最終ZIP改動。ZIP首progress34.4ms、末bytes等於輸入。主執行緒最大心跳間隔300MiB為71.1ms、2GiB多封56.5ms、ZIP67.2ms。取消750ms後無Cancel scan，heap0只是未取樣。2GiB為稀疏binary測資，不代表真Takeout吞吐；RSS含瀏覽器/GPU，取樣峰值不保證瞬間最高值，尤其單封僅2樣本不能證明heap峰值。

舊23封合成分類集本輪100%僅代表該小型集。新增6個合法格式失敗分開列，不宣稱真信箱100%。IDN/SMTPUTF8兩筆支援限制及只改ZIP旗標的過強oracle已降為3觀察項，未當阻擋；沒有任意5000帳號截斷規格，也沒有捏造OOM。

## 重要重現及限制

- 跨分頁清除：`browser/cross-tab-summary.json`顯示清除後keys=[]，放行另一頁加密後keys=[vault]，重新解鎖讀回`SYNTHETIC_CROSS_TAB_SECRET`。只控制native crypto完成順序。
- 雙unlock：`browser/double-unlock.json`為before=B、after=A、reload=A；Provider另獨立重現。
- 932,967 bytes合成mbox真正Node串流產5001帳號／5005任務，JSON2,970,060 bytes仍被parseWorkspace拒絕；不是要求砍到5000。`domain/scanner-backup-roundtrip.json`。
- UI輸入4001字note已存IDB，自己的下載備份原樣匯入失敗。`browser/long-note-import.json`。
- PDF @有67字形出612pt頁、最右887.375pt；%有45字形、最右783.425pt；已實際渲染。`domain/pdf-extra-inspection.json`。
- 深色link16px、前景/背景皆rgb(215,228,138)，對比1:1；axe為0violations/1個contrast incomplete。`browser/expired-link-ratio.json`及`expired-link-visible.png`。

七類未實際執行：Google／Apple／Outlook真ICS匯入及提醒（三類）、VoiceOver/NVDA人工、實體iOS Safari、實體Android Chrome、OS安裝PWA後冷啟動離線。原生macOS Safari亦未實測，不以WebKit替代。尚未執行不等於環境必然不能完成，後續續驗或交清楚待驗清單。

使用者親驗／決策另列：自己的信箱只在自己電腦測、不上傳；抽常用服務；決定GitHub repo／是否建立、網域與是否公開。這些不當作迴圈卡關。下一步交`CURSOR_FIX_ROUND_3.md`，完成後第4輪完整驗收，最多8輪；歷史證據不可覆寫。
