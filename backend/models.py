import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

try:
    from .database import Base
except ImportError:
    from database import Base


class DBDocument(Base):
    """SQLAlchemy model for uploaded document metadata."""

    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_name = Column(String, nullable=False)
    file_size = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    paragraphs = relationship(
        "DBParagraph", back_populates="document", cascade="all, delete-orphan"
    )
    questions = relationship(
        "DBQuestion", back_populates="document", cascade="all, delete-orphan"
    )


class DBParagraph(Base):
    """SQLAlchemy model for extracted document paragraph chunks."""

    __tablename__ = "paragraphs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    doc_id = Column(
        String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    paragraph_code = Column(String, nullable=False)  # e.g., "P1", "P2"
    text = Column(Text, nullable=False)

    document = relationship("DBDocument", back_populates="paragraphs")


class DBQuestion(Base):
    """SQLAlchemy model for generated document questions."""

    __tablename__ = "questions"

    id = Column(String, primary_key=True, index=True)
    doc_id = Column(
        String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    type = Column(
        String, nullable=False
    )  # Question type: "multiple-choice", "fill-in-the-blank", "short-answer"
    question_text = Column(Text, nullable=False)
    options = Column(
        Text, nullable=True
    )  # JSON array string representation for multiple-choice options
    correct_answer = Column(Text, nullable=False)
    citation = Column(String, nullable=True)
    explanation = Column(Text, nullable=True)
    curriculum_aligned = Column(Boolean, default=True)
    out_of_bounds = Column(Boolean, default=False)

    document = relationship("DBDocument", back_populates="questions")
