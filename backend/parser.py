import io
from markitdown import MarkItDown


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract markdown-formatted text content from raw PDF file bytes using MarkItDown."""
    pdf_stream = io.BytesIO(file_bytes)
    md = MarkItDown()
    result = md.convert_stream(pdf_stream, file_extension=".pdf")
    return result.text_content


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract markdown-formatted text content from raw DOCX file bytes using MarkItDown."""
    docx_stream = io.BytesIO(file_bytes)
    md = MarkItDown()
    result = md.convert_stream(docx_stream, file_extension=".docx")
    return result.text_content