import json
import os
import random
import re
from typing import Any, Dict, List, Optional

# Support both package imports and direct module imports regardless of execution entrypoint
try:
    from .chunker import split_into_sentences as split_text_into_sentences
except ImportError:
    from chunker import split_into_sentences as split_text_into_sentences

# Lines that carry structure rather than prose - unusable as fill-in-the-blank material.
_STRUCTURAL_LINE = re.compile(r"^\s{0,3}(\||#{1,6}\s|```|~~~|\$\$|\\\[)")


def generate_questions_with_gemini(
    chunks: List[str],
    question_count: int = 5,
    difficulty: str = "medium",
    allowed_types: Optional[List[str]] = None,
) -> Optional[List[Dict[str, Any]]]:
    """Generates exam questions strictly grounded in document text using Gemini AI with robust JSON validation."""
    gemini_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("AI_MODEL_NAME", "gemini-2.5-flash")

    if not gemini_key or gemini_key.startswith("your_"):
        print("[AI] Gemini API Key is missing or invalid. Using fallback generator.")
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=gemini_key)

        # Format text chunks with clear paragraph markers [P1], [P2], etc.
        formatted_paragraphs = []
        for idx, chunk in enumerate(chunks):
            formatted_paragraphs.append(f"Paragraph [P{idx + 1}]:\n{chunk}")
        full_text = "\n\n".join(formatted_paragraphs)

        types_str = (
            ", ".join(allowed_types)
            if allowed_types
            else "multiple-choice, fill-in-the-blank, short-answer"
        )

        # Gemini-optimized prompt focusing on Strict Context-Bounding and Anti-Hallucination
        prompt = f"""You are an expert exam content creator specializing in Strict Context-Bounding and hallucination prevention.

DOCUMENT SOURCE CONTENT:
{full_text}

TASK:
Analyze the document content above and generate exactly {question_count} exam questions.
Difficulty level: {difficulty}.
Allowed question types: {types_str}.

STRICT CONTEXT-BOUNDING & GROUNDING RULES:
1. Every question, option, and correct answer MUST be based 100% strictly on facts explicitly stated in the document.
2. DO NOT use external knowledge, unstated assumptions, or outside facts.
3. Every question MUST include an accurate "citation" field pointing to the exact paragraph code (e.g., "P1", "P2").
4. Provide an "explanation" field citing the specific sentence from the paragraph that proves the correct answer.
5. Set "curriculumAligned": true and "outOfBounds": false for all grounded questions.

FORMATTING RULES (the frontend renders Markdown + KaTeX):
1. Preserve mathematical notation as LaTeX: inline as $...$ and display formulas as $$...$$.
2. Preserve tabular data as GitHub-flavored Markdown tables, always including the | --- | delimiter row.
3. Never flatten a formula or a table into prose, and never invent rows or symbols absent from the source.
4. Escape every backslash correctly so the JSON string stays valid (e.g. "$\\\\frac{{1}}{{2}}mv^2$").

JSON RESPONSE FORMAT:
Return a JSON array of objects adhering strictly to this structure:
[
  {{
    "id": "gen-q1",
    "type": "multiple-choice",
    "questionText": "Clear question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact text of the correct option or fill-in answer",
    "citation": "P1",
    "explanation": "Paragraph [P1] states: ...",
    "curriculumAligned": true,
    "outOfBounds": false
  }}
]
"""

        # Call Gemini AI with enforced JSON response MIME type and low temperature for precision
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )

        raw_text = response.text.strip()
        # Clean markdown codeblocks if present
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)

        data = json.loads(raw_text)

        # Handle case where Gemini wraps the result in a root object (e.g., {"questions": [...]})
        if isinstance(data, dict):
            for key in ["questions", "data", "items", "results"]:
                if key in data and isinstance(data[key], list):
                    data = data[key]
                    break

        if isinstance(data, list) and len(data) > 0:
            validated_questions: List[Dict[str, Any]] = []
            for idx, item in enumerate(data, start=1):
                if not isinstance(item, dict):
                    continue

                q_text = item.get("questionText") or item.get("question") or ""
                if not q_text:
                    continue

                q_type = str(item.get("type", "multiple-choice"))
                correct_ans = str(item.get("correctAnswer") or item.get("answer") or "")
                citation = str(item.get("citation") or "P1")
                explanation = str(item.get("explanation") or "")

                raw_options = item.get("options")
                options: Optional[List[str]] = None
                if q_type == "multiple-choice":
                    if isinstance(raw_options, list):
                        options = [str(opt) for opt in raw_options]
                    elif correct_ans:
                        options = [correct_ans, "Option B", "Option C", "Option D"]

                validated_questions.append(
                    {
                        "id": str(item.get("id") or f"gen-q{idx}"),
                        "type": q_type,
                        "questionText": q_text,
                        "options": options,
                        "correctAnswer": correct_ans,
                        "citation": citation,
                        "explanation": explanation,
                        "curriculumAligned": bool(item.get("curriculumAligned", True)),
                        "outOfBounds": bool(item.get("outOfBounds", False)),
                    }
                )

            if validated_questions:
                print(
                    f"[AI] Successfully generated & validated {len(validated_questions)} questions using Gemini AI ({model_name})"
                )
                return validated_questions

    except Exception as e:
        print(f"[AI] Error calling Gemini AI: {e}. Falling back to rule-based generator.")

    return None


def clean_sentence(sentence: str) -> str:
    """Trim leading and trailing whitespace from a sentence."""
    return sentence.strip()


def extract_prose_lines(text: str) -> List[str]:
    """Keep only the prose lines of a chunk, dropping tables, headings and whole code/formula blocks."""
    prose: List[str] = []
    in_code = False
    in_math = False

    for line in text.split("\n"):
        stripped = line.strip()
        if not stripped:
            continue

        if in_code:
            in_code = not stripped.startswith(("```", "~~~"))
            continue

        if in_math:
            in_math = not stripped.endswith(("$$", "\\]"))
            continue

        if stripped.startswith(("```", "~~~")):
            in_code = True
            continue

        if stripped.startswith(("$$", "\\[")):
            # A one-line display formula opens and closes on the same line.
            in_math = not (len(stripped) > 2 and stripped.endswith(("$$", "\\]")))
            continue

        if _STRUCTURAL_LINE.match(line):
            continue

        prose.append(stripped)

    return prose


def split_into_sentences(text: str) -> List[str]:
    """Split text into prose sentence candidates, skipping tables, code and formula blocks."""
    sentences = split_text_into_sentences(" ".join(extract_prose_lines(text)))
    return [clean_sentence(s) for s in sentences if len(clean_sentence(s)) > 30]


def extract_keywords(sentence: str) -> List[str]:
    """Extract key non-stopword terms from a sentence, ignoring anything inside math expressions."""
    # Blanking a token inside $...$ would corrupt the formula, so drop math spans first.
    prose = re.sub(r"\$[^$\n]+\$|\\\([^\n]*?\\\)", " ", sentence)
    words = re.findall(r"\b[a-zA-ZÀ-ỹ0-9]{4,20}\b", prose)
    stopwords = {
        "should", "would", "could", "about", "their", "there", "these", "those",
        "which", "where", "under", "after", "before", "while", "during", "through",
        "between", "system", "process", "models", "using", "first", "second", "other",
        "chúng", "những", "được", "trong", "người", "như", "theo", "nghiên", "cứu"
    }
    keywords = [w for w in words if w.lower() not in stopwords]
    return list(set(keywords))


def generate_questions_from_chunks(
    chunks: List[str],
    question_count: int = 5,
    difficulty: str = "medium",
    allowed_types: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Primary entrypoint for question generation: uses Gemini AI prompt first, falling back to rule-based generator."""
    # 1. Attempt question generation using Gemini AI
    ai_questions = generate_questions_with_gemini(
        chunks=chunks,
        question_count=question_count,
        difficulty=difficulty,
        allowed_types=allowed_types,
    )
    if ai_questions:
        return ai_questions

    # 2. Fallback: Rule-based generator when Gemini API Key is unavailable
    questions = []
    all_extracted_sentences = []

    for idx, chunk in enumerate(chunks):
        p_id = f"P{idx + 1}"
        sentences = split_into_sentences(chunk)
        if sentences:
            for s in sentences:
                all_extracted_sentences.append((idx, p_id, s))

    if not all_extracted_sentences:
        for idx, chunk in enumerate(chunks):
            p_id = f"P{idx + 1}"
            all_extracted_sentences.append((idx, p_id, chunk[:150] + "..."))

    shuffled_sentences = list(all_extracted_sentences)
    random.shuffle(shuffled_sentences)

    question_types = allowed_types or ["multiple-choice", "fill-in-the-blank", "short-answer"]
    target_count = max(1, question_count)
    std_generated = 0

    for idx_sent, (chunk_idx, p_id, sentence) in enumerate(shuffled_sentences):
        if std_generated >= target_count:
            break

        q_type = question_types[std_generated % len(question_types)]
        q_id = f"gen-q{std_generated + 1}"

        keywords = extract_keywords(sentence)
        if not keywords:
            words = sentence.split()
            keywords = [words[len(words) // 2].strip(".,!?;:()")] if words else ["context"]

        keyword = keywords[0]

        if q_type == "fill-in-the-blank":
            blanked_text = re.sub(
                rf"\b{re.escape(keyword)}\b", "________", sentence, flags=re.IGNORECASE
            )
            if "________" not in blanked_text:
                continue

            q_text = f"Fill in the blank: {blanked_text}"
            correct_ans = keyword
            explanation = f'Paragraph [{p_id}] states: "{sentence}"'

            questions.append({
                "id": q_id,
                "type": q_type,
                "questionText": q_text,
                "correctAnswer": correct_ans,
                "citation": p_id,
                "explanation": explanation,
                "curriculumAligned": True,
                "outOfBounds": False,
            })
            std_generated += 1

        elif q_type == "multiple-choice":
            blanked_text = re.sub(
                rf"\b{re.escape(keyword)}\b", "________", sentence, flags=re.IGNORECASE
            )
            if "________" not in blanked_text:
                continue

            q_text = f'According to the text, what word best completes the following statement?\n"{blanked_text}"'
            correct_ans = keyword

            other_words = []
            for _, _, s in all_extracted_sentences:
                other_words.extend(extract_keywords(s))
            other_words = list(set([w for w in other_words if w.lower() != keyword.lower()]))

            distractors = ["parameter", "constraint", "algorithm", "evaluation", "framework", "analysis"]
            random.shuffle(other_words)
            random.shuffle(distractors)

            options_pool = []
            for w in other_words:
                if len(options_pool) < 3:
                    options_pool.append(w)
            while len(options_pool) < 3 and distractors:
                d = distractors.pop()
                if d.lower() != keyword.lower() and d not in options_pool:
                    options_pool.append(d)

            options = [correct_ans] + options_pool
            random.shuffle(options)

            explanation = f'Paragraph [{p_id}] states: "{sentence}" which requires the term \'{correct_ans}\'.'

            questions.append({
                "id": q_id,
                "type": q_type,
                "questionText": q_text,
                "options": options,
                "correctAnswer": correct_ans,
                "citation": p_id,
                "explanation": explanation,
                "curriculumAligned": True,
                "outOfBounds": False,
            })
            std_generated += 1

        elif q_type == "short-answer":
            q_text = f"Based on paragraph [{p_id}], what statement is made regarding the concept of '{keyword}'?"
            correct_ans = sentence
            explanation = f'Paragraph [{p_id}] states: "{sentence}"'

            questions.append({
                "id": q_id,
                "type": q_type,
                "questionText": q_text,
                "correctAnswer": correct_ans,
                "citation": p_id,
                "explanation": explanation,
                "curriculumAligned": True,
                "outOfBounds": False,
            })
            std_generated += 1

    return questions
