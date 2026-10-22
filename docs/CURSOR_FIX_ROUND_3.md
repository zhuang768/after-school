> Publication note: personal home-directory prefixes were replaced with `<HOME>`. The local original record is retained outside the public repository.

# 【第 3 輪修正】

第3輪獨立驗收提交`9cab6391a961c55074dcda11a2dfa7d108cfaf3c`仍未通過：固定P0 **3過／9失敗／1未完整實測**；另7類指定驗證未做。上輪已執行的自動回歸案例皆通過；部分來源、指南與研究文件仍有延續缺口，本輪另有新的可重現情境。完整原始需求仍是`docs/ORIGINAL_PROMPT.md`。請讀`ACCEPTANCE_ROUND_3.md`與`output/acceptance-round-3/{parser,domain}/FINDINGS.md`、`catalog/AUDIT.md`及root browser證據，不只修摘要。

## 問題清單：檔案＋行號＋問題＋原因＋原始章節

1. **跨分頁wipe後舊保存仍復活**：`src/ui/state.tsx:46–60,207–219`、`src/lib/wipe.ts:3–15`。generation/revision只在一個Provider；同一browser context兩頁，A清空全部資料後，B先前native encrypt完成仍寫回vault，重新解鎖能讀回原合成policy。最高隱私、第9／13章。production `browser/cross-tab-summary.json`、`cross-tab-wipe.json`，不是程式碼推測。
2. **兩次unlock逆序，舊資料覆蓋解鎖後編輯**：`src/ui/state.tsx:171–184`、`src/ui/App.tsx:237–254`。兩個unlock同generation，第2次成功後B已保存，釋放較慢第1次後變回A，reload仍A。第7.1／9／13章。production `browser/double-unlock.json`及真Provider `domain/state-advanced-results.json`第7案。
3. **正常可達資料與備份還原限制不一致**：`src/lib/workspace.ts:93–99,175`、`src/ui/App.tsx:925–939`。正式Node scanReadable處理932,967 bytes合成mbox產5001帳號／5005任務，2,970,060-byte JSON（未達5MB）被5000限制拒絕；UI4001字note已保存卻不能原樣匯入自己的備份。第6.2／7.1／9章。`domain/scanner-backup-roundtrip.json`、`browser/long-note-import.json`。不是要求任意截斷帳號。
4. **quota恢復成功仍顯舊失敗**：`src/ui/state.tsx:85–89`、`src/ui/App.tsx:122–129`。plain/encrypted兩案恢復put後新資料已保存、reload正確，但phase=saved與save error同時存在。第0／9／11 P0.12章。真Provider `domain/state-advanced-results.json`第8/9案；不是新資料遺失，請勿誇大。
5. **PDF只補部分字寬，@/%仍裁頁**：`src/lib/report.ts:50–97,110–136`。fallback600低估支援ASCII的@/%。實際612pt頁@最右887.375pt/67字形越界，%最右783.425pt/45字形越界，PDFium已渲染。第7.5／13章。`domain/pdf-extra-inspection.json`。W已修，不得只再補兩字特判。
6. **RFC2047 display decode前後順序錯，偽造地址證據**：`src/parser/headers.ts:88–92,108`、`domains.ts:29`。encoded display name解出`<ada@school.example>`或`<team@github.com>`後被當真addr-spec，真地址其實是personal/unrelated。第6.1.4／6.2／12章。Node＋最終production均重現。RFC2047 §6.2要求先剖析結構再解碼顯示文字，詳parser報告與官方RFC。
7. **quoted local-part含@漏掉學校地址**：`src/parser/headers.ts:62,72–75`、`domains.ts:50`、`aggregate.ts:85`。bare及angle兩種`"ada@alias"@school.example`均是合法RFC5322地址，Node／正式Worker皆done/0帳號，split('@')[1]取錯domain。第6.1.4／6.2。兩個最小fixture在parser目錄。
8. **內層MIME folded headers未展開**：`src/parser/mail-stream.ts:73–78`。內層Content-Type分行boundary=inner時漏掉本文開頭verification，頂層同類已有unfold卻未共用。第6.1／6.2／12章。`mime-folded-inner-part-content-type.eml` Node／production失敗。
9. **QP硬換行被刪除黏字**：`src/parser/mail-stream.ts:49,56–57`。`Please verify your\r\nemail`變youremail，Node／production漏判；soft break對照過。第6.2／12章。RFC2045 §6.7區分hard/soft break，見parser報告。
10. **深色Expired官方link對比1:1、看不見**：`src/styles.css:95–96,159–163`、`src/ui/App.tsx:307–316`。link前景／banner背景皆rgb(215,228,138)，16px常規字。實際scroll進viewport並看截圖，link字消失；axe 0violations但color-contrast incomplete1，不能稱AA。第9／10／12章。`browser/expired-link-ratio.json`, `expired-link-visible.png`。
11. **PST替代指引未真正走到支援格式**：`src/strings.ts:57,234,278`、`docs/RESEARCH.md:27`。學生指南實際導到PST export，沒有PST→EML/MBOX流程；只叫使用者export/copy無法完成盤點。第5／6.1／7.4章。官方Save單封EML文件及Outlook版本／授權界線已在catalog報告實讀，請按正文寫具體步驟或明確手動替代，不新增PST parser、不上傳轉檔站。
12. **少量來源／Slack操作仍缺**：`src/strings.ts:224,250–258`、`src/data/catalog.json:131,930–931`、`scripts/build-catalog.py:105,108,460–461`。Drive磁碟建議實出license-reclaim卻未列該任務來源；OneDrive alias句子缺個人alias官方source；Slack public export可由Owners及Admins操作，現漏Admin與實際匯出入口。第6.3／7.3／7.4章。catalog報告有本輪11成對官方正文及直接連結，不能刪句子／服務來過關。
13. **RESEARCH仍未完成原第5章研究**：`docs/RESEARCH.md:7,11,27,37,39,45,47`。缺信箱掃描隱私／刪除目錄／官方遷移匯出三類實際優缺點、具依據抱怨與差異、格式取得決策、Blob/File.stream／Worker／IDB／WebCrypto支援與產品降級。官方限制不等於使用者抱怨；讀的頁沒證實方案不等於Zotero/WordPress全服務沒有學生方案。第5／14章。catalog報告逐原始要求對照，未新增任意件數門檻。
14. **DESIGN仍缺原第10章外部案例研究**：`docs/DESIGN.md:3–37`。自身暖紙／FLIP／WCAG規格與skill建議不等於資訊設計、進度清單、安全隱私、設計社群的實際案例研究。第10／14章。須有真讀案例名/來源/日期/觀察手法/採用或不採用理由；不要為補文件重畫已過UI。

## 修正要求：具體方式與預期結果

先寫`IN_PROGRESS — FIX_ROUND_3`，不能沿用FIX_ROUND_2的READY。優先1/2/3隱私與資料保存，再完成全部14組。

- wipe需對同origin所有開啟的本App頁面失效：採可驗證的跨context清除epoch／協調及重新讀取保護，阻止其他頁舊讀取／加密／IDB作業寫回，其他頁不得留可恢復舊workspace並再保存。不能只廣播一次卻不在寫入提交前保護。保留單頁已過guards及所有儲存區清除，測背景／重開／延遲事件。
- unlock用獨立單調operation token或單次作業；UI可防重送，Provider仍需抵擋重入、wipe、replace／使用者新修改後的舊結果。新B必須留在記憶體與vault／reload；不能只靠button disabled隱藏競態。
- 掃描／輸入／保存／匯出／匯入範圍一致，所有可達工作區可無損還原。必要資源預算須明確且在進入不支援狀態前提示；不可下載成功才拒自己的備份，亦不可默默截服務／筆記。最新save revision成功只清除對應save error，別順手抹掉未解決wipe/open錯誤。
- PDF用完整字型metrics或可證明保守量測，涵蓋全部支援ASCII並實際渲染；保留全文／頁邊界與PDF。不要再加幾個字元特判。
- 郵件地址先結構tokenize再decode顯示文字，保留addr-spec local/domain邊界；不能讓decode生成的括號重新成結構。quoted local支援正確，不以第一個@切domain。共用有上限的part headers unfold，QP只移soft break、保留hard whitespace。附件跳過／深度／容量／HTML不渲染等安全界線維持。
- 深色banner link與focus需足夠對比，保留可辨識link外觀；scroll到真正內容後驗不同狀態，axe incomplete交人工判，不把0violations當全過。
- PST依官方文件分清備份PST與取得可掃描EML、New/Web/classic差異；無可行路徑就明確提供清單／手動，不暗示Google Takeout適用任意Outlook。學校/OneDrive source與generator同步，Slack補官方角色與可執行簡步驟及方案/權限分流。
- 按catalog報告的原第5/10章對照真正補研究，實際開頁並記日期與可追溯觀察。查不到抱怨或資料就誠實未取得，不編造或貼URL充數。DESIGN保留已過視覺，補外部案例如何對應本產品。IDN/SMTPUTF8目前限制誠實記Known Limitations；兩筆及不一致ZIP旗標探針是觀察，不能灌成P1。

## 必須使用的 skill／工具

開工列**實際可用**skill／工具／MCP、用途與不用原因。這輪地址/MIME及PDF已連續出現同類漏例，請先使用除錯、`security-best-practices`、`npm-skill`、PDF與設計／文件能力審查整體方法，勿繼續只對最小樣本打補丁。若成熟可本機bundled的parser／metrics工具更可靠，可評估採用；新增依賴前先說明用途、授權、體積、無執行期網路及成本；不採用也應用協定/全字元測試證明自有方案。只在必要範圍選工具，不為列名字安裝新服務。

讀本機`<HOME>/.codex/skills/security-best-practices/SKILL.md`及React/JS參考；PDF現成量測／渲染技能優先，impeccable或可用設計研究能力用於外部案例審查。Context7核對實際fflate／候選parser API；RFC2047 §6.2、RFC5322 §3.4.1、RFC2045 §6.7是本輪已讀官方依據，自己讀相關原文再修。

用真Playwright production雙分頁／重入、native WebCrypto/IDB受控完成順序、Vitest、CDP heap／RSS、axe+人工scroll與鍵盤、完整PDF字形／渲染。官網研究實際開頁，不用記憶補。

## 完成後的驗證指令與預期結果

- `npm run check`、`env -u NO_COLOR npm run test:e2e`及Firefox/WebKit同套production E2E、`npx vitest run --config vitest.large.config.ts`、`npm run catalog:links`。29既有單元與所有舊斷言保留，實際執行全部新回歸，正常產品console與外部請求均0；403仍未知，不編造通過。
- 複製round3 domain68／日期18／原Provider3／supplement3／advanced10／PDF原3+新2、root browser舊25＋新增5、parser舊43＋新核心17及正式UI到新Cursor驗證目錄再跑。每次await交錯、雙頁清除、雙unlock、新B/reload、5001帳號與4001字note備份、所有支援ASCII紙內、6合法格式負例需真過。不能弱化斷言、任意截斷或刪PDF/加密。
- root的`browser-edge.mjs`可用`EDGE_ONLY='wipe invalidates'`、`'double unlock'`、`'scrolled into view'`篩選；cross-tab followup只是一案證據補強，不重複算案例。必須保留人工算出的contrast≥4.5（16px字），別只跑axe斷言violations=[]。
- 真正最終build Worker再驗300MiB／2GiB／ZIP2000／取消／即時bytes+progress、CDP／完整獨立Chromium RSS；任何最後parser變更後都重跑，不能沿用變更前Worker數字。稀疏檔與取樣限制明寫，不把Node數據當Worker。
- 40來源日期/schema16與至少10服務成對官方email/export本輪實讀，補來源/角色/學校與PST流程，URL納維護。RESEARCH和DESIGN逐原始要求覆蓋並可回查實讀依據，不是只多一段自述。
- 真ICS三套匯入、OS提醒、讀屏、實機與OS安裝PWA沒做就如實未實際執行；功能成功不代表驗證完成。更新TEST_REPORT每個實測數及Known Limitations。

## 禁止事項

不得改壞已過部分；不得刪功能／測試／服務（PDF、通知、加密均保留）、捏造步驟或數字、隱藏warning、弱化oracle／隱私／CSP／安全限額。不要任意設5000帳號截斷過關；備份問題要解資料一致性。不可覆寫`output/acceptance-round-1/2/3`歷史證據，先複製harness並改輸出路徑到新目錄。

Codex的4173已停止，Cursor可自啟。只操作本專案與原聊天，禁止remote／push／部署／公開。完整做完再回`READY_FOR_ACCEPTANCE — FIX_ROUND_3`，附新commit、真命令、最終build證據與未實測清單；未完如實IN_PROGRESS／INCOMPLETE。Codex之後第4輪完整驗收，最多8輪，不代寫功能。
