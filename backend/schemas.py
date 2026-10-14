from typing import List, Optional
from pydantic import BaseModel


class ParagraphSchema(BaseModel):
    """Pydantic schema representing a document source paragraph chunk."""

    id: str
    text: str

    class Config:
        orm_mode = True


class QuestionSchema(BaseModel):
    """Pydantic schema representing a generated exam question."""

    id: str
    type: str
    questionText: str
    options: Optional[List[str]] = None
    correctAnswer: str
    citation: Optional[str] = None
    explanation: Optional[str] = None
    curriculumAligned: Optional[bool] = True
    outOfBounds: Optional[bool] = False

    class Config:
        orm_mode = True


class DocumentSchema(BaseModel):
    """Pydantic schema representing a full document with paragraphs and questions."""

    id: str
    title: str
    description: Optional[str] = ""
    fileName: str
    fileSize: Optional[str] = ""
    paragraphs: List[ParagraphSchema] = []
    questions: List[QuestionSchema] = []

    class Config:
        orm_mode = True
