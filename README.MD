# Innovexis - RepoRadar

RepoRadar is an AI-powered GitHub repository intelligence platform that provides deep repository summaries, automated commit risk analysis, and persistent developer workflows.

---

## Architecture Overview

```
┌────────────────────────────────┐
│   Frontend (React + Vite)      │
│   http://localhost:5173        │
└───────┬────────────────┬───────┘
        │                │
        │ /api/* proxy   │ Supabase Client (@supabase/supabase-js)
        ▼                ▼
┌──────────────────┐   ┌───────────────────────────┐
│ Backend (Express)│   │  Supabase Cloud Database  │
│ Port 5000        │   │  - Auth (Users & Sessions)│
│                  │   │  - Profiles               │
│ - GitHub Service │   │  - Search History         │
│ - Gemini AI      │   │  - Saved Summaries        │
└──────────────────┘   │  - Commit Analyses        │
                       └───────────────────────────┘
```

### How Frontend Connects to Backend
1. **API Reverse Proxy (Development):**
   - Configured in `frontend/vite.config.js`:
     ```javascript
     server: {
       proxy: {
         '/api': {
           target: 'http://127.0.0.1:5000',
           changeOrigin: true,
         },
       },
     }
     ```
   - When the frontend makes calls to `/api/github/analyze`, `/api/ai/summarize`, `/api/ai/analyze-commit`, or `/api/health`, Vite forwards them directly to the Express backend running on `http://127.0.0.1:5000`.
2. **Frontend Service Clients:**
   - **`frontend/src/services/api.js`**: Connects to the Express backend for GitHub data extraction and Gemini AI analysis.
   - **`frontend/src/services/db.js`**: Connects directly to Supabase with Row Level Security (RLS) to persist searches, bookmarked summaries, and commit analysis logs.
   - **`frontend/src/context/AuthContext.jsx`**: Handles sign up, sign in, session management, and profile synchronization directly with Supabase Auth.

---

## Getting Started

### 1. Backend Setup
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Configure environment variables in `backend/.env` (see `backend/.env.example`):
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   GITHUB_TOKEN=your_optional_github_token
   ```
3. Start the backend server:
   ```bash
   npm run dev
   # or: node src/server.js
   ```
   *Runs on `http://127.0.0.1:5000`.*

### 2. Frontend Setup
1. Open a separate terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Ensure `frontend/.env` is configured:
   ```env
   VITE_SUPABASE_URL=https://mikwhbbeisitrclcfwdk.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *Runs on `http://localhost:5173`.*

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend health check status |
| `POST` | `/api/github/analyze` | Fetches repo metadata, tree, and README from GitHub |
| `POST` | `/api/ai/summarize` | Generates structured project overview via Gemini AI |
| `POST` | `/api/ai/analyze-commit` | Analyzes commit differences and security impact |
