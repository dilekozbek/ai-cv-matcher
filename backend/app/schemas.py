from pydantic import BaseModel, Field


# Output schema
class MatchResult(BaseModel):
    score: int = Field(description="0-100 arası eşleşme skoru")
    matched_skills: list[str] = Field(description="CV'de bulunan, JD'de istenen beceriler")
    missing_skills: list[str] = Field(description="JD'de istenen, CV'de eksik beceriler")
    summary: str = Field(description="Türkçe 2-3 cümlelik özet")
