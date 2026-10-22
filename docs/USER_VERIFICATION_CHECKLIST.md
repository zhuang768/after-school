# 剩餘親驗步驟

> 2026-10-22 GitHub 原始碼公開交付：[zhuang768/after-school](https://github.com/zhuang768/after-school)。使用乾淨公開快照與 GitHub noreply 署名，舊本機歷史保留且不推送。這不包含網站部署，也不把剩餘驗收改成通過。下文過往「未授權／未推送／無 remote」為發布前歷史；目前發布方式見 [PUBLICATION.md](./PUBLICATION.md)。

2026-10-22（Asia/Taipei），功能版本 `53253a5`。沒有修改正式功能或測試。ORCID 已補核完成，固定 P0 現為 **10 通過／0 新確證程式失敗／3 未完整驗收**；剩下是行事曆、完整安裝離線、無障礙／真機。

## 先準備

1. 打開專案內 `output/remaining-2026-10-22/After-School-test-files.zip`，解壓縮。全部是自行生成的合成資料，沒有真實私人信件。
2. Mac 已安裝 **After School QA 20261022**，可由 Dock 或啟動台開啟；它有獨立合成工作區，保留供你測試。不要拿自己的正式工作區代替。
3. 測試包內容：`synthetic.mbox` 是 GitHub 合成兩封；`synthetic-two.zip` 包含同一 mbox；`synthetic-one.eml` 是一封。三者不要全匯入後仍期待總數只有 2，因為匯入會累加。`invalid.zip` 是刻意損毀的安全測資。
4. `migration.ics` 是先前由 App 實際匯出的原檔，沒有手改；預期 **5 個整日事件**：2026-12-01 一個 GitHub 匯出任務、2026-12-10 四個學校任務，皆有一天前提醒。逐項見 `calendar-expected.json`。

## A｜安裝 PWA 的完整斷網流程

我已做：Safari 加入 Dock 真安裝、完全退出、停止來源伺服器、從 OS 冷開、手動新增／Mine／備註／勾選／Done、下載 JSON、再次完全退出並冷開保存。JSON 實際核對 Mine、Done、8 個子步驟和合成備註。這不是僅 viewport 或一般分頁重載。

還缺：整台裝置斷網，以及在安裝 App 內成功完成郵件選檔／掃描。我這次選檔時「上傳」維持反灰，原因尚未排除工具／原生面板因素，沒有把它當通過或擅改程式。

1. **先下載好測試包、讀完本清單**。本次交接會停止來源預覽伺服器，App 已暖機；不需要重新安裝。
2. 用 Command-Q 完全結束測試 App。暫時關閉 Wi-Fi；若另接有線網路，也暫時拔線。
3. 從 Dock／啟動台冷開 **After School QA 20261022**。應能看到 Today 與已保存的合成資料。不要用 localhost 網頁開啟成功當成 OS 冷開。
4. 到 **Accounts → Import mailbox**，選 `synthetic-two.zip`，只匯入一次。第一次應新增 GitHub／High／2；若已有 GitHub，先記原數量，這次應增加 2。
5. 在 GitHub 詳細頁標 **Mine**，到 Today 開啟新任務；只模擬合成任務，不需登入或更動真的 GitHub 帳號。勾選步驟及完成確認、Notes 寫 `MY_OFFLINE_TEST`，按 **Mark done**。
6. 到 **Settings → Download workspace**；確認下載成功。用文字編輯器打開 JSON，應含 `MY_OFFLINE_TEST` 和該任務的 `done`。再完全退出並冷開，資料仍應存在。
7. 測完恢復網路。回報「冷開／匯入／完成／下載／重開保存」各過或未過，附 OS 與瀏覽器版本。

**如果上傳仍反灰、出錯或卡住，就停止該項，記錄檔名與畫面，不要反覆重裝、改檔名或開放擴充功能讀檔來湊通過。** 不必傳任何自己的郵件。

若要重新暖機或恢復本機預覽，可在專案資料夾執行 `npm run preview -- --port 4173 --strictPort`，開 App 一次後 Command-Q，再到該終端機按 Control-C 停止來源，才開始斷網冷開測試。只關 Wi-Fi、卻讓 localhost 伺服器繼續供檔，不等於來源不可用的冷開測試。

## B｜三種行事曆各做一次真匯入

先恢復網路。只用合成 `migration.ics`，各平台新建一個**不分享**的測試日曆，例如 `After School QA`，不要選日常主日曆。由你選擇自己的帳號，我沒有代登入或寫入私人日曆。

### Google Calendar（電腦網頁版）

1. 左側 Other calendars 旁 **＋ → Create new calendar**，命名 After School QA。
2. **Settings → Import & export → Select file from your computer**，選 `migration.ics`。
3. 目的日曆明確改選 After School QA，再按 **Import**。核對 5 個事件、日期／標題、一天前提醒。

步驟依 [Google 建立日曆](https://support.google.com/calendar/answer/37095?hl=en) 與 [Google 匯入說明](https://support.google.com/calendar/answer/37118?hl=en)，2026-10-22 實讀；沒有把讀文件當成已執行匯入。

### Apple Calendar（Mac）

1. **檔案 → 新增行事曆**，由你選擇帳號，命名 After School QA；如果有 On My Mac，也可用本機測試日曆。
2. **檔案 → 輸入／Import**，選 `migration.ics`，目的日曆選 After School QA。
3. 核對上述事件與原提醒。只匯入 `.ics`，這裡不需要日曆封存檔。

依 [Apple 匯入說明](https://support.apple.com/en-gb/guide/calendar/-icl1023/mac)，2026-10-22 實讀。

### Outlook（網頁版）

1. **Calendar → Add calendar → Create blank calendar**，命名 After School QA。
2. **Add calendar → Upload from file → Browse**，選 `migration.ics`。
3. 目的日曆選 After School QA，按 **Import／Import and Save**，核對上述事件與原提醒。學校帳號若沒有此選項，就如實記錄限制。

依 [Microsoft 建立日曆](https://support.microsoft.com/en-us/outlook/add-a-calendar-in-outlook-com-or-outlook-on-the-web) 與 [匯入說明](https://support.microsoft.com/en-us/outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web)，2026-10-22 實讀。

### 實際提醒，另記結果

1. **先檢查匯入後是否保留原本一天前提醒**。若沒有，記為未通過；不要手動補提醒後說原匯出提醒通過。
2. 測試包事件在 12 月。若想近日觀察，於 App Settings 將 **School account expiry** 設為當天加 23 天（10 月 22 日測試為 11 月 14 日），在 **Timeline 實際確認**有未完成任務落在後天，再 **Download calendar**，匯入另一個測試日曆。這是依既有預設排程規則準備測資，日期與事件數要以這次 Timeline／新檔為準，不能套用舊檔 5 筆。
3. 保留原提醒設定，確認裝置與行事曆通知允許、裝置不關機，實際等到提醒出現；記平台、任務、預定時間及收到時間。只看到提醒欄位不等於收到通知。
4. 不想等也可以先交「已匯入／提醒欄位結果」，實際送達保持未驗，不強迫填通過。

## C｜讀屏與實體手機

### Mac VoiceOver

1. 在測試 App 按 **Command-F5** 開啟 VoiceOver；功能鍵設定不同時需同時按 Fn。首次歡迎對話框按 Return。
2. 以 Tab／Shift-Tab 移動控制項並聽讀；用 VoiceOver 的 Control-Option 搭配左右方向鍵巡覽文字／連結，Control-Option-Space 啟動控制項。
3. 走 **Accounts → 匯入／Mine → Today 任務 → Notes／子步驟 → Settings 匯出**。檢查名稱、狀態、焦點與進度是否讀得懂。也可選 `invalid.zip`，預期友善格式錯誤且不新增帳號。
4. 記下讀不到、焦點卡住或錯誤未宣告的具體頁面／按鈕；用同一快捷鍵關閉 VoiceOver。AX tree 與自動檢測不替代這次聽讀。

[Apple 開關 VoiceOver](https://support.apple.com/en-gb/guide/voiceover/vo2682/mac)、[導覽指令](https://support.apple.com/en-ca/guide/voiceover/cpvokys04/mac)。這些是操作指引，不是已執行讀屏的證據。

### iPhone／iPad Safari 與 Android Chrome

這項需要實體裝置，以及你同意的 HTTPS 測試網址；目前尚未部署，手機不能直接開電腦的 127.0.0.1。**你先決定是否授權提供 HTTPS 驗收站**，之後 Git／部署可由 Codex 執行，不要求你自己架站。

有網址後，兩平台各做：

1. 開測試站，將合成檔存到裝置的「檔案」或「下載」。
2. 匯入合成檔；再從 Services 勾選一項、手動新增一項，確認三輸入能用。
3. 標 Mine，編輯 Notes、勾步驟、完成一個任務；關閉再開，資料應保留。
4. 下載 JSON／報告，實際在裝置找到並打開；開啟系統減少動態後重看掃描／排序。記任何橫向溢出、按不到或選檔失敗。

## 交回結果

只需傳合成測試的結果、版本及必要畫面，不用傳私人郵件或整個私人日曆：

- PWA：冷開／匯入／完成／下載／重開保存各過或未過。
- Calendar：Google、Apple、Outlook 各列匯入筆數／日期／原提醒保留／實際提醒是否收到。
- 無障礙：VoiceOver 結果；iOS 與 Android 的三輸入／保存／匯出結果。

我會依結果一次整理可重現問題，不因猜測或未執行再改程式。自己的真信箱僅留在自己的裝置測，不交作開發測資。

## 發布決策另列

仍需你指定 GitHub owner／repo、是否授權建立與推送、私有或公開；決定保留既有 Git 姓名／信箱和文件本機帳號路徑，或授權準備匿名化版本；最後決定平台、網域與公開時間。尚未建 remote、推送或部署，這份測試清單不代表發布授權。
