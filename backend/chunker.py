import re
from typing import List


def clean_text(text: str) -> str:
    """Sanitize and normalize raw text by standardizing line breaks and redundant spaces."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_into_sentences(paragraph: str) -> List[str]:
    """Split paragraph into distinct sentence units using punctuation lookbehind patterns."""
    sentence_endings = re.compile(
        r"(?<=[.!?])\s+(?=[A-ZÀÁẢÃẠĂẮẮẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ0-9])"
    )
    sentences = sentence_endings.split(paragraph)
    return [s.strip() for s in sentences if s.strip()]


def split_text_into_chunks(
    text: str, chunk_size: int = 1200, chunk_overlap: int = 200
) -> List[str]:
    """Perform smart semantic chunking on document text.

    1. Split document by natural paragraph breaks (\n\n).
    2. Split oversized paragraphs further into complete sentence units.
    3. Aggregate units into semantic chunks up to chunk_size with overlap context.
    """
    text = clean_text(text)
    if not text:
        return []

    # Split into natural paragraphs
    raw_paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    units: List[str] = []
    for p in raw_paragraphs:
        if len(p) <= chunk_size:
            units.append(p)
        else:
            # If paragraph exceeds chunk size, split further into sentence units
            sentences = split_into_sentences(p)
            units.extend(sentences if sentences else [p])

    chunks: List[str] = []
    current_chunk: List[str] = []
    current_length = 0

    for unit in units:
        unit_len = len(unit)

        # Finalize previous chunk if adding current unit exceeds capacity
        if current_length + unit_len > chunk_size and current_chunk:
            combined = "\n\n".join(current_chunk)
            chunks.append(combined)

            # Preserve overlapping context from previous chunk units
            overlap_units = []
            overlap_len = 0
            for u in reversed(current_chunk):
                if overlap_len + len(u) <= chunk_overlap:
                    overlap_units.insert(0, u)
                    overlap_len += len(u)
                else:
                    break

            current_chunk = overlap_units
            current_length = sum(len(u) for u in current_chunk)

        current_chunk.append(unit)
        current_length += unit_len

    if current_chunk:
        combined = "\n\n".join(current_chunk)
        chunks.append(combined)

    return chunks