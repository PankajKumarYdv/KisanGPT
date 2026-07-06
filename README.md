# KisanGPT (AI Multi-Agent Agriculture Platform)
> Helping farmers make smarter decisions with AI. Built as a premium entry for Google Kaggle's AI Agents Intensive course.

[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2019-6257E6?style=flat-shaping)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Backend-Express%20%2B%20Node.js-339933?style=flat-shaping)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%206.0-47A248?style=flat-shaping)](https://www.mongodb.com/)

---

## 🌟 Key Features

### 1. High-Fidelity Demo Mode
Toggled globally from the navigation bar. Serves 5 distinct agricultural scenarios dynamically, pulling from pre-seeded files to bypass database write requests:
- 🌾 **Ramesh Prasad (Patna, Bihar)**: Clay soil rice farming, high flood risk, high loan rates.
- 🥕 **Sidda Gowda (Chikmagalur, Karnataka)**: Sandy soil vegetables, nitrogen depletion, moisture stress.
- 🍇 **Sanjay Patil (Nashik, Maharashtra)**: Organic black soil grape exports, optimal weather stability.
- 🎋 **Harish Singh (Meerut, Uttar Pradesh)**: Sugarcane, winter frost/cold wave warning.
- 🌾 **Gurpreet Singh (Amritsar, Punjab)**: Wheat APMC high-profit sell window, summer heatwave warnings.

### 2. AI Multi-Agent Workflow Visualizer
A chronological DAG mapper showcasing real-time execution steps, latency, and confidence scores across the 5 independent specialist agents (Financial, Weather, Crop, Gov Scheme, Market Pricing) and synthesis pipelines.

### 3. Glassmorphic Live Telemetry Widgets
Visual gauges showing real-time OpenWeatherMap coordinates, humidity, soil moisture readings, daily APMC volume indexes, and circular risk indicators.

### 4. Interactive Chronological Timeline
Vertical chronological timeline showing immediate mitigation tasks (`Today`, `Tomorrow`, `Next Month`), expected yield impact metrics, estimated financial savings, and priority tags.

### 5. Document Exports
Download PDF diagnostic reports directly using custom print stylesheets, or export complete raw assessment configurations as JSON files.

---

## 📂 Project Structure

```text
KisanGPT/
├── client/                     # React 19 Frontend Application (Vite)
│   ├── src/
│      ├── components/         # Reusable layouts, Navbar, Notification Drawer
│      ├── hooks/              # API and global useDemoMode hooks
│      ├── mock/               # 5 Preseeded agricultural cohort scenarios
│      ├── pages/              # Dashboard, WorkflowVisualizer, Assessment Details
│      └── index.css           # Custom CSS styling & @media print overrides
│   
│
├── server/                     # Express Backend API Server (Node.js)
│   ├── src/
│   │   ├── agents/             # AI Multi-agent framework controllers
│   │   ├── routes/             # Express API blueprints
│   │   └── server.js           # Server application entry point
│   └── tests/                  # Integration testing scripts
├── docs/                       # Systems architecture developer guides
```

---

## ⚙️ Development Setup

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **MongoDB** (Port `27017`)

### 2. Local Installation
Install workspaces dependencies from root:
```bash
npm install
```

### 3. Environment Configuration
Create environment configurations inside the server directory:
```bash
cp server/.env.example server/.env
```
Ensure your database URI and API keys are populated.

### 4. Execution
Start client and server concurrently from the root directory:
```bash
npm run dev
```

---

## 🧪 Integration Testing
Run the automated testing suites to verify cache handling and API rounding logic:
```bash
# Weather cache & OpenWeatherMap Client
npm run test:weather -w server

# Mandi prices Agmarknet API validation
npm run test:market -w server
```

Access the dashboard portal at `[kishangptai](https://kishangptai.vercel.app/)`.
