from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.schemas import MatchResult
from app.services.pdf import extract_text_from_pdf
from app.services.llm import analyze_match

router = APIRouter(prefix="/match", tags=["match"])

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB


@router.post("", response_model=MatchResult)
async def match_cv_with_jd(
    cv_file: UploadFile = File(...),
    jd_text: str = Form(...),
):
    # 1. Cheap checks — file metadata
    if not cv_file or not cv_file.filename:
        raise HTTPException(status_code=400, detail="CV dosyası eksik")

    if not cv_file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Sadece PDF dosyası kabul edilir")

    if cv_file.size and cv_file.size > MAX_FILE_SIZE:
        size_mb = cv_file.size / 1024 / 1024
        raise HTTPException(
            status_code=400,
            detail=f"Dosya çok büyük ({size_mb:.1f}MB). Lütfen 2MB altı bir PDF deneyin."
        )

    # 2. Cheap checks — JD string
    jd_text = jd_text.strip()
    if not jd_text:
        raise HTTPException(status_code=400, detail="İş ilanı boş olamaz")

    if len(jd_text) < 10:
        raise HTTPException(status_code=400, detail="İş ilanı çok kısa (en az 10 karakter)")

    # 3. Expensive — PDF parse (only after cheap checks pass)
    pages = extract_text_from_pdf(cv_file.file)
    cv_text = "\n".join(text for _, text in pages)

    if not cv_text.strip():
        raise HTTPException(status_code=400, detail="PDF'ten metin çıkarılamadı")

    # 4. LLM call
    return analyze_match(cv_text=cv_text, jd_text=jd_text)
