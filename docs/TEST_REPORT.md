# 測試報告

> 2026-10-22 GitHub 原始碼公開交付：[zhuang768/after-school](https://github.com/zhuang768/after-school)。使用乾淨公開快照與 GitHub noreply 署名，舊本機歷史保留且不推送。這不包含網站部署，也不把剩餘驗收改成通過。下文過往「未授權／未推送／無 remote」為發布前歷史；目前發布方式見 [PUBLICATION.md](./PUBLICATION.md)。

## Codex 僅補剩餘項（2026-10-22）

功能仍為 `53253a5`，正式碼與正式測試未變，沒有新修正輪次；未重跑已通過的完整 build／lint／單元／E2E／大檔。固定 P0 更新為 **10 通過／0 新確證程式失敗／3 未完整驗收**。最新對照見 [FINAL_ACCEPTANCE_STATUS.md](./FINAL_ACCEPTANCE_STATUS.md)，可直接操作的步驟見 [USER_VERIFICATION_CHECKLIST.md](./USER_VERIFICATION_CHECKLIST.md)。

ORCID 同一官方文章一次取回 145 行正文，三段目錄步驟有據、確證錯誤 0；可能含工具快取，未量當日 HTTP 狀態，歷史 403 不覆寫。P0.3 唯一來源待項關閉。

原生 Safari 18.5 真選檔匯入合成 mbox，顯示 GitHub／High／2。另真安裝 Safari 網頁 App「After School QA 20261022」，完全退出程序、停止自己 preview、確認 curl exit 7／HTTP 000 後冷開，工作區仍可用。以手動輸入完成 Mine／8 子步驟／合成 notes／Done，下載 JSON 2348 bytes，實際核對；第二次退出冷開仍保留 20%／完成項與 notes。不是僅一般分頁重載。

界線：裝置網路未關閉，沒有原生全網路量測；安裝 App 的 mbox／ZIP 選擇器上傳鈕反灰，未排除工具／面板因素，尚未成功提交。沒有擅改功能或放寬讀檔／擴充功能權限來過關。P0.10 仍留完整斷網與郵件流程親驗；P0.8 真三種日曆／提醒及 P0.12 聽讀／手機仍未驗。全部證據在 ignored `output/remaining-2026-10-22/`，另有合成測試包、5 事件日期／提醒 manifest 和官方操作來源。文件檢查結果見該目錄 `document-checks.json`。未建 remote、push 或部署，巡查保持暫停。

## Codex 收尾補驗（2026-10-20）

功能版本仍為 `53253a5a76a63045d14f3bfa10b736bb5da67d12`。使用者已核准無個資 epoch 標記，決定記在 DECISIONS.md；未改功能或正式測試。沒有新確證程式缺陷，不再交猜測性修正。固定 P0 仍 9 通過／0 新確證程式失敗／4 未完整驗收，不能稱全部完成。最新對照見 [FINAL_ACCEPTANCE_STATUS.md](./FINAL_ACCEPTANCE_STATUS.md)，親驗與發布決策見 [USER_VERIFICATION_CHECKLIST.md](./USER_VERIFICATION_CHECKLIST.md)。

原生 Safari 18.5 真操作空白工作區→手動新增→Mine→任務→勾選／合成備註／In progress→重載保存通過。原生 Chrome 155 示範顯示倒數、Today 與六個合成服務。原生選檔器及 PWA 安裝的工具操作未完成，不當產品缺陷或通過；沒有擴大擴充功能檔案權限。Apple Calendar 只唯讀檢查目的帳號選項，未擅自匯入。三種真 ICS／提醒、讀屏、真手機、安裝 PWA 冷離線及 Safari 剩餘流程仍未完整驗證。證據：ignored `output/finalization/native/REPORT.md`、AX 及截圖。

原 13 個受阻官方頁補核：12 正文支持／0 確證錯誤／1 ORCID 當日正文未重新確認。11 頁使用 web 取回，可能含工具快取；Amazon 原址實測 301→官方 200。沒有重跑整個 61 URL audit、沒有改腳本湊 exit 0。ORCID 有歷史官方閱讀證據，本次驗證頁阻擋後停止，非確證死鏈／本人登入待辦。證據：`output/finalization/catalog/REPORT.md` 及 JSON。

既有 Gitleaks 8.30.1：7 個 commit／reflog 與全 239 blobs／2,220,092 bytes 掃描機密候選 0；84 個 tracked 及歷史沒有 env／依賴／build／output／郵件檔。身份 metadata 與兩處本機帳號路徑另列發布選擇，不能誇稱歷史無個資。工作樹 1 個候選在 ignored、未追蹤的 PayPal 官方頁快取，未測有效性、不擅自抹掉。20 個大型 ignored 檔、解壓與 OCR 未全面掃描；Git blobs 則全部另掃。證據：`output/finalization/security/REPORT.md` 及遮蔽 JSON。未外送資料、建 remote、push 或部署。

本次只補缺少的驗證及文件，沒有重跑未變的全套 build／lint／單元／E2E／大型 Worker；下列第 6／5 輪數字保留實際執行日期與取樣界線。本次文件格式及差異檢查另記在 `output/finalization/document-checks.json`。定時巡查維持暫停。

## Codex 第 6 輪獨立驗收（2026-10-19）

**已知清除讀回漏洞通過，本輪無新確證程式缺陷，不再交猜測性修正。** 提交 `53253a5a76a63045d14f3bfa10b736bb5da67d12`。固定P0：9通過／0個已證實程式失敗／4未完整驗收；未決項不等於已豁免或P0全過。詳 [ACCEPTANCE_ROUND_6.md](./ACCEPTANCE_ROUND_6.md)。本輪證據在ignored `output/acceptance-round-6/`，舊輪不覆寫，以下皆為歷史。正式功能／正式測試未由Codex修改，未push／部署，定時巡查維持暫停。

`npm run check` exit0：格式、lint零警告、型別、9檔38單元、production build。Chromium／Firefox／WebKit基本E2E各3/3，root正式網頁31/31。domain原固定114/114、原fence真第三頁補驗1/1、明示legacy plain/vault與直接unlock guard3/3，全過且分層不混加。第三頁boot拒絕舊資料、locked=false，原讀者補驗未呼叫unlock；另直接API檢查才確實呼叫並返回false，沒有混淆。舊secret未被重新認領／保存，newC／quota／雙unlock／replace／備份與PDF不退步。

Parser指定Node43＋17＋11、23封分類集與production格式／地址／merge／ZIP／HTML／離線回歸過，外連0。來源及Worker `worker-vDyEKmF2.js` 與第5輪hash相同，未重跑同一份300MiB／2GiB／ZIP大檔或Node大型config；第5輪真量測原樣保留，沒有冒稱本輪新測。

正常掃描→遷移→倒數→匯出外連0、CSP實阻擋、HTML不執行；axe16路由／真Tab／390px／reduced-motion／對比過。目錄40筆50網域、schema16、generator／來源覆蓋、unit2項過；13檔hash未變，沿用同日第5輪11服務官方讀證。links61＝48HTTP200／13HTTP403、exit1，403未知。

未完整驗收：原全DB清除與非個資marker例外待使用者決定；真Google／Apple／Outlook ICS及提醒、讀屏、實體iOS／Android、OS安裝PWA冷離線7類及原生Safari未做；13URL403即時有效性未知。marker不含個資、已如實揭露，不等同外洩；也未自行批准原需求例外。沒有新增程式缺陷，因此不建立新修正prompt、不繼續猜測改動。GitHub repo／網域／公開決定仍未授權。

## Cursor 第 5 輪修正驗證（2026-10-19）

這一節是這一輪自己重跑的結果。下面 Codex 第 5 輪仍是對 `0b58167` 的獨立驗收歷史。新證據在 ignored `output/cursor-verify-round-5/`。`output/acceptance-round-1/` 到 `output/acceptance-round-5/` 沒有改。

只改跨頁讀取。每次保存把當時的清除世代和 commit id 一起寫進同一筆 IndexedDB 記錄。boot 與 unlock 只接受沒有世代標記的舊資料，或標記等於目前世代的資料。過時 vault 不會被鎖上、解鎖或重新保存。條件刪除仍只刪自己的 commit id，沒有改回整庫刪除。

`npm run check` exit 0。格式、lint 零警告、型別、9 檔 38 個單元、build。主檔是 `dist/assets/index-zz5Qxywy.js`。Worker 仍是 `dist/assets/worker-vDyEKmF2.js`，和 Codex 第 5 輪量到的是同一份。剖析器沒有改，這輪沒有重跑 300MiB／2GiB／ZIP／取消。那份 Worker 數字留在下面 Codex 第 5 輪。

`env -u NO_COLOR npm run test:e2e` Chromium 3/3。Firefox 3/3。WebKit 3/3。都是 headless，不是原生 Safari 或手機。

複製後的 domain：Vitest 70/70，日期 18/18，Provider 3＋3＋10，epoch 4/4，原 fence 1/1，PDF 檢查隨 `DOMAIN:0` 通過。同一 fence 的第三頁：舊 vault 確實先寫入並可解密出 `SYNTHETIC_FENCE_OLD_SECRET`，第三頁 boot `locked=false`、沒有呼叫成功的 unlock、收尾後記憶體與 vault 都不再是該秘密。見 `domain/state-fence-window-results.json`。延後通知與沒有 BroadcastChannel 的新工作區 C、quota 重試、JSON replace 仍過。

root：audit 10、expanded 11、critical 4、edge 5、long note 1，共 31/31。parser node suite exit 0；`new-boundaries` 的 exit 1 仍是 Punycode、SMTPUTF8、ZIP 加密旗標三個觀察。production UI 的格式、ZIP／HTML、新邊界、地址、evidence merge、離線都是 exit 0。沒有重跑大型 Worker。

未實際執行：Google／Apple／Outlook 真 ICS、VoiceOver／NVDA、實體手機、作業系統安裝後的 PWA 離線、原生 Safari。HTTP 403 沒有重跑，仍不是通過。無個資 epoch marker 的文案這輪沒有再改。沒有 push、沒有部署。

## Codex 第 5 輪獨立驗收（2026-10-19）

**未通過，只交1組實證隱私缺陷。** 提交 `0b58167f9578d341d2b424c4bc79dd78946b84d5`；固定P0：8通過／2失敗／3未完整實測。完整13項與2.1–2.10見 [ACCEPTANCE_ROUND_5.md](./ACCEPTANCE_ROUND_5.md)，唯一交修見 [CURSOR_FIX_ROUND_5.md](./CURSOR_FIX_ROUND_5.md)。以下為歷史，不能替代本輪。證據在ignored `output/acceptance-round-5/`；正式功能／正式測試未由Codex修改，未push／部署，自動巡查維持暫停。

`npm run check` exit0：格式、零警告lint、型別、9檔38單元、production build。Chromium／Firefox／WebKit原E2E各3/3、exit0；root production31/31。Node直接parser大檔1/1：300MiB／1,655,401封／14,081ms／heap峰89,276,392／RSS255,016,960 bytes，不是Worker。domain原114/114全過，含10001帳號、100001字note、新C保留、quota/retry、日期與PDF。

同一fence流程補真第三頁一次失敗：A wipe完成且keys空→B過時vault真commit、既有postcheck暫待續行→C原生boot locked、unlock=true讀回合成秘密→放行B收尾後C記憶體與vault仍留秘密。不是只有技術key或瞬間中間值；不把它灌成第115個舊基準案，也不隱藏114個終態通過。證據`domain/state-fence-window-results.json`。這是正式Provider/native IDB/WebCrypto的瀏覽器整合，不宣稱新production UI重演或自然頻率。

parser舊43、17核心、新地址／控制11及指定UI、evidence merge、ZIP2000、HTML、SW離線全過；分類23封TP17/FP0/FN0/TN6只限合成集。最終build真Worker300MiB／2GiB單多／ZIP／取消重測，外連均0；時間9693.0／828.2／1417.4／10132.8ms，progress42／6／8／43。heap／backing／RSS／心跳與取樣界線見總報告，單封僅2heap樣本、2GiB為稀疏檔，不冒稱固定記憶體或真Takeout吞吐。

正常掃描→遷移→倒數→匯出外連0、CSP實阻擋、惡意HTML執行0；axe16路由／真Tab／390px／reduced-motion、PDF5及深色對比12.124通過。40筆50網域/schema16/generator/來源覆蓋、11服務成對官方抽核過；Coursera誠實Unverified、Evernote官方正文取得；61links48HTTP200／13HTTP403、exit1，未知不是死鏈。研究比較／抱怨觀察已補，不重開舊缺陷。

無個資epoch marker已揭露但與原全部DB清除要求仍有待決策差異，不當外洩bug。7類真ICS／讀屏／實機／OS安裝PWA及原生Safari仍未實測，不以headless替代。只集中交上述1組修正，不因猜測零碎改動；新FIX_ROUND_5完成後才進第6輪，最多8輪。

## Cursor 第 4 輪修正驗證（2026-10-19）

這一節是這一輪自己重跑的結果。下面 Codex 第 4 輪仍是對 `be7d5dd` 的獨立驗收歷史，沒有覆寫。新證據在 ignored `output/cursor-verify-round-4/`。`output/acceptance-round-1/` 到 `output/acceptance-round-4/` 沒有改。

`npm run check` exit 0。格式、lint 零警告、型別、9 檔 38 個單元、build。最終 Worker 是 `dist/assets/worker-vDyEKmF2.js`，主檔 `dist/assets/index-CZKLfM04.js`。這是剖析器改過之後的 build，不能沿用上一輪 `worker-GPUqc0Rj.js` 的 Worker 數字。

`env -u NO_COLOR npm run test:e2e` Chromium 3/3。接著 `--browser firefox` 3/3、`--browser webkit` 3/3。三個都是 headless 引擎，不是原生 Safari，也不是手機。

`npx vitest run --config vitest.large.config.ts` 1/1。Node 直接呼叫剖析器：300MiB、15,604ms、1,655,401 封、heap 峰值 87,460,520、RSS 峰值 256,606,208。這不是 Worker。

`npm run catalog:links`：61 個 URL、48 個 HTTP 200、13 個 HTTP 403、指令 exit 1。403 不是通過，也不是死鏈。這一輪多出的 403 包括 Evernote 與 Amazon；Evernote 步驟另以同日讀到的官方正文核對，403 本身仍不算通過。

複製的 domain Vitest 5 檔 70/70，含 10,001 帳號 JSON 6,155,087 bytes 還原 10,001，以及 100,001 字 notes（JSON 101,126）還原 100,001。日期 18/18。Provider 原 3、補充 3、advanced 10 都在 `DOMAIN_BROWSER:0`。epoch 4/4、fence 1/1。PDF `@`／`%` 字形都在紙內：`@` 233 字、maxX 549.246；`%` 238 字、maxX 548.729；頁面 612pt；outside 0。

跨頁：fence 在寫入當下看得到 `SYNTHETIC_FENCE_OLD_SECRET`，放行後 vault 消失，第三頁不是 locked、讀不到該秘密。epoch 延後通知與沒有 BroadcastChannel 兩案，reload 後仍是 `SYNTHETIC_FRESH_C`。quota 失敗時資料還在，錯誤是瀏覽器無法記錄 wipe，沒有說另一個分頁；重試後資料空、錯誤空。

地址：Node fresh 必要案例通過；唯一失敗是 duplicate-name ZIP 相容性觀察。production UI 9 個地址案例與 evidence merge 都過。合併後清單是 Medium、count 9；reload 後的詳細頁仍有 `school address`。Punycode、非 ASCII local-part、只改 ZIP 加密旗標仍是觀察，20 筆裡 17 過 3 未過。

最終 build 的真 Worker，產品外連 0。300MiB：314,572,800 bytes、1,655,647 封、8,184ms、39 次進度、22 個 heap 樣本、峰值 54,938,116、RSS 472,416,256、heartbeat 最大間隔 123.8ms。2GiB 單封稀疏檔：邏輯 2,147,483,648 bytes、配置 20,480、1 封、850ms、6 次進度、4 個樣本、heap 689,024、backing 48,635,600、RSS 380,747,776、間隔 49.6ms。取消：65,536 bytes、1 次進度後按鈕消失；4 個樣本裡 Worker heap 峰值是 0，代表沒有取到 Worker heap。2GiB 多封稀疏檔：邏輯 2,147,483,648、配置 562,053,120、32,768 封、1,362ms、8 次進度、heap 69,605,532、RSS 506,920,960、間隔 92.5ms。300MiB ZIP：314,572,942 bytes、1,655,647 封、10,054ms、42 次進度、heap 17,826,940、RSS 358,629,376、間隔 57.2ms。200/500/1000/2000 小 ZIP 與惡意 HTML 在 `EXTRA:0`，HTML 沒有執行、沒有對外請求。離線掃描 `OFFLINE:0`，這是 Service Worker 控制下的重載，不是作業系統已安裝的 PWA。

深色 Expired 連結在 390px 捲入畫面後，實測 `rgb(23, 33, 23)` 在 `rgb(215, 228, 138)` 上，16px、字重 400，對比 12.124。axe 該組 violations 為空。鍵盤焦點、reduced-motion、桌面與 390px 在 expanded／audit／edge 為 PASS。正式 wipe 後枚舉全部 IndexedDB，只剩 `after-school-control`／`kv`／`epoch` 的隨機字串，沒有合成個資；localStorage、sessionStorage、Cache、service worker 為空。這筆標記與「清掉每一個資料庫」仍不一致，列在已知限制，沒有當成全清通過。

沒有新增依賴。評估過 `email-addresses` 5.0.0（MIT，未打包約 130KB）與 `postal-mime` 4.0.11（MIT-0，未打包約 1.1MB）。Context7 沒有對到可直接採用的 RFC 5322 JavaScript parser。地址改由本機 ASCII tokenizer 處理 comment quoted-pair 與完整 atext，執行期沒有新的網路。

未實際執行：Google／Apple／Outlook 真 ICS 匯入與提醒、VoiceOver／NVDA、實體 iOS／Android、作業系統安裝後的 PWA 冷開離線、原生 macOS Safari。沒有建立 remote、沒有 push、沒有部署。

## Codex 第 4 輪獨立驗收（2026-10-19）

**未通過。** 驗收提交 `be7d5dd840a9761a95bfa2a8918a3a89168bda17`。固定 13 項 P0：**6 通過／5 失敗／2 未完整實測**；另 7 類指定外部／實機驗證未做。完整 13 項與 2.1–2.10、命令、量測界線見 [ACCEPTANCE_ROUND_4.md](./ACCEPTANCE_ROUND_4.md)，10 組修正交接見 [CURSOR_FIX_ROUND_4.md](./CURSOR_FIX_ROUND_4.md)。以下全部為先前開發／驗收歷史，不能代替本輪獨立結果。所有新證據在 ignored `output/acceptance-round-4/`；Codex 未修改正式功能或正式測試，未 push／部署。

第三輪既有自動回歸全過。新實際 Provider／native IDB／WebCrypto／通知交錯卻重現 wipe 後舊 vault 可重開解鎖讀回合成秘密；另一 cleanup 時序誤刪新工作區 C。正式 UI 保存的 100,001 字 notes 及真串流產生的 10,001 帳號，自己的 JSON 備份仍被拒收。control DB quota 誤報原因、重試成功後錯誤殘留；escaped comment、合法 atom angle 地址與跨批學校證據合併另有失敗。不是程式碼推測，也沒有資料外送證據。

`npm run check` exit0：格式、零警告 lint、型別、8 檔 34 單元、build。Chromium 原 E2E 初次因同專案舊 preview 佔用4173失敗，辨識並停止後以 `env -u NO_COLOR npm run test:e2e` 重跑3/3；Firefox／WebKit亦各3/3，無警告。large config Node直接parser1/1：300MiB／1,655,401封／13,099ms／heap取樣峰81,650,448／RSS254,033,920 bytes，不是Worker。

root production 31案例30通過／1失敗（舊30全過）；domain114案例108過／6敗（舊107全過），對應4組缺陷。parser舊43、前輪17核心、23封分類集TP17/FP0/FN0/TN6、舊UI12均過；新地址5個必要案例Node＋production Worker均失敗，另 evidence merge UI1失敗。分層與重現不加成P0分母、全產品案例數或缺陷總數；國際化／ZIP相容性觀察明列不作阻擋。

最終build真Worker四情境均完成、產品外部請求0：300MiB 9,307.7ms／41次進度／heap56,909,524／RSS435,830,784 bytes；2GiB單附件1,274.2ms／8次／heap885,220（僅3樣本，另backing88,677,441）／RSS439,975,936；2GiB多封32,768封1,428.9ms／9次／heap75,249,692／RSS528,449,536；300MiB ZIP11,245.7ms／51次／heap17,574,984／RSS353,140,736。取消另實跑；完整表、CDP取樣及hash見總報告／parser FINDINGS。2GiB稀疏合成檔不代表真Takeout吞吐，heap非全記憶體，峰值非瞬時最高。

正常掃描→遷移→倒數→匯出流程外連0、CSP實阻擋、惡意HTML執行0；正式UI wipe全DB枚舉仍有不含sentinel的技術epoch marker，未誇大為個資。PDF五場景皆過；深色Expired連結捲入畫面對比12.124，axe violations0／contrast incomplete0；讀屏未做，不能稱整站AA通過。SW控制離線掃描／保存／重載過，不是安裝PWA驗證。

40筆來源日期、50唯一網域、schema16、generator、全部URL覆蓋通過；本輪11服務成對官方抽讀，61 links＝49HTTP200／12HTTP403、exit1。Coursera／Evernote正文未取得，P0.3未完整實測，未當造假或死鏈；RESEARCH仍缺探索工具類比較及抱怨調查，其他指南／API／DESIGN研究已補。

未實際執行：Google／Apple／Outlook真ICS匯入與提醒、人工讀屏、真iOS／Android、OS安裝PWA冷離線；原生macOS Safari也未測。GitHub repo／網域／是否公開仍待使用者決定，未建立remote或部署。下一輪為FIX_ROUND_4完成後的第5輪，不重驗舊READY。

## Cursor 第 3 輪修正驗證（2026-10-19）

這一節是本輪自己重跑的結果。上一節 Codex 驗收仍是對 `9cab639` 的歷史，沒有覆寫。新證據在 ignored `output/cursor-verify-round-3/`。`output/acceptance-round-1/`、`output/acceptance-round-2/`、`output/acceptance-round-3/` 沒有改。

最終 `npm run check` exit 0（格式、lint、型別、34 個單元、build）。Worker 檔仍是 `worker-GPUqc0Rj.js`。三引擎 production E2E：`env -u NO_COLOR npm run test:e2e` Chromium 3/3，接著 `--browser=firefox` 3/3、`--browser=webkit` 3/3。`npx vitest run --config vitest.large.config.ts` 1/1：300MiB、9,559ms、訊息 1,655,401、heap 峰值 85,897,160、RSS 峰值 243,957,760。這是 Node 直接呼叫剖析器，不是 Worker。

`npm run catalog:links`：61 個網址，12 個 HTTP 403，退出碼 1。403 仍是 Canva、Miro、Discord、Khan Academy 兩則、Quizlet、Turnitin、ORCID、Moodle、OpenAI 匯出、Evernote、Reddit。403 是這次被擋，不是通過，也不是死鏈。

複製的第 3 輪 harness，分層計數，沒有加成成一個缺陷數：

- domain vitest 68/68，含 5,001 個帳號的 JSON 還原。日期 3 個時區各 6，共 18/18。Provider 原始 3/3、補充 3/3、進階 10/10。進階 10 包含雙 unlock 不再以舊 A 蓋掉新 B，以及 quota 恢復後 `error` 為空且資料仍在。
- parser 舊 probe 25/25，舊 expanded 16/16，地址 2/2。新邊界原始 20 筆：17 過、3 未過。`validate-new-boundaries` 把 Punycode、國際 local-part、只改 ZIP 加密旗標列為觀察，核心 17 筆沒有失敗。production UI 上，折行內層 MIME、QP 硬換行、quoted local-part、encoded display name 都與 Node 一致。舊格式 UI 12/12。200/500/1000/2000 小 EML ZIP 的 count 分別是 200、500、1000、2000。舊 23 封語料 TP17/FP0/FN0/TN6。
- root browser：edge 5/5（跨分頁 wipe 後 vault 沒有回來、雙 unlock reload 仍是 B、4,001 字筆記可再匯入、深色過期連結捲到可見）。critical 4/4。expanded 11/11。audit 10/10，含 Firefox 與 WebKit 的示範資料重新載入。

PDF：pypdfium2 5.14 量 `at-note.pdf` 241 個字形、超出 0、最右 549.246pt；`percent-note.pdf` 246 個字形、超出 0、最右 548.729pt。頁寬 612pt。字寬用 Helvetica AFM 全表（ASCII 32–126），不是只對 `@` 與 `%` 加特判。

對比：深色主題、390px、連結捲進畫面。16px、字重 400、字色 `rgb(23, 33, 23)`、底色 `rgb(215, 228, 138)`，實測比 12.12。axe `wcag2a/2aa/21aa/22aa` violations 0，color-contrast incomplete 0。這次沒有因此宣稱整站已由讀屏軟體通過 AA。

最終 parser build 的 Worker 檔是 `dist/assets/worker-GPUqc0Rj.js`。之後只改了主畫面的儲存狀態時機，同一檔名的 Worker 內容雜湊沒有變，所以下面數字仍是這份 parser。300MiB：314,572,800 bytes、1,655,647 封、6,408ms、32 次進度、Worker heap 峰值 49,453,444、整份 Chromium RSS 峰值 448,200,704、心跳最大間隔 67.4ms。2GiB 單一附件是稀疏檔（配置約 20,480 bytes）：2,147,483,648 bytes、1 封、883ms、6 次進度、heap 676,872（樣本少）、RSS 390,905,856。取消在看到進度後按鈕消失。2GiB／32,768 封也是稀疏檔（配置約 562,053,120 bytes）：1,432ms、8 次進度、heap 77,697,756、RSS 504,954,880、心跳最大間隔 89.9ms。300MiB ZIP：314,572,942 bytes、1,655,647 封、8,742ms、41 次進度、heap 17,704,376、RSS 374,128,640、心跳最大間隔 44.9ms。對外請求都是 0。

沒有做：把 `.ics` 匯入 Google、Apple 或 Outlook；VoiceOver 或 NVDA；實體手機；作業系統安裝的 PWA 離線。引擎測試不是 Safari，也不是手機。

## Codex 第 3 輪獨立驗收（2026-10-19）

**未通過。** 最終提交 `9cab6391a961c55074dcda11a2dfa7d108cfaf3c`。完整13項P0、2.1–2.10、命令及證據界線見 [ACCEPTANCE_ROUND_3.md](./ACCEPTANCE_ROUND_3.md)，14組修正交接見 [CURSOR_FIX_ROUND_3.md](./CURSOR_FIX_ROUND_3.md)。以下歷史紀錄不能代替目前結果。

固定P0為3通過／9失敗／1未完整實測；另7類外部／實機／安裝驗證未執行。上輪已執行的自動回歸案例皆通過；部分來源、指南與研究文件缺口仍延續，包含加密A/B、單頁unlock/wipe、MIME、備份計數、PDF W、schema、完成確認、Today假設等。正式功能碼與正式測試未由Codex修改。

`npm run check` exit0（29單元、型別、lint、格式及build），clean env的Chromium／Firefox／WebKit原production E2E各3／3，large config Node 1／1（7,381ms、heap取樣89,636,568、RSS251,396,096 bytes）。最終build真正Worker另重做300MiB／2GiB／ZIP／取消，全部對外請求0；主報告與parser raw記錄含hash與CDP採樣，不沿用最後ZIP改動前數據。

root production選定30案26通過／4失敗（舊25全過）；domain 107案101通過／6失敗；parser舊43全過，新核心17案11過／6失敗，3個國際化／ZIP旗標觀察不阻擋。分類舊23封TP17/FP0/FN0/TN6不代表真信箱100%，新失敗另列。不同層級不合併成P0完成率或缺陷數。

新production證明跨分頁清除後另一頁舊加密仍寫回vault且可解鎖讀回合成祕密；雙unlock會把已保存B改回A並在reload保留A。5001個正常掃描帳號與UI4001字note不能還原自己的JSON；quota恢復後仍留舊error；PDF @/%仍實際裁頁。深色Expired官方link16px前景／背景相同，對比1:1且截圖字消失；axe 0 violations但color-contrast incomplete1，沒有標AA通過。

40筆50網域、來源日期、generator、schema16全過；59 links：47 HTTP200／12 HTTP403，exit1。11服務email/export官方本輪重新讀取，Amazon export亦補查成功；Coursera/Evernote正文仍未驗，沒有推斷造假。Drive/OneDrive少量source、Slack步驟、PST實際支援格式路線與RESEARCH/DESIGN研究仍需補。全部新證據在ignored `output/acceptance-round-3/`，前輪未覆寫。

## Cursor 第 2 輪修正驗證（2026-10-19）

這一節是修正後在本機重跑的結果。上一節的 Codex 驗收數字保留，不能拿來當這一輪的通過證明。證據在 ignored `output/cursor-verify-round-2/`，沒有覆寫 `output/acceptance-round-1/` 或 `output/acceptance-round-2/`。

`npm run check` 結束代碼 0：格式、lint、`tsc --noEmit`、Vitest 7 個檔 29 項、production build。`env -u NO_COLOR npx playwright test` 在 Chromium、Firefox、WebKit 各 3／3。`npx vitest run --config vitest.large.config.ts` 1／1：300MiB、7,886ms、heap 峰值 89,549,336 bytes、RSS 峰值 243,728,384 bytes、1,655,401 封；這是測試行程直接呼叫剖析器。`npm run catalog:links` 檢查 59 個網址，47 個不是失敗、12 個 HTTP 403，腳本結束代碼 1。403 仍是這次被擋，不是通過，也不是死鏈。新增的學校說明網址有進這次稽核。

複製的 domain Vitest 65／65。日期探針三個時區各 6／6。Provider 補充 3／3，含加密 A/B 完成逆序後記憶體與 vault 都是 `SYNTHETIC_NEWER_B`，以及解鎖途中清除後 vault、plain 都沒有、記憶體政策不是那組祕密。原 Provider 三案 3／3，含暫停加密時清除與解除加密。schema 探針 16／16，含先前會丟例外的 nonstring source 與 domains object，都回傳 problems；Google 對照 `problems: []`。地址探針 2／2。parser probe 25／25，含 10001 筆保留。expanded-probe-64k 16／16。標註過的 23 封合成信 TP17／FP0／FN0／TN6；這只是這組構造語料，不是真實信箱準確率。

production 上，browser-format 的分 EML 與同一份 MBOX 都是 High、count 2；有效 EML 後壞 ZIP 仍留下 GitHub，而且 Mine 在重新載入後還在。200／500／1000／2000 封有效小 EML 的 ZIP 都完成，2000 的 count 是 2000。惡意 HTML 沒有發出外部請求，也沒有執行。Worker：300MiB 314,572,800 bytes、1,655,647 封、6,629ms、32 次進度、worker heap 峰值 56,237,680、瀏覽器 RSS 峰值 433,405,952；2GiB 單封 2,147,483,648 bytes、1 封、1,013ms、6 次進度；取消後 Cancel 按鈕不可見；2GiB 多封 32,768 封、1,598ms、9 次進度、worker heap 峰值 118,835,952、RSS 峰值 598,999,040；300MiB ZIP 314,572,942 bytes、1,655,647 封、8,585ms、41 次進度。這些 Worker 數字來自已含 8192-byte `push` 的 production build。其後只把 ZIP 尾端緩衝調到 8MiB，並在中央目錄筆數與 EOCD 不符時拒絕；這兩項由最後的 node expanded probe 在最終原始碼上通過，沒有把 300MiB Worker 再跑一次。產品請求沒有離開 127.0.0.1。

UI：critical 4／4，含解鎖途中 Delete 後資料沒有回來、同名手動帳號匯出再匯入、完成確認裡同時看得到 recovery 與 two-factor。expanded 11／11，含假設倒數、已過期、PST 替代連結、學校指南來源、鍵盤焦點、清除、CSP。audit 10／10，含 axe（`wcag2a`、`wcag2aa`、`wcag21aa`、`wcag22aa`）在 light 1440px 與 dark 390px 的八個路由沒有違規、沒有橫向溢出，以及 Firefox／WebKit 的示範資料重新載入。PDF 以 pypdfium2 5.14 量字形框：`wide-note.pdf` 248 個字形、超出 0、最右 548.52pt，頁寬 612pt，並輸出頁面 PNG。

沒有做：把 `.ics` 匯入真正的日曆、VoiceOver／NVDA、實體手機、作業系統安裝的 PWA。CI 的 `check.yml` 加了 `pull_request` 與 `push`，沒有遠端執行，不能說遠端已過。

## Codex 第 2 輪獨立驗收（2026-10-19）

**未通過。** 驗收版本 `c8c0d36cb3d2155c2c25f8059a8e1573e267c7d3`。完整13項P0及2.1–2.10、命令、原始證據與界線見 [ACCEPTANCE_ROUND_2.md](./ACCEPTANCE_ROUND_2.md)，修正交接見 [CURSOR_FIX_ROUND_2.md](./CURSOR_FIX_ROUND_2.md)。以下先前輪次保留為歷史，不能作目前通過證明。

固定P0：1通過／12失敗；另外7項真實行事曆、讀屏、實機與OS安裝PWA驗證未實際執行。第一輪多項問題已修好，但本輪production再次重現解鎖途中清除後資料復活；真Provider亦重現一般加密A/B逆序覆蓋。正式功能碼未被Codex修改。

`npm run check`通過（22單元與build）；Chromium／Firefox／WebKit各3個既有production E2E通過。初次執行器NO_COLOR/FORCE_COLOR衝突有警告，另以`env -u NO_COLOR npm run test:e2e`重跑3／3通過、沒有該環境警告；未隱藏產品console。root獨立production 25案例19通過／6失敗；domain分工92案88通過／4失敗。這些不是P0分母或獨立缺陷總數，不重複加總。

另外實跑large config的1個Node直接parser測試通過：300MiB、8,383ms、heap取樣峰值95,010,024 bytes、RSS235,651,072 bytes；這不是Worker數據。

本輪真Worker已做300MiB／2GiB／300MiB ZIP，取消與進度回歸通過，各完成情境產品對外請求0；數據在完整報告。新合法MIME／地址／電子報、批次錯誤、2,000有效ZIP仍未過。擴充23封合成集TP12/FP2/FN5/TN4，precision85.71%、recall70.59%，不是實際個人信箱準確率。PDF寬字裁切、計數JSON匯入歸零、重複手動帳號無法還原備份、來源/schema/方法文件亦待修。

40筆目錄、50唯一網域、來源日期與generator一致；本輪14服務同時email/export官方重新抽核，37服務讀到主要正文，另3正文未成功。links實跑56網址：44 HTTP200／12 HTTP403，exit1；403不是已證明死鏈。schema13個非法案例被接受，另2例外拒絕未回傳診斷。全部證據留在ignored `output/acceptance-round-2/`。

## Cursor 第 1 輪修正（2026-10-19）

修正後的命令結果寫在 [CURSOR_STATUS.md](./CURSOR_STATUS.md)。這裡只記這一輪新增的界線。

`npm run catalog:links` 結束碼 1：56 個網址、44 個 HTTP 200、12 個 HTTP 403。403 沒有改寫成通過。新增並在本輪重新請求得到 HTTP 200 的來源是 Gmail 轉寄、Google 帳號電子郵件說明、Spotify 登入方式、Microsoft 畢業生授權收回。

解析探針 25 項裡 24 項通過。`aggregate-has-safety-cap` 回傳 10001 個帳號，不符合探針的 `<= 5000`。該上限不是產品規格，這輪沒有為了讓探針通過而刪資料。

真正的 production Worker：300MiB 掃描 `bytesRead` 314572800、1655647 封、51 次進度、對外請求 0；2GiB 單封 `bytesRead` 2147483648、12 次進度、完成；2GiB 的 32768 封 `bytesRead` 2147483648、完成。取消後取消按鈕消失。這些是 Playwright Chromium 的 Worker，不是實機。

Chromium、Firefox、WebKit 的 headless 生產建置各 3 項 E2E 通過，含 console error/warning 為空、對外請求 0、離線重新載入。390px 與 1280px、light 與 dark 的 axe 違規為 0，`scrollWidth` 等於視窗寬度。這不是實機 Safari 或手機。

Google、Apple、Outlook 的真實日曆匯入、VoiceOver、NVDA、實機手機、安裝後的 PWA 離線，這輪沒有做。

## Codex 第 1 輪獨立驗收（2026-10-19）

**未通過。** 完整結果、版本、測試數與證據界線見 [ACCEPTANCE_ROUND_1.md](./ACCEPTANCE_ROUND_1.md)；修正交接見 [CURSOR_FIX_ROUND_1.md](./CURSOR_FIX_ROUND_1.md)。下方原開發測試紀錄保留為歷史，不能代替獨立驗收。

本輪原始 P0 固定 13 項：1 通過、12 失敗。選定的 92 個有決定性獨立回歸案例為59通過、33失敗，另4個探針不作規格阻擋；原15單元、3 E2E通過。沒有觀察到產品對外請求，但已實證加密保存可在清除後復活、ZIP防護與損毀處理問題、任務紀錄遺失、報告漏項、ICS注入、日期及無障礙問題。這些未修正前不得宣稱交付完成。

真正production Worker已測300MiB與2GiB，數字與限制完整保留。三種headless引擎基本保存對照通過；不能寫成實機手機或Safari通過。Google/Apple/Outlook真實ICS匯入、螢幕閱讀器、實機手機、實際安裝PWA後離線仍未執行。

## 以下為 Cursor 原始開發紀錄

時間：2026-10-19（Asia/Taipei）。數字來自這台機器當次執行，不是估計。

## 命令與結果

| 命令                                             | 結果                                                |
| ------------------------------------------------ | --------------------------------------------------- |
| `npm test`                                       | 5 個檔案、15 項通過                                 |
| `npx vitest run --config vitest.large.config.ts` | 1 項通過，約 7.4 秒                                 |
| `npm run test:e2e`                               | 3 項通過（Playwright Chromium，production preview） |
| `npm run catalog:links`                          | 結束碼 1。55 個網址，43 個 HTTP 200，12 個 HTTP 403 |
| `npx eslint . --max-warnings 0`                  | 通過                                                |
| `npx tsc --noEmit`                               | 通過                                                |

`npm run check` 的最終一次結果寫在 `docs/CURSOR_STATUS.md`。若該節和本表不一致，以狀態檔裡當次輸出為準。

## 分類準確率

檔案：`output/accuracy.json`（git 忽略）。

方法：一封合成 mbox，預期六個服務網域，另含電子報與一段損壞文字。預測網域與預期網域相同記為真陽性。

結果：messages 8；precision 1；recall 1；falsePositive 空；falseNegative 空。這是這組規則對這組合成信的結果，不是對真實信箱的準確率。

另外的單元測試涵蓋六類訊號、多語主旨、HTML 不留 `<script`、超長標頭、zip 內的 eml，以及超過比例上限的壓縮檔會被拒絕。

## 300MB 信箱

檔案：`output/large-scan.json`。

- 目標與實際讀取：314,572,800 bytes
- 訊息數：1,655,401
- 帳戶：只有 spotify.com
- 耗時：7358 ms
- heapUsed：開始 12,344,032；結束 46,802,232；取樣尖峰 88,164,744
- RSS：開始 72,171,520；結束 211,435,520；取樣尖峰 241,352,704

量測方式是測試行程直接呼叫 `scanReadable`，在每個約 1MB 的區塊拉取前記憶體。App 本身把同一剖析器放在 Worker。這次沒有在瀏覽器裡拖曳 300MB 檔案，所以不能宣稱介面在那個操作下沒有凍結。

## 端到端

`tests/e2e/app.spec.ts`，對 `vite preview` 的 production 建置：

- 示範資料、帳號確認、打開 GitHub 引導、標記完成、下載日曆
- 全程請求主機只有 127.0.0.1 / localhost
- axe 在 Settings 頁沒有違規
- 寫入 localStorage、sessionStorage、Cache Storage 後執行清除；IndexedDB 名稱 `after-school`、上述儲存與 service worker 註冊都被清掉
- Service Worker 控制頁面後離線重新載入，仍看得到首屏標題
- HTML 含 `connect-src 'none'`

## 連結稽核

`output/link-audit.json`，`checkedAt` 2026-10-18T18:09:39.042Z（UTC）。

403 的網址：Canva、Miro、Discord、Khan Academy（兩則）、Quizlet、Turnitin、ORCID、Moodle、OpenAI 匯出說明、Evernote、Reddit 資料請求。沒有記錄到 404。這些 403 是這次腳本被擋，步驟文字仍以當初寫入目錄的查證狀態為準，不在這次改成已重新確認。

## 已知限制

- 分類是規則，不是確定。likely 以外的說法不該出現。
- 服務步驟會過期。學校政策各校不同。保留天數若標成假設，就只是假設。
- 大量寄送網域可能把真正的服務認錯，或認不出來。
- 不讀 PST。不渲染郵件 HTML。Punycode 網域與非 ASCII local-part（SMTPUTF8）這次仍是 0 帳號，屬觀察，不是本輪阻擋。只改 ZIP 加密旗標、內容仍是明文的探針也不當阻擋。
- PDF 是簡單的單一字型文字，非 ASCII 會變成問號。請用文字報告保留原文。
- `.ics` 有 `VALARM` 提前一天。沒有把檔案匯入 Google、Apple 或 Outlook 日曆，不能宣稱那三個日曆已測過提醒。
- 沒有用實體手機或 VoiceOver / NVDA。行動裝置上的大檔只在文案裡提醒可能被系統關掉。
- 瀏覽器通知在分頁關閉後不可靠，介面有這句說明。沒有另做背景推播。
- 清除之後，下一次全新開啟可能寫入一份沒有個人欄位的空工作區。清除當下不會把個人筆記寫回去。
- 備份、保存與匯入共用 32,000,000 字元的 JSON 上限。超過這個上限的工作區不會被保存或下載。10,001 個帳號與 100,001 字筆記都在這個上限內。
- `after-school-control` 的隨機 wipe 標記在清除後仍在。它沒有筆記或信件。這是為了避免其他分頁把剛刪的資料寫回，和「每個資料庫都清空」的原要求還不一致，目前未解決。
- 同名 ZIP 項目仍可能被拒，這是相容性觀察，不是這一輪的阻擋。

## 只有使用者能做的事

- 用自己的信箱匯出檔在自己的電腦上掃一次。不要把該檔案上傳或交回。
- 抽查自己常用服務的官方步驟是否仍和目錄一致。
- 決定網域，以及要不要公開上線或建立 GitHub repo。
