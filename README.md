# AI CV Matcher

Upload a CV (PDF), paste a job description, get a match score with matched and missing skills.
Next.js + FastAPI + Gemini.

## Demo

Live: _coming soon_

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind
- **Backend:** FastAPI, Python 3.12, Pydantic Settings
- **LLM:** Gemini 2.5 Flash with structured output
- **PDF:** pypdf
- **Chunking:** LangChain RecursiveCharacterTextSplitter

## Architecture

```
[Frontend (Next.js)]
       │
       │  multipart/form-data: cv_file + jd_text
       ▼
[Backend FastAPI]
   ├── routers/match.py     (POST /match)
   ├── services/pdf.py      (extract + chunk)
   ├── services/llm.py      (Gemini call)
   └── schemas.py           (MatchResult)
       │
       ▼
[Gemini 2.5 Flash]
       │
       │  JSON: { score, matched_skills, missing_skills, summary }
       ▼
[Frontend renders score circle + skill chips]
```

## Setup

### Backend
```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key" > .env
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend on `localhost:8000`, frontend on `localhost:3000`.
