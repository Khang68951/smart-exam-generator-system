from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os 

from parser import extract_text_from_pdf, extract_text_from_docx
from chunker import split_text_into_chunks
from question_generator import generate_questions_from_chunks

app = FastAPI(title="Smart Exam Generator System API")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual domain list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024

@app.post("/upload-document/")
async def upload_document(
    file: UploadFile = File(...),
    question_count: int = 5
):
    filename = file.filename
    file_ext = os.path.splitext(filename)[1].lower()

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type ! The system only supports: {', '.join(ALLOWED_EXTENSIONS)}" 
        )
    
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail="File too big ! Please upload a file smaller than 10MB."
        )
    
    extract_text = ""
    if file_ext == ".pdf":
        extract_text = extract_text_from_pdf(file_content)
    elif file_ext == ".txt":
        extract_text = file_content.decode("utf-8")
    else:
        extract_text = extract_text_from_docx(file_content)

    text_chunks = split_text_into_chunks(extract_text, chunk_size=500, chunk_overlap=100)
    generated_questions = generate_questions_from_chunks(text_chunks, question_count=question_count)

    return {
        "status": "success",
        "message": "Received file successfully",
        "filename": filename,
        "size_bytes": file_size,
        "total_characters": len(extract_text),
        "total_chunks_created": len(text_chunks),
        "chunks": text_chunks,
        "questions": generated_questions
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)


