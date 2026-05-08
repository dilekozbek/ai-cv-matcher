from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings

def extract_text_from_pdf(file) -> list[tuple[int,str]]:
    """PDF'i oku, her sayfa için (sayfa_no, metin) tuple'ı döndür."""
    reader = PdfReader(file)
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text()
        if text.strip():
            pages.append((i, text))
    return pages

def chunk_pages(pages: list[tuple[int, str]]) -> list[dict]:
    """Sayfaları chunk'la, her chunk'a sayfa numarası ekle."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = []
    for page_num, page_text in pages:
        for c in splitter.split_text(page_text):
            chunks.append({"text": c, "page": page_num})
    return chunks

