<p align="center">
  <img src="https://img.shields.io/badge/InsightLens-AI-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==" alt="InsightLens AI" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
</p>

<h1 align="center">🔍 InsightLens AI</h1>

<p align="center">
  <strong>An end-to-end machine learning platform that empowers anyone to analyze data, train models, understand predictions, and generate AI-driven narratives — all through a beautiful, intuitive interface.</strong>
</p>

<p align="center">
  <em>Built by <a href="https://github.com/harvtek">Harvtek Labs</a></em>
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| **📊 Data Analysis** | Upload CSV, Excel, or JSON datasets and instantly receive summary statistics, data composition charts, missing value analysis, a correlation heatmap, and an interactive scatter plot explorer. |
| **🤖 AutoML Training** | Select a target column and auto-train **Logistic Regression**, **Random Forest**, and **XGBoost** models. The platform auto-detects classification vs. regression, handles high-cardinality columns, and ranks models on a live leaderboard. |
| **🧠 SHAP Explainability** | Generate global feature importance charts powered by **SHAP** (TreeExplainer for tree-based models, generic Explainer for linear models) to understand *why* your model makes its predictions. |
| **🎯 Predictions** | Make real-time predictions through a dynamically generated form — numeric inputs for continuous features, dropdowns for categorical features — with formatted output and confidence scores. |
| **📖 AI-Powered Data Stories** | Automatically generate a 4-part narrative ("The Beginning → The Discovery → The Intelligence → The Future") about your dataset using **Google Gemini AI**, with a graceful fallback for demo/offline usage. |
| **💬 AI Insights** | Ask natural-language questions about your model's behaviour and get expert-level answers powered by Gemini, contextualised with your model's feature importances. |

---

## 🏗️ Architecture

```
InsightLens AI/
├── backend/                  # FastAPI REST API
│   ├── app/
│   │   ├── main.py           # App entry point, CORS, router registration
│   │   ├── core/
│   │   │   └── store.py      # In-memory dataset storage
│   │   └── routers/
│   │       ├── data.py       # Upload, profile, scatter endpoints
│   │       ├── train.py      # AutoML training pipeline
│   │       ├── explain.py    # SHAP explainability engine
│   │       ├── predict.py    # Inference & model metadata
│   │       └── insight.py    # Gemini AI insights & story generation
│   ├── requirements.txt
│   └── .env                  # GEMINI_API_KEY
│
├── frontend/                 # React 19 + Vite SPA
│   ├── src/
│   │   ├── App.jsx           # Router configuration
│   │   ├── components/
│   │   │   ├── Layout.jsx    # Navbar, footer, responsive shell
│   │   │   └── FileUpload.jsx # Drag-and-drop upload (react-dropzone)
│   │   └── pages/
│   │       ├── Home.jsx      # Landing page
│   │       ├── Analyze.jsx   # Data profiling & visualisation
│   │       ├── Train.jsx     # Model training & leaderboard
│   │       ├── Explain.jsx   # SHAP feature importance
│   │       ├── Predict.jsx   # Prediction form
│   │       └── Story.jsx     # AI-generated data narrative
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — High-performance async API framework
- **Pandas / NumPy** — Data manipulation and numerical computing
- **scikit-learn** — Logistic Regression, Random Forest, metrics
- **XGBoost** — Gradient-boosted decision trees
- **SHAP** — Model explainability
- **Google Generative AI (Gemini)** — Natural-language insights and story generation

### Frontend
- **React 19** — Component-based UI
- **Vite 7** — Lightning-fast dev server and bundler
- **Tailwind CSS 4** — Utility-first styling
- **Recharts** — Pie, bar, and scatter chart visualisations
- **Framer Motion** — Fluid animations and page transitions
- **Axios** — HTTP client
- **react-dropzone** — Drag-and-drop file uploads

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- *(Optional)* A [Google Gemini API key](https://aistudio.google.com/app/apikey) for AI-powered features

### 1. Clone the Repository

```bash
git clone https://github.com/mh2204/insightai.git
cd insightai
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_api_key_here   # Optional — AI features degrade gracefully without it
```

Start the API server:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000** with interactive docs at **http://localhost:8000/docs**.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The application will be available at **http://localhost:5173**.

---

## 📋 Usage Workflow

```
1. Analyze  →  Upload your dataset (CSV / Excel / JSON)
2. Train    →  Select a target column and auto-train 3 models
3. Explain  →  Generate SHAP feature importance + AI insights
4. Predict  →  Enter new data points and get real-time predictions
5. Story    →  Read an AI-generated narrative about your data
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/data/upload` | Upload a dataset file |
| `GET` | `/data/profile/{id}` | Get summary statistics and correlations |
| `GET` | `/data/scatter/{id}` | Get scatter plot data for two columns |
| `POST` | `/train/` | Train models on a target column |
| `POST` | `/explain/` | Generate SHAP explanations for a model |
| `GET` | `/predict/metadata/{id}` | Get model input schema |
| `POST` | `/predict/` | Make a prediction with a trained model |
| `POST` | `/insight/` | Ask an AI question with context |
| `GET` | `/insight/story/{id}` | Generate an AI data story |

> Full interactive documentation is auto-generated at `/docs` (Swagger UI) when the backend is running.

---

## 🔧 Configuration

| Variable | Location | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | `backend/.env` | Google Gemini API key. AI features work in simulation mode without it. |
| `allow_origins` | `backend/app/main.py` | CORS origins — currently set to `["*"]` for development. |
| Backend port | CLI | Default `8000`. Change via `--port` flag on `uvicorn`. |
| Frontend port | `vite.config.js` | Default `5173`. |

---

## 🗺️ Roadmap

- [ ] Persistent model storage (database / filesystem)
- [ ] User authentication and project management
- [ ] Support for additional algorithms (LightGBM, CatBoost, neural networks)
- [ ] Batch prediction via file upload
- [ ] Deployment-ready Docker configuration
- [ ] Export trained models (ONNX / pickle)

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/harvtek">Harvtek Labs</a></strong><br/>
  <sub>© 2026 Harvtek Labs. Built with precision.</sub>
</p>
