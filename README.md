# GitIntel — Repository Intelligence Platform

GitIntel is a full-stack platform that takes any public GitHub repository and breaks it down into a clear, actionable health report. 

Instead of just counting stars and forks, it pulls raw data via the GitHub API, processes it through 5 distinct ML models, and feeds the results into Google Gemini to generate an executive summary. The goal is to help developers, hiring managers, and open-source contributors instantly understand the state of a codebase before they commit time to it.

![GitIntel Dashboard Preview](https://via.placeholder.com/1000x500/030308/818cf8?text=GitIntel+Dashboard)

## How It Works

When you drop a GitHub URL into the dashboard, the backend triggers a concurrent pipeline:

1. **Data Ingestion:** Fetches commits, contributors, languages, and the file tree via GitHub's REST API.
2. **ML Processing:** Runs 5 isolated models (Health Score, Commit Patterns, Contributor Distribution, Doc Quality, Tech Stack).
3. **AI Synthesis:** Passes the raw JSON metrics to Gemini 1.5 Flash to generate human-readable strengths, weaknesses, and security flags.
4. **Visualization:** Renders the completed report on the frontend using Recharts and a custom glassmorphic design system.

## Tech Stack

We kept the stack modern but focused on performance and reliability.

**Frontend:**
* React 18 + Vite
* React Router DOM
* Recharts (Data visualization)
* Lucide React (Icons)
* Custom Vanilla CSS (Design Tokens, Glassmorphism, Animations)

**Backend (Node.js):**
* Express.js
* MongoDB / Mongoose
* JWT + Bcrypt (Auth)
* @google/generative-ai (Gemini Integration)
* Octokit (GitHub API)

**ML Service (Python):**
* Flask
* Blueprint routing for isolated ML pipelines

---

## Local Setup

If you want to run this locally, you'll need three terminal windows to run the Frontend, Backend, and ML Service simultaneously.

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* MongoDB Atlas cluster (or local instance)
* Google Gemini API Key

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
ML_SERVICE_URL=http://127.0.0.1:8000
```
Start the Node server:
```bash
npm run dev
```

### 2. ML Service Setup
```bash
cd ml-service
python -m venv venv
source venv/Scripts/activate  # Or `source venv/bin/activate` on Mac/Linux
pip install -r requirements.txt
```
Start the Flask server:
```bash
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be running at `http://localhost:3000`.

## Architecture Notes

* **Graceful Degradation:** If the Python ML service goes down or Gemini hits a rate limit, the backend has built-in fallbacks. It will still return a computed score based on raw GitHub metrics rather than crashing the analysis.
* **Security:** The backend strictly handles all API keys. The frontend never touches GitHub or Gemini directly. 

## License
MIT
