# Covid Dashboard 🌍

Hey there! Welcome to the **Covid Dashboard**, your go-to spot for real-time COVID-19 stats—served up in a friendly, human-readable way. Whether you’re curious about global trends, watching your country’s numbers, or exporting data for deeper analysis, this dashboard has plenty under the hood.

---

## 📋 What’s Inside

* **Global & Country Stats**: Totals for cases, deaths, recoveries, and more.
* **Historical Trends**: Graphs covering the past 90 days by default (custom ranges welcome!).
* **Hotspots Detector**: Highlights countries where new cases are surging.
* **Simple Predictor**: A basic trend estimate for the coming week.
* **Data Export**: One‑click download of CSV or JSON (raw vs. summary).
* **Interactive Charts**: Responsive, theme‑aware, and resize automatically.
* **Keyboard Shortcuts & Toasts**: Quick nav and in‑app feedback messages.
* **Performance Monitoring**: Timing logs to keep the UI snappy.

---

## 🚀 Quick Start

**1. Clone the repo**

```bash
git clone https://github.com/your-username/Covid_dashboard.git
cd Covid_dashboard
```

**2. Backend**

```bash
cd backend
npm install        # or yarn install
cp .env.example .env  # tweak if you have API keys
npm run dev        # http://localhost:5000
```

**3. Frontend**

```bash
cd ../frontend
npm install        # or yarn install
# (Optional) set REACT_APP_API_URL in .env
npm run dev        # http://localhost:3000
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser and you’re live!

---

## 📂 Project Structure & What Does What

```
Covid_dashboard/
├── backend/
│   ├─ controllers/
│   ├─ routes/
│   ├─ services/
│   │    ├─ diseaseService.js
│   │    └─ analyticsService.js
│   ├─ dataProcessing.js
│   ├─ formatters.js
│   └── index.js

└── frontend/
    ├─ public/
    └── src/
        ├─ App.jsx
        ├─ api.js
        ├─ components/
        │    ├─ Chart.jsx
        │    ├─ StatsCard.jsx
        │    └─ PerformanceMonitor.jsx
        ├─ hooks/
        │    ├─ useAutoRefresh.js
        │    ├─ useDebounce.js
        │    ├─ useLocalStorage.js
        │    ├─ useKeyboardShortcuts.js
        │    ├─ useToast.js
        │    └─ useChartResize.js
        └─ utils/
             ├─ chartHelpers.js
             └─ exportData.js
```

---

## ⚙️ How It Works

1. **Request**: Frontend calls `GET /api/stats?country=XYZ` (via `api.js`).
2. **Routing**: Express routes in `routes/` direct the call to the right controller.
3. **Controller**: In `controllers/`, we parse params, then invoke `services/diseaseService` or `analyticsService`.
4. **Service**: Fetches data from external API (with simple in‑memory caching), processes trends, hotspots, or predictions.
5. **Response**: Controller returns a clean JSON payload to the client.
6. **Display**: React components read the data, hook into `hooks/useToast` to show errors or success, then feed charts via `chartHelpers`.
7. **Extras**: Hooks like `useAutoRefresh` keep data fresh, `usePerformanceMonitor` logs render times in the console.

---

## ✨ Feature Details

* **Global & Country Stats**: diseaseService fetches the latest totals for cases, deaths, and recoveries from the COVID API, with simple in-memory caching to reduce repeated requests.
* **Historical Trends**: Pulls daily data points for the past 90 days (configurable), then feeds them into `chartHelpers` to render smooth line and bar charts.
* **Hotspots Detector**: analyticsService calculates week-over-week percent changes and flags countries whose new case counts are rapidly increasing.
* **Simple Predictor**: Applies a basic linear regression on recent data to estimate next week’s case counts, offering a quick peek at potential trends.
* **Data Export**: The `exportData` utility shapes JSON into downloadable CSV or JSON files, letting you grab raw or summarized stats with one click.
* **Interactive Charts**: Charts auto-resize via `useChartResize` and adapt to light/dark themes; tooltips and legends come courtesy of our Chart component configuration.
* **Keyboard Shortcuts & Toasts**: `useKeyboardShortcuts` listens for hotkeys (e.g., Shift+R for refresh); `useToast` pops up in-app notifications for success and error messages.
* **Performance Monitoring**: `PerformanceMonitor` logs mount, fetch, and render timings in the browser console so we can spot and optimize slow operations.

---

## 🔧 Environment Variables

* **backend/.env**

  ```env
  PORT=5000
  # e.g. COVID_API_KEY=... if you configure one
  ```

* **frontend/.env**

  ```env
  REACT_APP_API_URL=http://localhost:5000/api
  ```

---

## 🤝 Contributing

We love your help! ❤️

1. Fork the repo
2. `git checkout -b feature/your-idea`
3. Commit & push
4. Open a PR—describe what and why

---
