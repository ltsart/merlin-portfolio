# Merlin Portfolio — 開發記憶與規則

## 專案資訊
- 網址：https://ltsart.github.io/merlin-portfolio/
- 本地路徑：`/Users/merlin/Desktop/Claude Cowork/阿毛作品集/portfolio-web/`
- `merlin_resume_pdf.html` **不上傳 GitHub**，僅本地 PDF 匯出使用
- Push 指令：`cd "/Users/merlin/Desktop/Claude Cowork/阿毛作品集/portfolio-web" && git add . && git commit -m "update" && git push`

---

## 手機版開發規則（從實際踩坑中學到的）

### 1. overflow-x: hidden 要同時加在 html 和 body
`body { overflow-x: hidden }` 單獨使用無法完全防止絕對定位元素造成的橫向溢出。  
必須同時設定 `html { overflow-x: hidden }`。

### 2. overflow-x: hidden 會破壞 position: sticky
Android Chrome 上，任何祖先元素設了 `overflow-x: hidden` 都會建立新的 scroll container，導致 `position: sticky` 失效。  
**解法**：手機版 nav 改用 `position: fixed` + `body { padding-top: 88px }` 補償空間。

### 3. 手機版 :hover 狀態會卡住
觸控裝置點擊後觸發 `:hover`，但因為沒有 `mouseout` 事件，狀態會一直停留。  
**解法**：所有 hover 樣式包進 `@media (hover: hover)`，只讓真正有游標的裝置套用。

### 4. 手機版 :active 受 transition 影響，短觸可能看不到
按鈕如果設有 `transition`，短暫點擊的顏色變化來不及渲染就切回去了。  
**解法**：用 `touchstart` / `touchend` 事件手動加 `.is-pressed` class，不依賴 transition 時序。也不會卡住，因為 `touchend` 放開時立即移除。

```js
btn.addEventListener('touchstart', () => btn.classList.add('is-pressed'), { passive: true });
btn.addEventListener('touchend',   () => btn.classList.remove('is-pressed'));
btn.addEventListener('touchcancel',() => btn.classList.remove('is-pressed'));
```

### 5. Android 返回手勢會跳出整個網站
預設情況下，Android 左滑返回手勢在靜態網站首頁會直接退出到白畫面。  
**解法**：`history.pushState(null, '')` 推入一個緩衝歷史記錄，再監聽 `popstate` 判斷要關選單還是留在頁面。  
多頁靜態網站中，`popstate` 只對同 URL 的 pushState 記錄觸發，頁面間導航不受影響，安全。

### 6. Material Symbols 圖示粗細要統一 width/height
同一組 Symbol 圖示，viewBox 相同但 `width`/`height` 不同時，渲染出的線條粗細會不一樣（尺寸越大筆畫越粗）。同一視覺群組的圖示要統一尺寸。

### 7. Hero 大尺寸裝飾 blob 不要用 overflow: hidden 裁切
在 hero 元素加 `overflow: hidden` 雖然能防橫向溢出，但同時會裁掉上下的漸層背景，出現明顯邊界。  
**正確解法**：把 `hero::before` 的 `width` 縮到 `100vw`，讓它本來就不超出，不需要裁切。

### 8. 「群組齊左、整體置中」的 CSS 佈局
把多個項目包在一個 flex-column 的 wrapper 裡，wrapper 會自動縮成最寬子元素的寬度，再被父容器 `align-items: center` 置中。  
**不要**在個別項目加 `min-width`（會導致整組偏離中心）。

### 9. SVG 圖示顏色統一用 fill: currentColor
SVG 圖示設 `fill: currentColor`，透過 CSS `color` 屬性控制顏色，方便跨元件統一調整。

### 10. Footer 分隔線留邊距用 ::before 偽元素
`border-top` 無法設 margin，要讓分隔線有左右留白，改用 `::before` 偽元素搭配 `position: absolute; left: Xpx; right: Xpx`。

### 11. 手機 nav 隱藏/顯示要用累積距離，不是單次事件門檻
scroll 事件觸發頻率很高，`currentScrollY > lastScrollY + 4` 幾乎等同於「往下一滑就隱藏」。  
**正確做法**：追蹤累積往下距離 `downDelta`，超過門檻（例如 40px）才隱藏；往上滑時重置。
