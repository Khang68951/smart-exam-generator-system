import io
import docx
from markitdown import MarkItDown


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract markdown-formatted text content from raw PDF file bytes."""
    pdf_stream = io.BytesIO(file_bytes)
    md = MarkItDown()
    result = md.convert_stream(pdf_stream, file_extension=".pdf")
    return result.text_content


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract paragraph text content from raw DOCX file bytes."""
    text = ""
    docx_file = io.BytesIO(file_bytes)
    doc = docx.Document(docx_file)

    for paragraph in doc.paragraphs:
        if paragraph.text:
            text += paragraph.text + "\n"

    return text