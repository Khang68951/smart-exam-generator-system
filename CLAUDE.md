# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository location

The git root is `E:\SEGS\smart-exam-generator-system`, not its parent `E:\SEGS`. Open Claude Code in this directory.

## Commands

Backend (Python 3.11, venv at `.venv/`):

```bash
.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
.venv/Scripts/python.exe -m uvicorn backend.main:app --reload --port 8000
.venv/Scripts/python.exe backend/view_db.py    # dump documents/paragraphs/questions from SQLite
```

Frontend (Next.js 16, React 19, Tailwind 4):

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

Both must be running: the frontend hardcodes `http://localhost:8000` in `frontend/app/page.tsx`.

There is no test suite. Verify changes by running the app and exercising the upload flow with a real PDF/DOCX.

`backend/.env` is required — copy `backend/.env.example` and set `GEMINI_API_KEY`. Without a valid key the app still works but silently degrades to the rule-based generator (see below).

## Architecture

### The upload pipeline

`POST /upload-document/` (`backend/main.py:117`) is the only route that does real work; everything else is CRUD over what it produced. The chain:

1. `parser.py` — MarkItDown converts PDF/DOCX bytes to **Markdown**, not plain text. Tables arrive as `| ... |` rows and formulas as LaTeX. Every downstream stage depends on this.
2. `chunker.py` — `split_text_into_chunks(text, chunk_size=1200, chunk_overlap=200)`. Segments into structural blocks first (`split_into_blocks`), then packs them. Tables, fenced code and display math are **atomic** and never split mid-block; oversized tables split by row with the header repeated. Chunk size is 1200 because smaller values can't hold an ordinary table.
3. `question_generator.py` — `generate_questions_from_chunks()` tries Gemini, falls back to rule-based.
4. `main.py` persists chunks as `DBParagraph` rows coded `P1`, `P2`, … and questions as `DBQuestion`, then returns `format_doc_response()`.

### The citation contract

Paragraph codes (`P1`, `P2`, …) are the spine of the product: every question carries a `citation` pointing at the paragraph that grounds it, and the UI cross-links them. Chunk index → paragraph code is assigned in `main.py` and mirrored in the Gemini prompt, which labels each chunk `Paragraph [P1]:`. Changing chunking changes citation targets — keep the two in step.

### Gemini with silent fallback

`generate_questions_with_gemini()` returns `None` on a missing/placeholder key, any exception, or an unparseable response, and `generate_questions_from_chunks()` then runs the rule-based generator (keyword blanking over extracted prose sentences). A retired `AI_MODEL_NAME` therefore produces poor questions rather than an error. Check the `[AI]` lines on stdout to tell which path ran.

### JSON shape is hand-mapped, not schema-driven

`schemas.py` defines Pydantic models but **the routes do not use them**. `format_doc_response()` in `main.py:48` is the single place snake_case DB columns become the camelCase JSON that `frontend/app/types.ts` declares. Changing a field name means editing both, and `schemas.py` if you want it to stay honest.

### Backend import shim

`main.py`, `models.py` and `question_generator.py` each wrap imports in `try: from .x import ... / except ImportError: from x import ...` so the backend runs both as a package (`uvicorn backend.main:app`) and from inside `backend/`. New backend modules that import siblings should follow the same pattern.

### SQLite path is relative to CWD

`database.py` uses `sqlite:///./segs.db`, so the DB file lands wherever the process was started — that's why `segs.db` exists at both the repo root and in `backend/`. Start the server from a consistent directory or you will appear to lose data. The file is gitignored.

## Rendering document content (Markdown + KaTeX)

Source documents contain tables and formulas, and they must survive all three stages. This is an invariant, not a feature:

- **Chunker** keeps tables/code/math atomic (above).
- **Prompt** — `question_generator.py:67-71` requires the model to preserve LaTeX (`$...$`, `$$...$$`) and GFM tables including the `| --- |` delimiter row. The rule-based path drops structural lines via `extract_prose_lines()` and never blanks a token inside a math span.
- **Frontend** — every string originating from a document or the model must render through `frontend/app/components/RichText.tsx`, never as a raw text node. It runs react-markdown with `remark-gfm` + `rehype-katex`, and pre-processes the source: `repairTables()` re-inserts delimiter rows lost in extraction, `normalizeMath()` converts `\(...\)`/`\[...\]` to `$` form and rewrites one-line `$$x$$` into fenced form (remark-math otherwise degrades it to inline). Use `inline` to collapse paragraphs to spans inside headings and buttons.

Adding a new surface that displays paragraph text, question text, options, explanations or answers means wrapping it in `RichText`.

## Frontend structure

`frontend/app/page.tsx` is a single ~1270-line client component holding the whole flow as `AppState`: `upload → analyzing → config → workspace`, with a `student`/`educator` role toggle in the workspace. Preset documents come from `mockData.ts`; only the `custom-doc` path hits the real backend.

## Next.js version

Per `README/AGENTS.md`: this Next.js (16.2.10) has breaking changes relative to older conventions. Read the relevant guide in `frontend/node_modules/next/dist/docs/` before writing framework code rather than relying on recall.

## Design constraints

`README/DESIGN.md` is the design system (dark base `#0b0f19`, Outfit for display / Plus Jakarta Sans for body, indigo primary, borders-not-shadows for elevation) and `README/PRODUCT.md` states the product rules. Notable hard constraints: no nested cards, body line length 65–75ch, 4.5:1 contrast minimum, animations only to reinforce state changes, and citations shown as `[P1]` next to questions.

## research/

An APA7 LaTeX manuscript on strict-bound verification, built on Overleaf or via `latexmk -pdf`. Self-contained; see `research/README.md`. Not part of the application.
