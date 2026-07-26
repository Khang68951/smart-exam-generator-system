import datetime
import json
import os
import sys
import uuid
from typing import List

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Load environment variables from .env file
load_dotenv()

# Support both package imports and direct module imports regardless of execution entrypoint
try:
    from .parser import extract_text_from_docx, extract_text_from_pdf
    from .chunker import split_text_into_chunks
    from .question_generator import generate_questions_from_chunks
    from .database import Base, engine, get_db
    from .models import DBDocument, DBParagraph, DBQuestion
except ImportError:
    from parser import extract_text_from_docx, extract_text_from_pdf
    from chunker import split_text_into_chunks
    from question_generator import generate_questions_from_chunks
    from database import Base, engine, get_db
    from models import DBDocument, DBParagraph, DBQuestion

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Exam Generator System API")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024


def format_doc_response(doc: DBDocument):
    """Format a DBDocument SQLAlchemy model into the JSON structure expected by Frontend."""
    formatted_paragraphs = [
        {"id": p.paragraph_code, "text": p.text}
        for p in sorted(doc.paragraphs, key=lambda x: x.id)
    ]

    formatted_questions = []
    for q in sorted(doc.questions, key=lambda x: x.id):
        options = json.loads(q.options) if q.options else None
        formatted_questions.append(
            {
                "id": q.id,
                "type": q.type,
                "questionText": q.question_text,
                "options": options,
                "correctAnswer": q.correct_answer,
                "citation": q.citation,
                "explanation": q.explanation,
                "curriculumAligned": q.curriculum_aligned,
                "outOfBounds": q.out_of_bounds,
            }
        )

    return {
        "id": doc.id,
        "title": doc.title,
        "description": doc.description or "",
        "fileName": doc.file_name,
        "fileSize": doc.file_size or "",
        "paragraphs": formatted_paragraphs,
        "questions": formatted_questions,
    }


@app.get("/api/documents")
def get_documents(db: Session = Depends(get_db)):
    """Retrieve all stored documents with their paragraph chunks and questions."""
    docs = db.query(DBDocument).all()
    return [format_doc_response(doc) for doc in docs]


@app.get("/api/documents/{doc_id}")
def get_document(doc_id: str, db: Session = Depends(get_db)):
    """Retrieve a single document by its unique ID."""
    doc = db.query(DBDocument).filter(DBDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return format_doc_response(doc)


@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    """Delete a document along with all its related paragraph chunks and questions."""
    doc = db.query(DBDocument).filter(DBDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(doc)
    db.commit()
    return {"status": "success", "message": f"Document {doc_id} deleted successfully"}


@app.post("/upload-document/")
async def upload_document(
    file: UploadFile = File(...),
    question_count: int = 5,
    db: Session = Depends(get_db),
):
    """Handle document upload, text parsing, semantic chunking, question generation, and DB storage."""
    filename = file.filename
    file_ext = os.path.splitext(filename)[1].lower()

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type! The system only supports: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large! Please upload a file smaller than 10MB.",
        )

    extract_text = ""
    if file_ext == ".pdf":
        extract_text = extract_text_from_pdf(file_content)
    elif file_ext == ".txt":
        extract_text = file_content.decode("utf-8")
    else:
        extract_text = extract_text_from_docx(file_content)

    text_chunks = split_text_into_chunks(
        extract_text, chunk_size=500, chunk_overlap=100
    )
    generated_questions = generate_questions_from_chunks(
        text_chunks, question_count=question_count
    )

    # Format human-readable file size string
    if file_size < 1024 * 1024:
        size_str = f"{round(file_size / 1024, 1)} KB"
    else:
        size_str = f"{round(file_size / (1024 * 1024), 1)} MB"

    # Create database record for Document
    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    db_doc = DBDocument(
        id=doc_id,
        title=filename,
        description=f"Generated from uploaded file: {filename}",
        file_name=filename,
        file_size=size_str,
    )
    db.add(db_doc)
    db.flush()

    # Save chunks as Paragraphs
    for idx, chunk in enumerate(text_chunks, start=1):
        para_code = f"P{idx}"
        db_para = DBParagraph(
            doc_id=db_doc.id, paragraph_code=para_code, text=chunk
        )
        db.add(db_para)

    # Save generated questions
    for idx, q_data in enumerate(generated_questions, start=1):
        q_id = f"q-{doc_id}-{idx}"
        options_val = (
            json.dumps(q_data.get("options"))
            if q_data.get("options") is not None
            else None
        )
        db_q = DBQuestion(
            id=q_id,
            doc_id=db_doc.id,
            type=q_data.get("type", "multiple-choice"),
            question_text=q_data.get("questionText", q_data.get("question", "")),
            options=options_val,
            correct_answer=q_data.get("correctAnswer", ""),
            citation=q_data.get("citation", "P1"),
            explanation=q_data.get("explanation", ""),
            curriculum_aligned=q_data.get("curriculumAligned", True),
            out_of_bounds=q_data.get("outOfBounds", False),
        )
        db.add(db_q)

    db.commit()
    db.refresh(db_doc)

    formatted_response = format_doc_response(db_doc)

    return {
        "status": "success",
        "message": "File processed and saved to database successfully",
        "document": formatted_response,
        "filename": filename,
        "size_bytes": file_size,
        "total_characters": len(extract_text),
        "total_chunks_created": len(text_chunks),
        "chunks": text_chunks,
        "questions": formatted_response["questions"],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
