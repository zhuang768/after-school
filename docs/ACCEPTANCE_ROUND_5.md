# 第 5 輪獨立驗收

2026-10-19，Asia/Taipei。提交 `0b58167f9578d341d2b424c4bc79dd78946b84d5`，對應 `READY_FOR_ACCEPTANCE — FIX_ROUND_4`；新 READY、乾淨工作區及停止變動已確認。**仍未通過，只交 1 組有實際讀回證據的隱私缺陷。** 本輪不因猜測擴張修改範圍，已解決的地址、備份、PDF、quota、目錄與研究不重開。

Codex 只新增 ignored `output/acceptance-round-5/` 與本輪驗收文件，未改正式功能／正式測試、未覆寫歷史、未建立remote／push／部署。自動巡查維持暫停；這是使用者要求後實際執行的一輪驗收。

## 固定 13 項 P0

| 項目                      | 判定 | 實際結果／界線                                                                                                                                                 |
| ------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 本機解析                | ✅   | 舊43＋17核心、新ASCII地址與控制11、分類集、格式UI／ZIP2000／HTML／有界Worker大檔與取消均過；跨掃描school evidence／Medium與reload已修。                        |
| 2 三輸入／學校網域        | ✅   | 匯入、清單、手動／歸類、multiple domains／forwarded headers及上輪5合法地址負例正式Worker均過。PST備援可操作。                                                  |
| 3 服務目錄                | ⚠️   | 40筆／50唯一網域／來源日期、schema16、generator及11服務成對官方抽核通過；Coursera誠實Unverified、Evernote取得官方正文。61連結中13個403仍未知，不能標全部有效。 |
| 4 任務／狀態／風險        | ✅   | 五類五狀態、筆記／子步驟／ownership、權重與決定性、五因素、救援檢查及日期優先序回歸過。                                                                        |
| 5 逐項／備援指南          | ✅   | 官方host與新頁、客服／IT範本、完成確認保存、替代任務與Slack步驟均過；未發現新指南錯誤。                                                                        |
| 6 學校遷移                | ✅   | drive／mail／contacts、來源日期／政策輸入與保留日數確實影響倒數與任務；版本／格式／各校不同限制保留。                                                          |
| 7 儀表板／報告            | ✅   | 進度、完成清單、文字報告及5份PDF渲染／字形過；W／@／%與多頁無裁切，正常JSON資料完整。                                                                          |
| 8 倒數／Today／ICS        | ⚠️   | 三時區18邊界、假設、已過期／無帳號、逾期／完成推進、ICS語法／escaping／alarm過；三行事曆真匯入／提醒未執行。                                                   |
| 9 Already expired         | ✅   | IT／校友／客服、其他救援方式及可能失去資料的誠實路線可用；深色連結12.124:1。                                                                                   |
| 10 保存／清除／備份／離線 | ❌   | 原114終態回歸及production31案全過，10001帳號／100001字notes完整還原；同一fence補真第三頁，wipe後舊vault可解鎖並持續保存。SW離線過、OS安裝PWA未做。             |
| 11 示範／首次使用         | ✅   | 首屏用途與本機承諾、合成標示、示範／空白路線及三引擎保存操作過。                                                                                               |
| 12 無障礙／響應式／錯誤   | ⚠️   | 16路由變體axe、真Tab／390px／reduced-motion／深色對比均過；一般quota及wipe quota原因／重試已修。人工讀屏與真手機未做，不能稱完整WCAG驗收通過。                 |
| 13 隱私／Methodology      | ❌   | 正常流程及大型Worker外連0、CSP實阻擋、純文字與預設主旨剝除過；wipe後第三頁可讀回舊內容仍違反承諾。非個資marker已揭露、方法一致，未把marker當外洩。             |

固定分母：**8 通過／2 失敗／3 未完整實測**。P0.3資料／來源／抽核部分已過，仍保留HTTP403即時有效性未知；不把未知判死鏈。各層案例不是P0分母，也不重複加成缺陷總數。

## 實際命令與結果

證據皆相對 ignored `output/acceptance-round-5/`；逐命令退出碼與原始JSON/log均保存。

| 層級／命令                         | 本輪結果                                                                                  | 證據                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run check`                    | exit0，格式／零lint警告／型別、9檔38單元、production build                                | `check.log`, `check-exit.json`                                                           |
| `env -u NO_COLOR npm run test:e2e` | Chromium3/3，exit0、無警告                                                                | `baseline-e2e.log`                                                                       |
| Firefox／WebKit production E2E     | 各3/3，exit0；headless不是原生Safari或手機                                                | `firefox-e2e.log`, `webkit-e2e.log`                                                      |
| large config Node直接parser        | 1/1，300MiB／1,655,401封／14,081ms，heap峰89,276,392、RSS255,016,960 bytes；不是Worker    | `large-node.log/json`                                                                    |
| root production                    | 31/31：audit10＋expanded11＋critical4＋edge5＋長note1                                     | `browser/results.json`, `expanded.json`, `critical.json`, `edge.json`, `edge-extra.json` |
| domain既有回歸                     | 114/114：函式70、日期18、Provider3＋3＋10＋4＋1、PDF5                                     | `domain/summary.json`, `FINDINGS.md`                                                     |
| 同一fence讀者補驗                  | 1次真第三頁流程失敗，對應唯一阻擋缺陷；不灌成第115個原基準案                              | `domain/state-fence-window-results.json`, `.mjs`                                         |
| parser                             | 舊43／17核心、新地址與控制11皆過；舊UI12、前輪核心10、地址UI9、merge、ZIP/HTML5、離線均過 | `parser/FINDINGS.md`, `node-suite-results.json`, `browser-suite-results.json`            |
| 分類集                             | 23封合成資料TP17/FP0/FN0/TN6，precision/recall100%只限該集，非真信箱準確率                | `parser/labeled-accuracy-extended-results.json`                                          |
| catalog                            | schema16/16／generator／40筆50網域與來源覆蓋過；links61＝48HTTP200＋13HTTP403，exit1      | `catalog/AUDIT.md`, `independent-link-audit.json`                                        |

適配只有：root舊harness的exact確認按鈕改用產品已更新的文字，原動作／斷言不變，見`harness-adaptations.json`；parser evidence merge reload前等待公開Saved狀態，見`parser/HARNESS_NOTES.md`。不以錯selector或尚未存完就reload誤判產品失敗。原始114的終態oracle如實保留，讀者補驗不改寫舊結果。

## 唯一需交修的實證

原fence案例：A wipe完成、keys空；B舊寫入延後完成回傳；最後放行B後條件cleanup會刪舊vault，因此原終態測試通過。但它沒有檢查收尾前有新讀者的情境。

在**相同既有await交錯**，只加真第三頁：B過時vault已native commit後，C boot為locked=true；C原生unlock回true、讀回`SYNTHETIC_FENCE_OLD_SECRET`。再放行B通知／postcheck，C記憶體與實際vault仍是該舊內容、errors=[]。不是只見key，也不是僅瞬間解密觀察。新頁將舊內容重新存為新commit，`dropIfCommit`為保護新資料而保留它。位置：`state.tsx:113–117,122–123`的先讀後存、`:172–187,264–287`的boot/unlock缺資料所屬世代核對；`commit.ts:29–41`只以commitId清理。

環境是正式來源編譯的React Provider／native IndexedDB／WebCrypto與同context真第三頁，file harness僅stub SW列舉。只暫停已完成的原生讀取／commit結果在既有await回傳，沒有新增write入口yield、沒有偽造資料庫或加密結果。**沒有宣稱此新流程已用production UI重演、自然頻率或任意語料都會發生。** 它已足夠證明使用者資料可在清除後讀回；修正需同時保護新工作區C，不可又改回整庫刪除。完整步驟及固定格式要求在 `CURSOR_FIX_ROUND_5.md`，只交這一組。

## 2.1–2.10驗收對照

| 範圍          | 結論                                                                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1隱私       | ❌ 正常掃描→確認→notes/steps→完成→倒數→ICS/文字/JSON全流程外部請求0，CSP實阻擋、惡意HTML執行0；敏感本文／預設主旨未持久化，無追蹤第三方執行腳本。唯一第三頁讀回使wipe不通過。 |
| 2.2真實性     | ✅／⚠️ 結構、40來源日期、11服務官方成對步驟及學校政策過；Coursera誠實未知、Evernote正文有據。13個403仍未知，無證據不能稱死鏈或全部有效。                                      |
| 2.3解析       | ✅ 本輪指定所有核心、MIME／六類／PSL／信心／Mine、ZIP防護／純文字與大檔Worker通過；只有合成測資，不擴張原相容性觀察。                                                         |
| 2.4輸入任務   | ✅ 三輸入、五類五狀態／notes／子步驟／ownership、五因素／確定性／可調權重／recovery均實跑。                                                                                   |
| 2.5指南學校   | ✅ 已知／未知備援、官方host及新頁、範本複製、完成確認、學校三類資料與政策／日期效果均過；沒再要求重寫已核步驟。                                                               |
| 2.6倒數提醒   | ⚠️ 日期／Today／時間表／Expired／完成推進／逾期與ICS格式過；瀏覽器notification constructor實際呼叫但非OS投遞。真日曆未驗。                                                    |
| 2.7儀表匯出   | ❌／⚠️ PDF5、文字、JSON10001／100001與SW離線掃描→Mine→Saved→reload過；第三頁讀回仍破壞清除，OS安裝離線未驗。                                                                  |
| 2.8介面無障礙 | ⚠️ axe16路由、真Tab、390px／桌面、對比12.124且contrast incomplete0、reduced-motion過；實看首屏與深色圖，冷靜設計無倒退。讀屏／真手機未做，不稱整站AA。                        |
| 2.9建置測試   | ❌／⚠️ build／lint／型別／38單元與三引擎原E2E零警告；隱私補驗失敗故整體未過。遠端CI、公開host與部署未做且未授權。                                                             |
| 2.10文件      | ✅／⚠️ 必備文件／no-OAuth／限制／英文UI字串齊全；探索工具比較與真抱怨觀察已有來源，不再沿用缺研究結論。marker原全清規格差異已揭露待決策，未自行批准例外。                     |

## 最終build Worker量測

本輪真正production file input→Dedicated Worker→File.stream，bundle `worker-vDyEKmF2.js`，source/dist hash前後相同。下表數字是本輪實測，未沿用Cursor自測；同機另有測試並行，不是隔離效能基準，未為漂亮數字重跑。

| 情境         | bytes／封數            | Worker時間／progress | used heap峰／樣本 | backing峰   | 全Chromium RSS峰 | 最大心跳間隔 |
| ------------ | ---------------------- | -------------------- | ----------------- | ----------- | ---------------- | ------------ |
| 300MiB MBOX  | 314,572,800／1,655,647 | 9,693.0ms／42        | 49,220,584／24    | 27,729,616  | 409,812,992      | 52.8ms       |
| 2GiB單binary | 2,147,483,648／1       | 828.2ms／6           | 819,136／2        | 28,974,800  | 367,919,104      | 49.0ms       |
| 2GiB多封     | 2,147,483,648／32,768  | 1,417.4ms／8         | 174,314,548／27   | 133,701,328 | 606,846,976      | 70.3ms       |
| 300MiB ZIP   | 314,572,942／1,655,647 | 10,132.8ms／43       | 17,839,568／197   | 64,274,120  | 376,799,232      | 51.6ms       |

記憶體單位bytes，為CDP／獨立Chromium PID集合RSS的取樣峰，非瞬時最大值；各指標峰不可相加。單附件僅2個heap樣本，不能以819KB稱全部記憶體；RSS含瀏覽器/GPU。2GiB為稀疏合成binary，非真Takeout效能。四完成情境外連0、done末bytes等於檔案。取消首progress65,536bytes後實按，750ms觀察後按鈕消失／Worker終止／外連0；未取得Worker heap不是記憶體0。

## 保留的未決與未實測

- 正式UI wipe後全DB列舉只剩`after-school-control/kv/epoch`隨機字串，hasSentinel=false，local/session/cache/SW空。隱私頁／確認文案／PRIVACY／DECISIONS現已說明。它是非個資技術marker，不當外洩／新增程式bug；原全部DB清空要求的例外仍需使用者明確決定，不藉本輪交修反覆改文案或刪安全guard。
- Google Calendar、Apple Calendar、Outlook真ICS匯入／提醒（三類）、人工VoiceOver/NVDA、實體iOS、實體Android、OS安裝PWA冷離線共7類未實際執行；原生macOS Safari亦未做。headless／viewport／SW不替代。
- 既有IDN／SMTPUTF8／改ZIP加密旗標／不同內容同名ZIP屬支援觀察，不作本輪新必要缺陷。403、Material動態頁細節等閱讀界線不捏造為通過。
- 真實個人信箱僅使用者在自己的電腦測；常用服務抽核、GitHub repo／是否建立、網域與是否公開仍由使用者決定，不當修正迴圈卡關。未建立remote、推送或部署。

下一步只將上方1組固定格式修正送原Cursor聊天；新FIX_ROUND_5完成後才進第6輪完整驗收，總上限8輪。不再重驗同提交、零碎追加猜測問題或恢復定時巡查。
