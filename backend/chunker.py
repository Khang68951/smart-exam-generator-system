import re
from typing import Dict, List, Tuple

# ---------------------------------------------------------------------------
# Block level patterns
# ---------------------------------------------------------------------------

_FENCE = re.compile(r"^\s{0,3}(```|~~~)")
_DISPLAY_MATH_OPEN = re.compile(r"^\s{0,3}(\$\$|\\\[)")
_DISPLAY_MATH_CLOSE = re.compile(r"(\$\$|\\\])\s*$")
_TABLE_ROW = re.compile(r"^\s{0,3}\|.*\|\s*$")
_TABLE_SEPARATOR = re.compile(r"^\s{0,3}\|[\s:\-|]+\|\s*$")
_HEADING = re.compile(r"^\s{0,3}#{1,6}\s+\S")
_LIST_ITEM = re.compile(r"^\s*(?:[-*+\u2022]\s+|\(?\d{1,3}[.)]\s+|[a-zA-Z][.)]\s+)\S")

# Tokens that end with a period but never end a sentence.
_ABBREVIATIONS = {
    "e.g", "i.e", "etc", "vs", "cf", "al", "approx", "est", "resp",
    "fig", "figs", "eq", "eqs", "no", "nos", "ref", "refs", "sec", "secs",
    "ch", "chap", "pp", "vol", "ed", "eds", "ex", "inc", "ltd", "co", "corp",
    "dr", "prof", "mr", "mrs", "ms", "st", "jr", "sr", "phd", "msc", "bsc",
    "min", "max", "avg", "std", "var", "temp", "dept", "univ", "assoc",
    "tr", "hb", "vd", "vv", "tp", "ths", "gs", "ts", "pgs", "cn", "kg", "cm", "mm",
}

# A sentence boundary candidate: terminator, optional closing quotes/brackets, whitespace.
_SENTENCE_CANDIDATE = re.compile("[.!?\u2026]+[\"'\u201d\u2019)\\]]*\\s+")

# Characters that may legitimately open a new sentence.
_SENTENCE_OPENERS = "\"'\u201c\u2018([$\\\u2022\u2014\u2013-"

# Inline / display math spans that must never be cut in half.
_MATH_SPAN = re.compile(
    r"\$\$.*?\$\$|\\\[.*?\\\]|(?<!\$)\$(?!\s)[^$\n]*?(?<!\s)\$(?!\$)|\\\(.*?\\\)",
    re.DOTALL,
)

_TRAILING_TOKEN = re.compile(r"([\w\u00c0-\u1ef9.]+)$")


# ---------------------------------------------------------------------------
# Normalization
# ---------------------------------------------------------------------------


def clean_text(text: str) -> str:
    """Normalize raw text: unify line breaks and squash redundant spaces without losing block structure."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\u00a0", " ").replace("\u200b", "")

    normalized_lines = []
    for line in text.split("\n"):
        body = line.lstrip(" \t")
        indent = line[: len(line) - len(body)].replace("\t", "    ")
        normalized_lines.append((indent + re.sub(r"[ \t]+", " ", body)).rstrip())

    text = "\n".join(normalized_lines)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ---------------------------------------------------------------------------
# Sentence splitting
# ---------------------------------------------------------------------------


def _protected_spans(text: str) -> List[Tuple[int, int]]:
    """Return ranges of math expressions that sentence splitting must never enter."""
    return [(m.start(), m.end()) for m in _MATH_SPAN.finditer(text)]


def _is_real_boundary(
    text: str, punct_start: int, next_start: int, spans: List[Tuple[int, int]]
) -> bool:
    """Decide whether a punctuation match ends a sentence rather than an abbreviation, decimal or list marker."""
    if any(start < punct_start < end for start, end in spans):
        return False

    if next_start >= len(text):
        return False

    nxt = text[next_start]
    if not (nxt.isupper() or nxt.isdigit() or nxt in _SENTENCE_OPENERS):
        return False

    # '!' and '?' are unambiguous terminators; only '.' needs the checks below.
    if text[punct_start] != ".":
        return True

    before = text[:punct_start]
    match = _TRAILING_TOKEN.search(before)
    if not match:
        return True
    token = match.group(1)

    if token.lower().rstrip(".") in _ABBREVIATIONS:
        return False

    # Single initial such as "J." in "J. Smith".
    if len(token) == 1 and token.isalpha():
        return False

    # Ordered-list marker: a bare number standing alone on its line ("1. Introduction").
    if token.isdigit():
        line_start = before.rfind("\n") + 1
        if before[line_start:].strip() == token:
            return False

    return True


def split_into_sentences(paragraph: str) -> List[str]:
    """Split a paragraph into whole sentences, keeping abbreviations, decimals and math expressions intact."""
    paragraph = paragraph.strip()
    if not paragraph:
        return []

    spans = _protected_spans(paragraph)
    sentences: List[str] = []
    cursor = 0

    for match in _SENTENCE_CANDIDATE.finditer(paragraph):
        if match.start() < cursor:
            continue
        if not _is_real_boundary(paragraph, match.start(), match.end(), spans):
            continue
        piece = paragraph[cursor:match.end()].strip()
        if piece:
            sentences.append(piece)
        cursor = match.end()

    tail = paragraph[cursor:].strip()
    if tail:
        sentences.append(tail)

    return sentences or [paragraph]


def _split_oversized_sentence(sentence: str, chunk_size: int) -> List[str]:
    """Break a single over-long sentence at clause punctuation, falling back to word boundaries. Never mid-word."""
    if len(sentence) <= chunk_size:
        return [sentence]

    pieces: List[str] = []
    current = ""

    # Prefer clause boundaries before resorting to plain spaces.
    for part in [p for p in re.split(r"(?<=[;:,])\s+", sentence) if p.strip()]:
        candidate = f"{current} {part}".strip() if current else part
        if len(candidate) <= chunk_size or not current:
            current = candidate
        else:
            pieces.append(current)
            current = part
    if current:
        pieces.append(current)

    # Anything still oversized is cut on word boundaries only.
    final: List[str] = []
    for piece in pieces:
        if len(piece) <= chunk_size:
            final.append(piece)
            continue
        buf = ""
        for word in piece.split(" "):
            candidate = f"{buf} {word}".strip() if buf else word
            if len(candidate) <= chunk_size or not buf:
                buf = candidate
            else:
                final.append(buf)
                buf = word
        if buf:
            final.append(buf)

    return final


# ---------------------------------------------------------------------------
# Block segmentation
# ---------------------------------------------------------------------------


def _block(text: str, kind: str, attach_next: bool = False) -> Dict:
    return {"text": text.strip("\n"), "kind": kind, "attach_next": attach_next}


def split_into_blocks(text: str) -> List[Dict]:
    """Segment a document into structural blocks: heading, table, code, display math, list and paragraph."""
    lines = text.split("\n")
    blocks: List[Dict] = []
    i = 0
    total = len(lines)

    while i < total:
        line = lines[i]

        if not line.strip():
            i += 1
            continue

        # Fenced code block - always atomic.
        fence = _FENCE.match(line)
        if fence:
            marker = fence.group(1)
            buf = [line]
            i += 1
            while i < total:
                buf.append(lines[i])
                closing = lines[i].strip().startswith(marker)
                i += 1
                if closing:
                    break
            blocks.append(_block("\n".join(buf), "code"))
            continue

        # Display math block - always atomic.
        if _DISPLAY_MATH_OPEN.match(line):
            buf = [line]
            stripped = line.strip()
            closed = len(stripped) > 2 and bool(_DISPLAY_MATH_CLOSE.search(stripped[2:]))
            i += 1
            while i < total and not closed:
                buf.append(lines[i])
                closed = bool(_DISPLAY_MATH_CLOSE.search(lines[i]))
                i += 1
            blocks.append(_block("\n".join(buf), "math"))
            continue

        # Markdown table - kept whole so rows are never orphaned from their header.
        if _TABLE_ROW.match(line):
            buf = []
            while i < total and (_TABLE_ROW.match(lines[i]) or _TABLE_SEPARATOR.match(lines[i])):
                buf.append(lines[i])
                i += 1
            blocks.append(_block("\n".join(buf), "table"))
            continue

        # Heading - stays glued to the content it introduces.
        if _HEADING.match(line):
            blocks.append(_block(line, "heading", attach_next=True))
            i += 1
            continue

        # List - split only between items when oversized.
        if _LIST_ITEM.match(line):
            buf = []
            while i < total and lines[i].strip():
                if _TABLE_ROW.match(lines[i]) or _HEADING.match(lines[i]) or _FENCE.match(lines[i]):
                    break
                buf.append(lines[i])
                i += 1
            blocks.append(_block("\n".join(buf), "list"))
            continue

        # Plain paragraph: soft line wraps from PDF extraction are rejoined into one flow.
        buf = []
        while i < total and lines[i].strip():
            if (
                _TABLE_ROW.match(lines[i])
                or _HEADING.match(lines[i])
                or _FENCE.match(lines[i])
                or _DISPLAY_MATH_OPEN.match(lines[i])
            ):
                break
            if _LIST_ITEM.match(lines[i]) and buf:
                break
            buf.append(lines[i])
            i += 1
        blocks.append(_block(" ".join(part.strip() for part in buf), "para"))

    return [b for b in blocks if b["text"].strip()]


def _split_table(block: Dict, chunk_size: int) -> List[Dict]:
    """Split an oversized markdown table by rows, repeating the header so each part stays a valid table."""
    lines = [l for l in block["text"].split("\n") if l.strip()]
    if len(lines) <= 2:
        return [block]

    header = [lines[0]]
    body_start = 1
    if _TABLE_SEPARATOR.match(lines[1]):
        header.append(lines[1])
        body_start = 2

    header_len = sum(len(l) + 1 for l in header)
    parts: List[Dict] = []
    current: List[str] = []
    current_len = header_len

    for row in lines[body_start:]:
        if current and current_len + len(row) + 1 > chunk_size:
            parts.append(_block("\n".join(header + current), "table"))
            current = []
            current_len = header_len
        current.append(row)
        current_len += len(row) + 1

    if current:
        parts.append(_block("\n".join(header + current), "table"))

    return parts or [block]


def _split_list(block: Dict, chunk_size: int) -> List[Dict]:
    """Split an oversized list between items, never inside one."""
    items: List[List[str]] = []
    for line in block["text"].split("\n"):
        if _LIST_ITEM.match(line) or not items:
            items.append([line])
        else:
            items[-1].append(line)

    parts: List[Dict] = []
    current: List[str] = []
    current_len = 0

    for item in items:
        item_text = "\n".join(item)
        if current and current_len + len(item_text) + 1 > chunk_size:
            parts.append(_block("\n".join(current), "list"))
            current = []
            current_len = 0
        current.append(item_text)
        current_len += len(item_text) + 1

    if current:
        parts.append(_block("\n".join(current), "list"))

    return parts or [block]


def _blocks_to_units(blocks: List[Dict], chunk_size: int) -> List[Dict]:
    """Turn blocks into packable units, splitting oversized ones only at safe structural boundaries."""
    units: List[Dict] = []

    for block in blocks:
        kind = block["kind"]
        text = block["text"]

        if kind in ("code", "math", "heading") or len(text) <= chunk_size:
            units.append(block)
            continue

        if kind == "table":
            units.extend(_split_table(block, chunk_size))
        elif kind == "list":
            units.extend(_split_list(block, chunk_size))
        else:
            for sentence in split_into_sentences(text):
                for piece in _split_oversized_sentence(sentence, chunk_size):
                    units.append(_block(piece, "sentence"))

    return units


# ---------------------------------------------------------------------------
# Chunk assembly
# ---------------------------------------------------------------------------


def _join(units: List[Dict]) -> str:
    """Join units back into text, keeping a heading directly above the content it introduces."""
    out = ""
    for idx, unit in enumerate(units):
        if not out:
            out = unit["text"]
            continue
        separator = "\n" if units[idx - 1].get("attach_next") else "\n\n"
        out += separator + unit["text"]
    return out


def split_text_into_chunks(
    text: str, chunk_size: int = 1200, chunk_overlap: int = 200
) -> List[str]:
    """Chunk a document without cutting a sentence, table, list item, code block or formula in half.

    1. Segment the text into structural blocks (heading, table, code, math, list, paragraph).
    2. Split only oversized blocks, and only at safe boundaries (rows, items, sentences, words).
    3. Pack units up to chunk_size, carrying whole trailing units over as overlap context.
    """
    text = clean_text(text)
    if not text:
        return []

    units = _blocks_to_units(split_into_blocks(text), chunk_size)
    if not units:
        return []

    chunks: List[str] = []
    current: List[Dict] = []
    current_len = 0

    for unit in units:
        unit_len = len(unit["text"])

        if current and current_len + unit_len > chunk_size:
            # A heading at the tail belongs with the content that follows it, not above a page break.
            carried: List[Dict] = []
            while current and current[-1].get("attach_next"):
                carried.insert(0, current.pop())

            if current:
                chunks.append(_join(current))

                overlap: List[Dict] = []
                overlap_len = 0
                for previous in reversed(current):
                    if overlap_len + len(previous["text"]) > chunk_overlap:
                        break
                    overlap.insert(0, previous)
                    overlap_len += len(previous["text"])
                current = overlap + carried
            else:
                current = carried

            current_len = sum(len(u["text"]) for u in current)

        current.append(unit)
        current_len += unit_len

    if current:
        chunks.append(_join(current))

    return [c for c in chunks if c.strip()]
