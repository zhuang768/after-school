# 【第 5 輪修正】

驗收提交 `0b58167f9578d341d2b424c4bc79dd78946b84d5`，對應 FIX_ROUND_4。這次**只交 1 組已實際重現的隱私缺陷**。不重開已過的地址、合併、備份、PDF、quota、目錄或研究修正，不新增猜測性需求。完整結果見 `docs/ACCEPTANCE_ROUND_5.md` 及 ignored `output/acceptance-round-5/domain/FINDINGS.md`。

## 問題清單：檔案＋行號＋問題＋原因＋原始章節

1. **wipe 完成後，第三頁能讀取過時 vault 並重新存成有效資料，舊作業收尾也清不掉。**
   - `src/ui/state.tsx:113–117,122–123`：讀 epoch 與真正寫入分離，只在 commit 後清理；`:172–187,264–287` 的 boot／unlock 只核對當下 epoch 是否變動，未核對讀到的 vault 原來屬於哪一個清除世代。`src/lib/commit.ts:29–41` 的條件刪除正確保護新 commit，但第三頁已將舊內容認領成新 commit，所以舊作業不會再刪它。
   - 證據：`output/acceptance-round-5/domain/state-fence-window-results.json`、`state-fence-window.mjs`、同目錄 store／epoch bridge。是上輪既有 fence 流程的讀者補驗，**沒有任意增加新時序、沒有在 writeKey 入口新增 yield**。只延後已完成的原生讀取／commit 回傳；React Provider、IDB、AES-GCM、第三頁 boot／unlock 都是真的。
   - 實際順序：B 的 beforeWrite epoch 讀取完成但既有 await 尚未返回 → A wipe 已回傳，phase=saved、vault/plain 皆空 → 放行 B 讀取，舊 vault 真 commit，暫停既有完成回傳 → 第三頁 C boot 為 locked，原生 unlock=true、讀回 `SYNTHETIC_FENCE_OLD_SECRET` → 放行 B 的通知／postcheck → C 記憶體與實際 vault 仍是該舊內容，errors=[]。
   - 為什麼是問題：這不是只有技術 key 或短暫觀測；已清除的合成私密內容真正可由使用者路線讀回並持續保存。原114案只檢查沒有第三頁讀者時的終態，114/114仍如實保留；不能以它們通過取代這個已證實的讀回失敗。不宣稱自然發生頻率或已做 production UI 等價重演；此證據是瀏覽器中的正式 Provider/native IDB/WebCrypto 整合。
   - 對應原始最高隱私原則、第9章 Delete all my data、第11章 P0.10／P0.13、第12章隱私驗證、第13章品質門檻。

## 修正要求：具體方式與預期結果

- 修正整體跨頁讀寫協定，使 wipe 完成後的新讀者不能認領、解鎖或保存過時作業寫出的資料。不能只靠寫完後再清理，也不能因當下 epoch 沒變就信任任意 vault。請自行設計可驗證的世代／提交保護與舊版資料相容策略；保留不含個資的技術資訊與信件內容分離。
- 同時維持本輪已通過的新工作區 C 保護、雙 unlock、replace、明密切換、quota/retry、一般保存與原備份資料。禁止整庫刪除來掩蓋讀回，禁止刪加密或讓新資料遺失。
- 加入同一個真第三頁讀者流程的正式回歸：A wipe完成後C無法讀出舊內容；B完成後仍不能留下舊內容。保留舊114全部斷言，測試 bridge 只能控制已有原生await結果的送達，不修改crypto／DB結果。修正前後保存原始JSON。
- 本輪留下的無個資 epoch marker 已如實揭露，屬原「全部DB清除」要求的未決差異，**本訊息不再要求反覆改文案或直接刪掉安全marker**，也不自行批准例外。真日曆／讀屏／實機／安裝PWA未實測及HTTP403仍保留待驗證，這些不是本輪新增程式bug。

## 必須使用的 skill／工具

先簡短列這輪實際可用且會用的除錯／資安能力與未用理由；優先既有 `diagnosing-bugs`、`security-best-practices` 的React／JS參考與獨立資安審查。沿用Playwright、native IndexedDB／WebCrypto及原有bridge精確重現，不新增雲端服務、分析或依賴。只修這一組，不把技能清單變成額外開發範圍。

## 完成後的驗證指令與預期結果

1. 將本輪 harness **複製**至新 `output/cursor-verify-round-5/` 並改所有輸出路徑、重編來源bundle。跑 `domain/state-fence-window.mjs`、原 `state-fence.mjs`／`state-epoch.mjs` 及完整domain114回歸；新讀者流程不得讀出 sentinel，既有114全過。
2. `npm run check`、`env -u NO_COLOR npm run test:e2e`、Firefox／WebKit production E2E；零警告。root production31案、parser既有核心與實際UI、無外連／CSP／純文字／離線／JSON／PDF／axe與鍵盤完整回歸，不能只驗修改處。selector若因已核准文案改動而調整，記錄理由且保留斷言。
3. 若沒有改parser，不必為相同hash再做新的大檔量測；保留本輪最終build Worker證據並清楚說未重跑。若parser實際改了，必須在最後build重新驗Worker300MiB／2GiB／ZIP／取消與記憶體，不沿用舊數字。
4. 更新真實TEST_REPORT與狀態。先 `IN_PROGRESS — FIX_ROUND_5`，完整完成並本機提交後再 `READY_FOR_ACCEPTANCE — FIX_ROUND_5`，提供commit／真命令／證據。未完明列，之後Codex第6輪完整驗收；總上限8輪。

## 禁止事項

不得改壞已通過部分；不得為過關刪功能、測試、服務、資料、PDF、通知或加密；不得弱化斷言、CSP、隱私承諾或捏造量測／來源。不得因猜測追加修改，不抬任意帳號／筆記上限，不重開已解決問題。全部使用合成資料；禁止覆寫round1–5歷史。不建立remote／repo、不push、不部署或公開。只操作本專案及原聊天。root交接前會停止自己的4173 preview。
