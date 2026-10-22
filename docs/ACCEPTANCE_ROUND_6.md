# 第 6 輪獨立驗收

> 2026-10-20 補記：使用者已核准保留不含個資的技術標記；已補原生 Safari 部分流程、官方受阻頁及上傳前安全掃描。最新結論見 [FINAL_ACCEPTANCE_STATUS.md](./FINAL_ACCEPTANCE_STATUS.md)，親驗／發布事項見 [USER_VERIFICATION_CHECKLIST.md](./USER_VERIFICATION_CHECKLIST.md)。下文保留 10 月 19 日驗收當時狀態，不把後來核准或補驗倒填成當時已完成。仍為 9 通過／0 新確證程式失敗／4 未完整驗收；沒有新增修正輪次。

2026-10-19（Asia/Taipei）。提交 `53253a5a76a63045d14f3bfa10b736bb5da67d12`，對應 `READY_FOR_ACCEPTANCE — FIX_ROUND_5`；確認乾淨工作區與停止變動後執行。**已知清除讀回漏洞修正通過，本輪沒有新的確證程式缺陷，不再交猜測性修正。**

這不等於全部公開交付條件完成：原「全部本機資料清除」與保留非個資marker的例外尚待使用者決定；真行事曆／讀屏／實機／安裝PWA等仍未實際執行，HTTP403連結仍未知。Codex只修改本輪驗收文件及ignored證據，未改正式功能／正式測試，未push／部署／建立remote。定時巡查維持暫停。

## 固定13項P0

| 項目                      | 判定 | 結果及必要界線                                                                                                                                                                        |
| ------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 本機解析                | ✅   | 核心Node43＋17＋11、23封分類集、指定格式／HTML／ZIP／地址／merge／離線production回歸通過。Parser及Worker hash與第5輪相同，大檔量測沿用已實測證據，沒有冒稱本輪再跑。                  |
| 2 三輸入／學校網域        | ✅   | 匯入、清單、手動／歸類、多網域與轉寄標頭、合法ASCII地址及PST備援流程回歸過。                                                                                                          |
| 3 服務目錄                | ⚠️   | 40筆／50網域／schema16／generator／來源日期及覆蓋通過；13檔hash未變，沿用同日第5輪11服務官方成對讀證。61 URL中13個HTTP403的即時有效性未知，不能說全綠或死鏈。                         |
| 4 任務／狀態／風險        | ✅   | 五類五狀態、notes／子步驟／ownership、決定性／調權重／五因素／recovery與日期優先序回歸過。                                                                                            |
| 5 逐項／備援指南          | ✅   | 官方host及新頁、範本複製、完成確認保存、替代任務、Slack及未知服務備援皆過，未重寫已核內容。                                                                                           |
| 6 學校遷移                | ✅   | drive／mail／contacts、官方來源／各校不同、政策與日期／保留日數實際改變任務與倒數。                                                                                                   |
| 7 儀表板／報告            | ✅   | 進度、完成清單、文字摘要、PDF5份渲染與字形檢查、完整JSON資料回歸過。                                                                                                                  |
| 8 倒數／Today／ICS        | ⚠️   | 日期三時區18案、假設、過期／空帳號、完成推進／逾期、ICS格式／escaping／alarms過；Google／Apple／Outlook真匯入及提醒未做。                                                             |
| 9 Already expired         | ✅   | IT／校友／客服、其他救援及可能無法取回資料的路線、來源提示與深色對比均可用。                                                                                                          |
| 10 保存／清除／備份／離線 | ⚠️   | 原114、同一fence真第三頁讀者及明示相容／guard3案全過；10001帳號／100001字notes正常。使用者內容／local/session/cache/SW清空，僅留已揭露非個資marker，原全清例外待決定；OS安裝PWA未驗。 |
| 11 示範／首次使用         | ✅   | 首屏用途／本機承諾、合成標示、示範／空白與三引擎基本保存操作通過。                                                                                                                    |
| 12 無障礙／響應式／錯誤   | ⚠️   | axe16路由、真Tab、390px／桌面、reduced-motion、對比與quota復原通過；人工讀屏與真手機未做，不能稱完整WCAG驗收完成。                                                                    |
| 13 隱私／Methodology      | ✅   | 已知清除後讀回不可再現，正常流程外連0／CSP實阻擋／純文字／敏感內容預設不保存過；隱私頁／方法與實測行為一致，marker已揭露，P0.10原全清例外不自行批准。                                 |

合計：**9通過／0個已證實程式失敗／4未完整驗收**。P0.10標⚠️明確包含原全清範圍待決，不表示那個條件已被豁免；若使用者不接受marker，仍須符合原要求才能通過。未決範圍與未執行測試不灌成新的程式bug，也不因此宣稱P0全過。

## 真正執行的驗證

證據在ignored `output/acceptance-round-6/`。各層重複驗證同一行為，不相加成產品需求或獨立缺陷數。

| 指令／層級                         | 結果                                                                                             | 證據                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `npm run check`                    | exit0；格式、lint零警告、型別、9檔38單元、production build                                       | `check.log`, `check-exit.json`                                                           |
| `env -u NO_COLOR npm run test:e2e` | Chromium3/3、exit0、無警告                                                                       | `baseline-e2e.log`                                                                       |
| Firefox／WebKit production E2E     | 各3/3、exit0；headless非原生Safari／手機                                                         | `firefox-e2e.log`, `webkit-e2e.log`                                                      |
| root正式網頁回歸                   | 31/31：audit10＋expanded11＋critical4＋edge5＋100001字note1                                      | `browser/results.json`, `expanded.json`, `critical.json`, `edge.json`, `edge-extra.json` |
| domain原固定回歸                   | 114/114：函式70、日期18、Provider3＋3＋10＋4＋1、PDF5                                            | `domain/FINDINGS.md`, `summary.json`                                                     |
| 原fence第三頁讀者補驗              | 1/1，未灌入114原分母；第三頁拒絕舊世代資料，收尾後無舊vault／記憶體secret                        | `domain/state-fence-window-results.json`                                                 |
| 明示相容／guard檢查                | 3/3，另外報數：舊plain及vault可讀、不同epoch直接unlock API拒絕                                   | `domain/state-compat-results.json`                                                       |
| parser功能                         | 指定核心與production UI／離線／merge／HTML／ZIP皆過；既有相容觀察維持原級，未新增fuzz            | `parser/FINDINGS.md`及suite原始JSON/log                                                  |
| catalog                            | 40／50、schema16/16、generator／URL覆蓋、catalog unit2/2過；links61＝48HTTP200／13HTTP403、exit1 | `catalog/AUDIT.md`, `independent-link-audit.json`                                        |

正式E2E只有先前確認按鈕文字的selector更新，沒有刪除驗證。root沿用第5輪harness，僅改本輪輸出路徑；domain重編目前來源bundle，原oracle未放寬。Parser／目錄未變的來源閱讀與效能明確引用先前證據，不稱重測。

## 最後漏洞的驗證細節

相同fence流程仍讓B過時vault先真正native commit，證據中間值保留，並沒有把它隱藏或假造為從未寫入。第三頁C現在boot空白、locked=false、沒有舊secret，原讀者測例因此**未呼叫**unlock，`returned=false`不能寫成那個測例曾實際呼叫API。另以真正不同epoch的vault直接呼叫unlock作明示guard驗證，確實返回false；去除metadata的舊plain／vault正常相容各一案。

放行通知／postcheck後，C記憶體仍空、vault無舊secret。新工作區C、雙unlock／replace／模式切換、quota原因／成功重試、備份與PDF均未退步。方法仍是正式React Provider／native IDB／WebCrypto的file瀏覽器harness，僅stub SW列舉；不是本輪新增production UI等價重演，也不是證明每一種可能時序皆安全。

## 2.1–2.10全面對照

| 範圍            | 判定與界線                                                                                                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1隱私         | ✅／⚠️ 掃描→確認→notes／步驟→完成→倒數→ICS／報告／JSON往返外部請求0；CSP實阻擋、HTML不執行、不載遠端圖片、無完整本文／預設敏感主旨保存；已知讀回漏洞補驗過。全DB枚舉僅留無sentinel技術marker，原全清例外待使用者決定。 |
| 2.2真實性       | ✅／⚠️ 40筆來源日期／結構／唯一網域與既有官方步驟證據成立；Coursera誠實Unverified、Evernote官方正文已核，未新增指南錯誤。13個403仍未知；不刪來源或改腳本湊exit0。                                                      |
| 2.3解析         | ✅ 指定Node／Worker功能、六類／PSL／信心、證據／日期／count／ownership、檔案安全與錯誤回歸通過，都是合成測資。大型Worker未變hash，引用第5輪真量測。                                                                    |
| 2.4輸入任務風險 | ✅ 三輸入、手動歸類、五類五狀態、筆記勾選保存、確定性與可調風險、recovery均實跑。                                                                                                                                      |
| 2.5指南學校     | ✅ 每服務／未知備援、官方host、新分頁、英文範本複製、確認清單、學校三類任務及政策日期影響過。                                                                                                                          |
| 2.6倒數提醒     | ⚠️ Today／時間表／假設／過期／空帳號、完成推進／逾期、ICS語法與alarm過；notification constructor實際呼叫且關頁限制有說明，非OS投遞／真日曆驗證。                                                                       |
| 2.7儀表匯出離線 | ✅／⚠️ 進度／完成清單、文字／PDF5、JSON與SW控制離線掃描保存重載均過；安裝OS PWA後完整冷離線未做。                                                                                                                      |
| 2.8介面無障礙   | ⚠️ axe16路由／390px／真Tab／reduced-motion／深色連結對比12.124過，無新增顯示缺陷；讀屏與真手機未做，不能稱全站AA實測通過。                                                                                             |
| 2.9建置測試部署 | ✅／⚠️ 本輪執行的build／lint／型別／38單元、三引擎E2E與既有核心回歸皆過，未發現新確證程式問題；公開host／遠端CI／部署與原生環境未驗，未獲repo／公開部署決定。                                                          |
| 2.10文件        | ✅／⚠️ 必備文件、英文UI／README／PRIVACY、no-OAuth／方法／限制一致；研究已有實讀來源與觀察，不重開已解決內容。marker例外與未實測誠實保留，未聲稱全部完成。                                                             |

## 沿用而未重跑的大檔證據

`parser`來源及 `dist/assets/worker-vDyEKmF2.js` 與第5輪逐位元相同，核對表見 `parser/FINDINGS.md`／hash證據。下列為**第5輪量測**，不是第6輪新測：300MiB MBOX 9,693.0ms／42次進度；2GiB單附件828.2ms／6次；2GiB多封1,417.4ms／8次；300MiB ZIP10,132.8ms／43次，四情境產品外連0，取消亦已實測。heap／backing／RSS、心跳與原始CDP資料仍在 `output/acceptance-round-5/parser/`。

2GiB為稀疏合成資料、單附件僅2個heap樣本，峰值是取樣值，非全記憶體或瞬時最大；不宣稱真Takeout吞吐或任意資料固定記憶體。Node大型config本輪也未重跑，最後實跑為第5輪。避免為未變程式重複耗費測試與token。

## 尚待驗證與決策清單

| 項目                 | 實作／驗證界線與下一步                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 非個資marker例外     | 正式UI wipe後只剩`after-school-control/kv/epoch`隨機字串，無姓名／信件／筆記sentinel；local/session/cache/SW空。已說明目的及保留範圍。使用者尚未明確接受原全清例外，已提出一次決策，未自行放寬。 |
| Google Calendar      | 用本輪合成 `browser/migration.ics` 實際匯入，核對任務／日期／文字／提醒設定並觀察一次提醒；未執行。                                                                                              |
| Apple Calendar       | 同上，真匯入及提醒；未執行。                                                                                                                                                                     |
| Outlook Calendar     | 同上，真匯入及提醒；未執行。                                                                                                                                                                     |
| VoiceOver／NVDA      | 鍵盤從開始→匯入→帳號確認→任務→匯出，實際聽讀標籤／焦點／進度／錯誤；未執行。                                                                                                                     |
| 實體iOS Safari       | 真機用合成郵件驗三輸入、任務保存／匯出／小螢幕；未執行，不用viewport代替。                                                                                                                       |
| 實體Android Chrome   | 同上；未執行。                                                                                                                                                                                   |
| OS安裝PWA冷離線      | 真正安裝後關閉、斷網冷開，合成匯入→確認→任務→完成→匯出；未執行，SW browser reload不替代。                                                                                                        |
| 原生macOS Safari     | 未執行，headless WebKit不替代。                                                                                                                                                                  |
| HTTP403連結          | 13個仍未知，清單在catalog原始稽核；維持既有官方閱讀證據與Unverified，不能宣稱這些URL此次即時可讀。                                                                                               |
| 使用者親驗／發布決策 | 真實信箱僅自己電腦測、不上傳；抽核常用服務；決定GitHub repo／是否建立、網域與是否公開。未授權前不建立remote、推送或部署。                                                                        |

本輪不產生 `CURSOR_FIX_ROUND_6.md`，因沒有新確證程式缺陷；不為湊輪次要求Cursor修改。也不把未決／未實測項目宣告完成。若使用者明確要求全DB清除而不接受marker，再針對這個已知規格差異集中處理；其餘只做實際缺少的驗證，最多8輪的上限仍保留。
