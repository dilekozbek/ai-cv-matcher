from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.schemas import MatchResult
from app.services.pdf import extract_text_from_pdf
from app.services.llm import analyze_match

router = APIRouter(prefix="/match", tags=["match"])

@router.post("", response_model=MatchResult)
async def match_cv_with_jd(
    cv_file: UploadFile = File(...),
    jd_text: str = Form(...),
):
    if not cv_file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Sadece PDF dosyası kabul edilir")
    
    pages = extract_text_from_pdf(cv_file.file)
    cv_text = "\n".join(text for _, text in pages)

    if not cv_text.strip():
        raise HTTPException(status_code=400, detail="PDF'ten metin çıkarılamadı")

    return analyze_match(cv_text=cv_text, jd_text=jd_text)
