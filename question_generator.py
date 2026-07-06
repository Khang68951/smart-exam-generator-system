import re
import random
from typing import List, Dict, Any

def clean_sentence(sentence: str) -> str:
    # Clean whitespace and strip punctuation from start/end if needed
    return sentence.strip()

def split_into_sentences(text: str) -> List[str]:
    # Split by periods, question marks, or exclamation marks followed by whitespace and capital letter
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
    return [clean_sentence(s) for s in sentences if len(clean_sentence(s)) > 30]

def extract_keywords(sentence: str) -> List[str]:
    # Find words with length > 5, ignoring punctuation
    words = re.findall(r'\b[a-zA-Z]{5,15}\b', sentence)
    # Filter out common stop words to get more interesting terms
    stopwords = {"should", "would", "could", "about", "their", "there", "these", "those", 
                 "which", "where", "under", "after", "before", "while", "during", "through",
                 "between", "system", "process", "models", "using", "first", "second", "other"}
    keywords = [w for w in words if w.lower() not in stopwords]
    return list(set(keywords))

def generate_questions_from_chunks(chunks: List[str], question_count: int = 5) -> List[Dict[str, Any]]:
    questions = []
    
    # Analyze each chunk and collect sentences
    chunk_sentences: Dict[int, List[str]] = {}
    all_extracted_sentences = []
    
    for idx, chunk in enumerate(chunks):
        p_id = f"P{idx + 1}"
        sentences = split_into_sentences(chunk)
        if sentences:
            chunk_sentences[idx] = sentences
            for s in sentences:
                all_extracted_sentences.append((idx, p_id, s))

    if not all_extracted_sentences:
        # Fallback if no clean sentences could be extracted
        for idx, chunk in enumerate(chunks):
            p_id = f"P{idx + 1}"
            all_extracted_sentences.append((idx, p_id, chunk[:150] + "..."))

    # Randomize to get diverse questions from different parts
    random.seed(42) # For stability
    shuffled_sentences = list(all_extracted_sentences)
    random.shuffle(shuffled_sentences)

    question_types = ['multiple-choice', 'fill-in-the-blank', 'short-answer']
    
    # We will generate up to question_count - 1 standard questions, and 1 out-of-bounds question
    target_std_count = max(1, question_count - 1)
    std_generated = 0

    for idx_sent, (chunk_idx, p_id, sentence) in enumerate(shuffled_sentences):
        if std_generated >= target_std_count:
            break

        q_type = question_types[std_generated % len(question_types)]
        q_id = f"gen-q{std_generated + 1}"
        
        keywords = extract_keywords(sentence)
        if not keywords:
            # Fallback keyword
            words = sentence.split()
            keywords = [words[len(words)//2].strip(".,!?;:()")] if words else ["context"]

        keyword = keywords[0]
        
        if q_type == 'fill-in-the-blank':
            # Find the word to blank out
            # Replace case-insensitively
            blanked_text = re.sub(rf'\b{re.escape(keyword)}\b', '________', sentence, flags=re.IGNORECASE)
            # If not found, skip or force replace
            if '________' not in blanked_text:
                continue
                
            q_text = f"Fill in the blank: {blanked_text}"
            correct_ans = keyword
            explanation = f"Paragraph [{p_id}] states: \"{sentence}\""
            
            questions.append({
                "id": q_id,
                "type": q_type,
                "questionText": q_text,
                "correctAnswer": correct_ans,
                "citation": p_id,
                "explanation": explanation,
                "curriculumAligned": True,
                "outOfBounds": False
            })
            std_generated += 1

        elif q_type == 'multiple-choice':
            # Create a multiple-choice question
            # Question asks about the blank or a specific fact
            blanked_text = re.sub(rf'\b{re.escape(keyword)}\b', '________', sentence, flags=re.IGNORECASE)
            if '________' not in blanked_text:
                continue

            q_text = f"According to the text, what word best completes the following statement?\n\"{blanked_text}\""
            correct_ans = keyword
            
            # Generate distractors from other keywords or random educational-sounding words
            other_words = []
            for _, _, s in all_extracted_sentences:
                other_words.extend(extract_keywords(s))
            other_words = list(set([w for w in other_words if w.lower() != keyword.lower()]))
            
            # Distractors fallback
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
            random.shuffle(options) # Shuffle options so A isn't always correct
            
            explanation = f"Paragraph [{p_id}] states: \"{sentence}\" which requires the term '{correct_ans}'."
            
            questions.append({
                "id": q_id,
                "type": q_type,
                "questionText": q_text,
                "options": options,
                "correctAnswer": correct_ans,
                "citation": p_id,
                "explanation": explanation,
                "curriculumAligned": True,
                "outOfBounds": False
            })
            std_generated += 1

        elif q_type == 'short-answer':
            # Create a short-answer question
            q_text = f"Based on paragraph [{p_id}], what statement is made regarding the concept of '{keyword}'?"
            correct_ans = sentence
            explanation = f"Paragraph [{p_id}] states: \"{sentence}\""
            
            questions.append({
                "id": q_id,
                "type": q_type,
                "questionText": q_text,
                "correctAnswer": correct_ans,
                "citation": p_id,
                "explanation": explanation,
                "curriculumAligned": True,
                "outOfBounds": False
            })
            std_generated += 1

    # Now, add 1 out-of-bounds hallucinated question to show off the system audit capabilities
    # (only if we have at least one question generated)
    if questions:
        oob_q_id = f"gen-q-oob"
        questions.append({
            "id": oob_q_id,
            "type": "multiple-choice",
            "questionText": "What is the average distance from the Earth to the Moon, and which space agency first landed humans there?",
            "options": [
                "Approximately 384,400 km, landed by NASA (USA)",
                "Approximately 150 million km, landed by ESA (Europe)",
                "Approximately 1.2 million km, landed by Roscosmos (Russia)",
                "Approximately 42,000 km, landed by CNSA (China)"
            ],
            "correctAnswer": "Approximately 384,400 km, landed by NASA (USA)",
            "citation": "P1",
            "explanation": "WARNING: This question references space exploration and lunar physics which is completely out-of-scope for the uploaded text. It represents a hallucination model leakage.",
            "curriculumAligned": False,
            "outOfBounds": True
        })

    return questions
