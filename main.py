from fastapi import FastAPI, UploadFile, File, HTTPException
import os 

from parser import extract_text_from_pdf, extract_text_from_docx
from chunker import split_text_into_chunks

app = FastAPI(title="Smart Exam Generator System API")

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 *1024

@app.post("/upload-document/")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename
    file_ext = os.path.splitext(filename)[1].lower()

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
        status_code = 400,
        detail=f"Invalid file type ! The system only supports: {', '.join(ALLOWED_EXTENSIONS)}" 
        )
    
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code = 400, 
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

    return {
        "status": "success",
        "message": "Received file successfully",
        "filename":filename,
        "size_bytes": file_size,
        "total characters": len(extract_text),
        "total chunk created": len(text_chunks),
        "chunk preview": text_chunks
    }


