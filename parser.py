import io 
import pypdf
import docx

def extract_text_from_pdf(file_bytes) -> str:
    import io 
    text = ""
    pdf_file = io.BytesIO(file_bytes)
    reader = pypdf.PdfReader(pdf_file)

    for page in reader.pages :
        page_text = page.extract_text()
        if page_text:
            text += page_text +  "\n"

    return text

def extract_text_from_docx(file_bytes)->str:
    import io 
    text = ""
    docx_file = io.BytesIO(file_bytes)
    doc = docx.Document(docx_file)

    for paragraph in doc.paragraphs:
        if paragraph.text:
            text += paragraph.text + "\n"

    return text