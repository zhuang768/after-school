# 目前驗收與交付狀態

> 2026-10-22 Cloudflare 公開部署補充：可開啟的網站為 [after-school.ziz81503.workers.dev](https://after-school.ziz81503.workers.dev/)。正式網址 11 項操作測試通過，但 Cloudflare 的 NEL 連線錯誤回報標頭仍存在；使用者未核准此例外，所以公開主機的完全零外連驗收尚未通過。下方 10/13 是先前本機驗收紀錄，不能當作本次主機隱私已通過。詳見 [DEPLOYMENT.md](./DEPLOYMENT.md)。

> 2026-10-22 GitHub 原始碼公開交付：[zhuang768/after-school](https://github.com/zhuang768/after-school)。使用乾淨公開快照與 GitHub noreply 署名，舊本機歷史保留且不推送。這不包含網站部署，也不把剩餘驗收改成通過。下文過往「未授權／未推送／無 remote」為發布前歷史；目前發布方式見 [PUBLICATION.md](./PUBLICATION.md)。

2026-10-22（Asia/Taipei）。功能版本 `53253a5a76a63045d14f3bfa10b736bb5da67d12`，分支 `feat/local-migration-workspace`。這是第 6 輪補驗，不新增修正輪次。

**沒有新的確證程式缺陷；仍未完成全部 P0 實測與公開交付。** 本機可做的自動回歸、官方文件補核、安全掃描及部分原生桌面操作已完成。使用者已核准無個資技術標記，見 [DECISIONS.md](./DECISIONS.md)。未刪功能／測試／資料，未放寬其他隱私條件；沒有新修正交 Cursor，定時巡查維持暫停。

## 2026-10-22 定向補驗

本次僅補剩餘項，未改正式功能或正式測試、未重跑已過整套建置／測試，未交 Cursor 新修正。

- ✅ ORCID：同一官方文章一次取回 145 行正文，目錄三段 email 步驟都有依據，確證錯誤 0。可能含工具快取，未另測 HTTP 狀態；不改寫歷史 403。見 `output/remaining-2026-10-22/catalog/REPORT.md`。P0.3 關閉。
- ✅ 原生 Safari 18.5：本次真正經檔案選擇器匯入合成 mbox，顯示 GitHub／High／2，補上前次未完成的匯入證據。
- ✅ OS 安裝與來源不可用冷開：已用 Safari 加入 Dock，安裝 **After School QA 20261022**。確認程序完全退出，停止本專案 preview，curl exit 7／HTTP 000，再從 OS 啟動，工作區仍可用。手動新增合成服務→Mine→8 子步驟／備註→Done→下載 2348 bytes JSON，實際核對內容；再次完全退出、第二次冷開，仍顯示 20%／完成任務與備註。
- ⚠️ PWA 界線：以上未關閉整台電腦網路；不是 Wi-Fi 斷線實測。安裝 App 選 mbox／ZIP 時「上傳」保持反灰，尚未排除工具／原生面板因素，未成功提交郵件選檔，不把它算通過或直接當產品 bug 修。沒有因此擴大讀檔權限或修改 accept／功能。
- ⚠️ 真日曆／提醒、人工聽讀、實體手機仍未做。已準備合成測試包、5 事件預期清單與查過官方文件的逐步操作，不要求本人代查公開來源。

證據在 `output/remaining-2026-10-22/REPORT.md`、`native/` 與 `catalog/`；測試包 `After-School-test-files.zip`。安裝 App 保留供親驗，只有合成資料；第三方延伸功能存取要求已拒絕。本次沒有原生 App 全網路採樣，不能把隔離瀏覽器零外連數字冒稱本次新量測。預覽來源會在交接時停止，便於真正做來源不可用的冷開測試；要恢復預覽的指令見親驗清單。

## 固定 13 項 P0

| 項目                      | 判定 | 證據與剩餘界線                                                                                                                                            |
| ------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 本機解析                | ✅   | 格式、六類、信心、PSL、安全、取消回歸過；同 hash Worker 沿用第 5 輪真實大檔證據。                                                                         |
| 2 三輸入／學校網域        | ✅   | 匯入、清單、手動、多網域／轉寄與歸類過；本次補 Safari 手動操作。                                                                                          |
| 3 服務目錄                | ✅   | 40 筆／50 網域、來源日期、schema、11 服務成對抽核及受阻頁補核過；10 月 22 日 ORCID 同一官方原文成功讀取，三段步驟有據，唯一來源待項關閉。                 |
| 4 任務／狀態／風險        | ✅   | 五類五狀態、notes／子步驟保存、五因素、調權重與決定性過。                                                                                                 |
| 5 逐項／備援指南          | ✅   | 官方主機、新分頁、客服範本、完成確認及未知備援過。                                                                                                        |
| 6 學校遷移                | ✅   | drive／mail／contacts，學校規定實際影響日期與任務。                                                                                                       |
| 7 儀表板／報告            | ✅   | 進度、完成清單、文字／PDF、完整 JSON 往返過。                                                                                                             |
| 8 倒數／Today／ICS        | ⚠️   | 日期／時區／假設／推進、ICS 語法與 alarms 過；三種真行事曆匯入及實際提醒未做。                                                                            |
| 9 Already expired         | ✅   | 補救路線、誠實資料損失說明與深色對比過。                                                                                                                  |
| 10 保存／清除／備份／離線 | ⚠️   | 既有清除／備份回歸過，marker 已核准。本次 Safari 真安裝、來源停止後冷開、手動遷移／JSON 匯出／二次冷開保存過；裝置斷網與安裝 App 郵件選檔提交未完整驗證。 |
| 11 示範／首次使用         | ✅   | 首屏、合成示範、空白工作區、三引擎基本操作過；補原生 Chrome 示範。                                                                                        |
| 12 無障礙／響應式／錯誤   | ⚠️   | axe／Tab／對比等既有回歸過；Safari 原生匯入兩封合成信成功，原生測試仍有範圍界線，讀屏與真手機未驗。                                                       |
| 13 隱私／Methodology      | ✅   | 受測流程外連 0、CSP 實阻擋、純文字、敏感文字預設不保存過；標記如實揭露。                                                                                  |

合計：**10 通過／0 個新確證程式失敗／3 未完整驗收**。未實測不算程式失敗，也不能算通過；不同測試層案例不相加成 P0 或缺陷數。

## 已完成的實測

10 月 19 日第 6 輪 `npm run check` exit 0：格式、lint 零警告、型別、9 檔 38 單元、build；Chromium／Firefox／WebKit E2E 各 3/3，root UI 31/31、domain 固定 114/114，另列第三頁讀者 1/1、相容／直接 guard 3/3。完整 2.1–2.10 對照及界線見 [第 6 輪報告](./ACCEPTANCE_ROUND_6.md)、[TEST_REPORT.md](./TEST_REPORT.md)。本次沒有改功能而重跑整套。

受測掃描→遷移→倒數→報告／ICS／JSON 流程產品外連 0，CSP 實際阻擋，惡意 HTML 執行 0。清除後使用者內容／storage／Cache／SW 空，只留已核准隨機 epoch；已知跨頁舊 vault 不能由新頁讀回並重新保存。

300MiB mbox、2GiB 單封／多封、300MiB ZIP 及取消是第 5 輪 production Dedicated Worker 真量測。第 6 輪核對 Worker hash 相同後引用，不冒稱本次重測。2GiB 是稀疏合成檔，單封只有 2 個 heap 樣本；取樣峰值不等於瞬時最大或真 Takeout 吞吐。原始 CDP、RSS、心跳及進度保留在 ignored 證據。

10 月 20 日原生 Safari 18.5 的手動新增→Mine→任務→勾選／備註／In progress→重載保存通過；原生 Chrome 155 示範可用。檔案選擇器、PWA 安裝碰到工具限制，沒有冒稱完整通過；見本機 `output/finalization/native/REPORT.md`。

## 2026-10-20 官方來源補核（歷史）

下文保留當時結果；ORCID 已在上方 10 月 22 日補驗關閉。

原受阻 13 頁：**12 個官方正文支持／0 個確證錯誤／1 個當日正文未重新確認**。11 頁由 web 取回，可能使用工具快取；Amazon 原址實測 301→官方 200。不能寫成 12 個原 URL 皆直接 HTTP 200。ORCID 有第 2 輪官方閱讀歷史，本次安全驗證阻擋後停止；未知不等於死鏈，也不是必須本人登入代查。詳 `output/finalization/catalog/REPORT.md`。原 link script exit 1 歷史保留，沒有改腳本湊全綠。

## 上傳前安全檢查

既有 Gitleaks 8.30.1：全 7 筆 commit／reflog 及所有 239 blobs（2,220,092 bytes）機密候選 0。目前 84 個 tracked 與歷史沒有 env、node_modules、dist、output 或信箱檔；`.gitignore` 的實際排除已核對。詳 `output/finalization/security/REPORT.md`。

仍有發布身份選擇：Git 含既有非 noreply 作者姓名／信箱，`docs/CURSOR_FIX_ROUND_2.md:43`、`docs/CURSOR_FIX_ROUND_3.md:39` 含本機帳號工具路徑，歷史也存在。不能說整個歷史不含個資；未自行改設定或重寫歷史。

工作樹另有 1 個機密候選，位於 ignored、未追蹤的 PayPal 官方頁快取 clientToken，未驗有效性，未抹成假陽性；不在正常 Git 上傳集合。20 個超過 4MiB 的 ignored 生成檔、ZIP 解壓與 OCR 未全面掃描；第三方 node_modules 排除，Git blobs 則另完整掃描。模式掃描不是任意個資的絕對保證。證據未外送。

## 交付界線

親驗及發布選擇集中在 [USER_VERIFICATION_CHECKLIST.md](./USER_VERIFICATION_CHECKLIST.md)。尚無 remote、遠端 CI、推送 commit 或公開部署結果；`127.0.0.1:4173` 僅是本機預覽。未取得 repo／推送／部署授權前不公開；上傳前須對實際最終集合再核對。
