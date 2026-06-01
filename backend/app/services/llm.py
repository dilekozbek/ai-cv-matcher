from google import genai
from google.genai import types

from app.config import settings
from app.schemas import MatchResult

#Gemini client 
client = genai.Client(api_key=settings.gemini_api_key)

def analyze_match(cv_text: str, jd_text: str) -> MatchResult:
    """CV ve JD'yi LLM'e ver, structured eşleşme analizi al."""
    prompt = f"""Aşağıdaki CV'yi iş ilanına göre analiz et.
0-100 arası eşleşme skoru ver, eşleşen ve eksik becerileri listele, kısa Türkçe özet yaz.

EŞLEŞTİRME KURALLARI:
- Becerileri akıllı eşleştir, tam string match yapma.
- Versiyon farklılıkları aynı kabul edilir: HTML ↔ HTML5, CSS ↔ CSS3, Python ↔ Python 3.x
- Üst kavram alt kavramı kapsar: "JavaScript" CV'de varsa JD'deki "JS/ES6/ESNext" eşleşir.
- Framework ailesi: "React" CV'de varsa, JD "React.js" / "ReactJS" aynı sayılır.
- Yakın teknolojiler: "PostgreSQL" varsa JD "SQL" eşleşir; "Next.js" varsa JD "React" eşleşir.
- Synonim/kısaltma: "TS" = "TypeScript", "JS" = "JavaScript", "NLP" = "Natural Language Processing"

CV:
{cv_text}

JOB DESCRIPTION:
{jd_text}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
            max_output_tokens=800,
            response_mime_type="application/json",
            response_schema=MatchResult,
            thinking_config=types.ThinkingConfig(thinking_budget=0),
        ),
    )
    return response.parsed