# 第 4 輪獨立驗收

2026-10-19（Asia/Taipei），驗收提交 `be7d5dd840a9761a95bfa2a8918a3a89168bda17`，對應 `READY_FOR_ACCEPTANCE — FIX_ROUND_3`。確認新 READY、乾淨工作區及停止開發後才開始。本輪稍早已完成實測，整理曾受執行額度中斷；使用者要求繼續後收取既有結果、核對證據與定稿，沒有重驗舊 READY 或把重跑灌成新案例。

**仍未通過。** 第三輪既有自動回歸全過；新 native IDB／WebCrypto／通知交錯卻再次重現清除後舊 vault 可解鎖讀回，另會誤刪清除後新資料。正式 UI 可保存的長筆記仍不能還原自己的備份，正常大帳號掃描也超過備份匯入預算；合法地址與學校證據合併仍有問題。Codex 只寫 ignored 驗收 harness／證據與驗收文件，未代寫正式功能或正式測試，未 push／部署／公開。

## 原始固定 13 項 P0

| P0                          | 判定 | 本輪實測結果與界線                                                                                                                                                                                 |
| --------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 本機解析引擎              | ❌   | 舊 43＋前輪核心 17、MIME、ZIP2000、取消、真正大檔 Worker 皆過；新 escaped comment、合法 atom angle addr-spec 共 5 例失敗；第 9 封學校證據合併後信心及依據錯誤。                                    |
| 2 三種輸入及學校網域        | ❌   | 匯入／目錄／手動與歸類、多學校／轉寄舊案、PST 替代路線都可操作；新合法學校地址漏判及 comment 假地址造 school-match，後匯入的真 school-match 被丟。                                                 |
| 3 服務目錄                  | ⚠️   | 40 筆／50 唯一網域／來源日期／generator／schema16 全過，本輪 11 服務成對官方 email/export 抽讀完成；Coursera／Evernote 仍未實際取得正文，完整「全數查證」不能標通過。403 不是錯誤或造假證據。      |
| 4 任務、狀態、風險          | ✅   | 五類五狀態、備註／勾選、ownership 往返、確定性／調權重／五風險、救援檢查與日期優先序回歸通過。保存交錯缺陷歸 P0.10，不重述為模型錯誤。                                                             |
| 5 逐項及通用指南            | ✅   | 官方來源、host 檢查與新分頁、客服及備援範本、完成確認 3 項保存／重載、替代任務可用；Slack Admin 角色及真正 export 路徑已補，官方正文核對一致。                                                     |
| 6 學校資料遷移              | ✅   | drive／mail／contacts／recovery、日期／保留日數／政策及來源可操作，實際改變倒數／任務日期。Drive 磁碟出處、OneDrive alias、Gmail／Contacts、PST 可讀格式與版本限制已補。                           |
| 7 儀表板／報告              | ✅   | 進度環、完成清單、混合狀態文字報告及 PDF 皆實際匯出檢查；5 個 PDF 場景通過，W／@／% 不再超頁；文字與 Unicode 降級保留。                                                                            |
| 8 倒數／Today／時間表／ICS  | ⚠️   | 台灣本機日與三時區邊界、未知假設、過期／空帳號、完成推進／逾期、ICS 語法／escaping／alarm／未知日期 VTODO 皆過；Google／Apple／Outlook 真匯入與提醒未實際執行。                                    |
| 9 Already expired           | ✅   | IT／校友／客服／其他救援信箱電話與備援碼路線、可能失去資料及各校不同提示可用；深色官方連結實測 12.12:1，前輪不可見已修。                                                                           |
| 10 保存／清除／備份／離線   | ❌   | 舊雙 unlock、單頁及舊跨頁 crypto 競態回歸已過；更細 epoch／通知交錯仍復活舊 vault，過時 cleanup 刪新資料；10,001 帳號／100,001 字 notes 自己備份被拒。瀏覽器 SW 離線完整掃描過，OS 安裝 PWA 未驗。 |
| 11 示範／首次使用           | ✅   | 首屏用途與本機承諾清楚、合成標示，示範確認／完成／保存／匯出與空工作區路線可走；三引擎保存回歸過。                                                                                                 |
| 12 無障礙／響應式／錯誤狀態 | ❌   | 16 路由變體 axe／390px／真 Tab／reduced-motion 舊回歸及深色連結補測皆過；control DB quota 失敗誤稱另一分頁，phase=saved／畫面空卻 DB 未清；重試成功仍留錯誤。讀屏／真手機未驗。                    |
| 13 隱私／Methodology        | ❌   | 正常掃描→遷移→倒數產品外部請求 0、CSP 實阻擋、純文字與敏感內容預設保存皆過；更細跨頁 wipe 仍能讀回舊合成資料。另 control DB 隨機 marker 未說明，不能稱全儲存空。方法規則內容已一致。               |

固定分母合計：**6 通過／5 失敗／2 未完整實測**。必要子項有失敗即整項失敗；只剩內容或外部實測未完成標 ⚠️。另列 7 類外部／實機測試，不加進 P0 分母，也不把同一缺陷多層重現當多個 P0。

## 命令、結果與原始證據

所有本輪證據在 ignored `output/acceptance-round-4/`，前輪未覆寫。以下層級會重測同一行為，**不相加為全產品案例數或缺陷數**。

| 實際執行                                         | 結果                                                                                                                  | 證據（皆相對本輪目錄）                                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run check`                                  | exit0，格式／lint 零警告／型別／8 檔 34 單元／production build                                                        | `check.log`                                                                                                  |
| `env -u NO_COLOR npm run test:e2e`               | 初次 exit1：4173 由同專案舊 preview 佔用；確認 PID／路徑並停止後重跑 3/3 通過，無警告。環境失敗未當產品缺陷，也未隱藏 | `baseline-e2e.log`, `baseline-e2e-retry.log`                                                                 |
| Firefox／WebKit production 原 E2E                | 各 3/3，headless Firefox157／WebKit27.2；不是實機 Safari                                                              | `firefox-e2e.log`, `webkit-e2e.log`, `baseline.config.mjs`                                                   |
| `npx vitest run --config vitest.large.config.ts` | 1/1，Node 直接 parser：300MiB／1,655,401 封／13,099ms；heap 取樣峰 81,650,448、RSS 254,033,920 bytes                  | `large-node.log`, `large-node.json`；Cursor 舊數另存 `cursor-large-scan.json`                                |
| root production 回歸                             | 前輪 30/30；新增 UI 100,001 字 notes 匯入 1 失敗；合計 31 案 30 過／1 失敗                                            | `browser/results.json`, `expanded.json`, `critical.json`, `edge.json`, `edge-extra.json`                     |
| domain Vitest                                    | 70 案 68 過／2 失敗；原 68 全過，新兩個可達備份契約失敗                                                               | `domain/results.json`                                                                                        |
| 日期／Provider／PDF                              | 日期 18/18；舊 Provider 3＋3＋10 全過；PDF 5/5；新 epoch4＝1過3敗，fence1失敗                                         | `domain/*-results.json`, `pdf*-inspection.json`                                                              |
| domain 分層合計                                  | 114 案 108 過／6 失敗，對應 4 組缺陷；原107全部通過                                                                   | `domain/FINDINGS.md`, `summary.json`                                                                         |
| parser Node 舊回歸                               | 25＋16＋2＝43 全過；前輪20筆＝17核心全過＋3非阻擋觀察                                                                 | `parser/probe-results.json`, `expanded-probe-64k-results.json`, `validate-new-boundaries-results.json`       |
| parser 新 Node／UI                               | 新 Node12＝6控制過、5必要地址失敗、1 duplicate ZIP 相容性觀察；新地址 UI9＝4過5敗；另 evidence merge UI1 失敗         | `parser/fresh-probe-results.json`, `browser-fresh-probe-results.json`, `browser-evidence-merge-results.json` |
| parser 其他正式 UI                               | 舊格式12/12；前輪格式UI12筆＝10核心/控制正確＋2國際化觀察；ZIP200/500/1000/2000＋惡意HTML5/5；離線掃描1流程過         | `parser/FINDINGS.md` 與各 `browser-*-results.json`                                                           |
| 分類方法／結果                                   | 23 封小型合成語料 TP17／FP0／FN0／TN6，precision／recall 都100%，只限該 corpus；新格式失敗另列                        | `parser/labeled-accuracy-extended-results.json`                                                              |
| 目錄／schema／links                              | 40筆50網域／schema16／generator一致；61URL＝49 HTTP200＋12 HTTP403，維護指令 exit1；11服務成對讀正文                  | `catalog/AUDIT.md`, `schema-probe.json`, `independent-link-audit.json`                                       |

原有正式測試沒有由 Codex 刪除或弱化。離線掃描探針初版未等待 Saved 就 reload，保留該初始輸出並修正 oracle；真正等待 Saved 後 Mine 仍在，不當作產品資料遺失。fixture 數、郵件封數、層級重複與重跑次數不灌成案例數。

## 2.1–2.10 全面驗收

| 範圍                    | 判定   | 實際操作、結論及限制                                                                                                                                                                                                                                                                                                                                       |
| ----------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 隱私                | ❌     | production 掃描→確認→notes／子步驟→完成→倒數→ICS／文字／JSON，及大檔 Worker 全部產品外部請求0；惡意HTML不執行、不載遠端內容。CSP connect/script/form/object 探針實阻擋；IDB無完整信件本文、預設無敏感主旨sentinel；依賴及執行腳本未見分析廣告追蹤。另實際 Provider／IDB／crypto 更細交錯能在 wipe 後重開解鎖舊合成秘密，清除承諾失敗，沒有資料外送的證據。 |
| 2.2 資料真實性          | ⚠️     | 結構、來源日期、50唯一網域、schema負向、generator及完整URL覆蓋通過；11服務兩類官方步驟重讀，Slack／學校來源已補。Coursera loading與Evernote challenge未取得正文，不能判已核、死鏈或造假。每筆有來源不等於每句已獨立讀過。                                                                                                                                  |
| 2.3 解析                | ❌     | 最終 production Worker 300MiB、2GiB單／多封、300MiB ZIP、取消與進度皆實跑；ZIP炸彈、巢狀、損毀、HTML及2000有效小EML回歸過。新comment escape／ASCII atom angle漏判，跨批 school-match截斷仍錯；信心不宣稱確定。全為合成測資，GC／RSS採樣不能證明記憶體瞬間物理清零。                                                                                        |
| 2.4 輸入／任務／風險    | ❌／✅ | 三輸入／手動歸類／ownership、五類五狀態／notes／勾選／調權重／確定性／救援均操作；模型回歸通過。學校標頭新語法與合併錯，備份／保存交錯另失敗。                                                                                                                                                                                                             |
| 2.5 指南／學校          | ✅     | 已知與未知備援、官方host與新頁、英文客服／IT／通知聯絡人範本複製、完成確認保存皆過；Slack新版實際export步驟核對過。PST明分New/Web/Classic、EML與MSG/PDF、無EML時用清單，無假轉檔承諾。三類學校任務與日期／政策確實影響倒數。                                                                                                                               |
| 2.6 倒數／提醒／Expired | ⚠️     | 日期／假設／Today／時間表／逾期／完成推進／空帳號／畢業已過實跑；ICS解析、escaping、alarm及本機通知constructor2次皆過。頁面有關閉分頁可能收不到提示；不是OS投遞或三行事曆匯入驗證。                                                                                                                                                                        |
| 2.7 儀表板／匯出／離線  | ❌／⚠️ | 進度與完成清單、文字／PDF五場景皆過；正常JSON與SW控制離線重載→實際本機掃描→Mine→Saved→重載皆過。較大可達資料自己的備份仍拒收；舊作業能刪新資料。OS安裝PWA冷離線未做。                                                                                                                                                                                      |
| 2.8 介面／無障礙／動態  | ❌／⚠️ | light1440px／dark390px各8路由、無橫向溢出、真Tab焦點與reduced-motion／進度環回歸過；深色Expired官方連結捲入畫面後對比12.124、axe violations0且contrast incomplete0，舊1:1已修。暖紙墨綠／serif、無紫藍漸層或emoji卡片模板，符合DESIGN方向；不把所有重排動畫冒稱人工全驗。control DB錯誤原因／復原仍不友善；真讀屏與實機未做。                              |
| 2.9 建置／跨引擎／部署  | ❌／⚠️ | check／34單元／build、三引擎原E2E、Node大檔都過，獨立新案例失敗故整體未過。公開host、OS安裝與遠端CI未執行；沒有Git remote，使用者尚未決定repo／網域／是否公開，未建立或推送。                                                                                                                                                                              |
| 2.10 文件               | ❌     | 英文README／PRIVACY、CATALOG_GUIDE、Methodology、RESEARCH、DESIGN、DECISIONS/no-OAuth、TEST_REPORT、Known Limitations齊全。DESIGN四類研究、API／格式／官方匯出研究已補；RESEARCH仍缺探索工具比較與實際抱怨調查。控制marker未在隱私說明交代；wipe實測仍違反承諾。                                                                                           |

## 最終 build 真正 Worker 量測

這些是本輪獨立量測，並非 Node 或 Cursor 自測。最終 parser 為 `dist/assets/worker-GPUqc0Rj.js`；`parser/final-build-metadata.json`、`final-build-verification.json` 核對來源／build hash 未變。

| 情境              | bytes／封數            | created→done | progress | Worker heap峰／採樣數 | 獨立Chromium全程序RSS峰 | 主執行緒最大心跳間隔 |
| ----------------- | ---------------------- | ------------ | -------- | --------------------- | ----------------------- | -------------------- |
| 300MiB 重複短信   | 314,572,800／1,655,647 | 9,307.7ms    | 41       | 56,909,524 bytes／22  | 435,830,784 bytes       | 45.3ms               |
| 2GiB 單binary附件 | 2,147,483,648／1       | 1,274.2ms    | 8        | 885,220 bytes／3      | 439,975,936 bytes       | 55.9ms               |
| 2GiB 多封binary   | 2,147,483,648／32,768  | 1,428.9ms    | 9        | 75,249,692 bytes／27  | 528,449,536 bytes       | 44.9ms               |
| 300MiB stored ZIP | 314,572,942／1,655,647 | 11,245.7ms   | 51       | 17,574,984 bytes／215 | 353,140,736 bytes       | 62.7ms               |

四個完成情境產品外部請求均0。CDP監看 Dedicated Worker，RSS按獨立Chromium程序集合取樣；heap不是所有記憶體。2GiB單附件還有 backing storage取樣峰88,677,441 bytes，不能宣稱只耗0.9MB；僅3個heap樣本不足證明瞬時峰。2GiB為稀疏合成檔，binary跳讀速度不代表真Takeout吞吐，RSS含瀏覽器／GPU。所有峰值都是取樣峰而非保證瞬時最大值。

取消共用既有fixture另執行一次：1 Worker、讀65,536 bytes後1次進度再取消，750ms觀察後按鈕消失／status空白、外連0；heap0是0樣本，不能當記憶體為0。四輸入檔共五次執行，不稱五個不同fixture。

## 關鍵重現與修正邊界

1. **wipe復活**：`domain/state-fence-results.json`。實際React Provider／native IDB／WebCrypto，僅延後已完成的epoch讀取／commit回傳、遞送真BroadcastChannel通知；wipe後keys空，舊vault後存且未清，重開locked=true、unlock=true、讀回`SYNTHETIC_FENCE_OLD_SECRET`。屬來源Provider瀏覽器整合，不偽稱這個新fence情境已用production UI重演；原production常見情境仍通過。只stub file頁的SW列舉，未改DB／crypto結果或新增write入口yield。
2. **新資料誤刪**：`domain/state-epoch-results.json`。舊B寫完僅延後回傳→A清空→C存新policy→B舊cleanup整庫刪，C畫面仍saved、reload空。延後通知／無BroadcastChannel皆失敗；同檔的replace最新資料保護正向案例通過。
3. **備份契約**：10,001帳號／10,005任務來自真正1,867,969-byte串流，JSON5,945,066 bytes拒收；正式UI100,001字notes已存，自己的file input備份匯入顯示invalid。不是要求無限資源，也不能砍帳號或只抬magic number；需所有接受／存入／匯出／匯入入口一致且已有資料可無損備份。
4. **epoch quota錯誤**：control put失敗時DB仍含合成policy，畫面空／saved且錯稱另一分頁開啟；重試成功後舊error仍在。不要和已修好的普通save quota混淆。
5. **地址／合併**：escaped comment假school/GitHub地址被採；angle內合法apostrophe／equals local漏判。根據本輪實讀 [RFC5322 §3.2.1–3.2.3](https://www.rfc-editor.org/rfc/rfc5322.html)，它們屬既有ASCII語法，與IDN／SMTPUTF8未支援觀察不同。第9封真school receipt的Worker結果Medium，UI因先截八筆personal evidence再重算，永久Low/count9；須有界證據與聚合訊號分開，不能無界留信。
6. **全部儲存列舉**：`browser/storage-after-wipe-all-databases.json`為正式UI清除後所有DB／store枚舉，local/session/cache/SW皆空，仍有`after-school-control/kv/epoch`隨機字串、hasSentinel=false。這是技術marker觀察，不是個資殘留或外送；舊probe只查`after-school`，不能拿其db=[]稱全IndexedDB空。原全清要求與文案須一致，也不能刪guard讓復活重現。未經使用者同意不能自行接受隱私例外。

## 未實際執行與下一步

七類指定測試仍未實際執行：Google Calendar、Apple Calendar、Outlook各自的真ICS匯入及提醒（三類）；VoiceOver／NVDA人工讀屏；實體iOS Safari；實體Android Chrome；OS安裝PWA後冷啟動離線。原生macOS Safari亦未測。headless WebKit、viewport emulation與SW離線不能代替。沒有說環境必然無法執行，也沒有以「應該」充當通過。

Coursera／Evernote官方正文及Material細節為獨立閱讀未驗，403／JS殼不當死鏈或造假。研究抱怨未取得應保留實際查詢障礙，不編造完成；官方限制不能改稱常見抱怨。

只有使用者親做／決策另列：自己的信箱在自己電腦實測不外傳、常用服務抽核、GitHub repo及是否建立、部署網域與是否公開。這些不當作迴圈卡關。下一步將10組完整固定格式 `CURSOR_FIX_ROUND_4.md`交原Cursor聊天；完成FIX_ROUND_4的新READY並停止變動後進第5輪全面驗收，最多8輪。root交接前停止自己的4173 preview，原始證據全部保留。
