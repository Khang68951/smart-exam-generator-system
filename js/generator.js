// SEGS Question Generation Engine
import { appState } from './state.js';

// Algorithm to build or generate grounded items
export function buildGroundedExam() {
  const textSource = appState.activeFile ? appState.activeFile.text : appState.pastedText;
  const lines = textSource.split('\n').map(l => l.trim()).filter(l => l.length > 40);
  
  // Fallback to demo paragraphs if source text is too short
  const paragraphsList = lines.length >= 3 ? lines.slice(0, 6).map((text, idx) => ({
    id: `P${idx + 1}`,
    text: text
  })) : [
    { id: "P1", text: textSource || "Standard exam generation document text." }
  ];
  
  const questions = [];
  const formats = [];
  if (appState.questionTypes.mc) formats.push('mc');
  if (appState.questionTypes.fitb) formats.push('fitb');
  if (appState.questionTypes.sa) formats.push('sa');
  
  for (let i = 0; i < appState.questionCount; i++) {
    const pIdx = i % paragraphsList.length;
    const targetParagraph = paragraphsList[pIdx];
    const pText = targetParagraph.text;
    const type = formats[i % formats.length] || 'mc';
    
    // Extract a plausible noun or keyword from the paragraph for the blank/answer
    const words = pText.split(/\s+/).filter(w => w.length > 5 && !w.includes('.') && !w.includes(','));
    const keyword = words[idxMod(i * 3, words.length)] || "concept";
    const cleanedKeyword = keyword.replace(/[^a-zA-Z]/g, '');
    
    let prompt = "";
    let options = [];
    let correct = 0;
    let correctText = cleanedKeyword;
    let explanation = `This question is strictly grounded inside context paragraph [${targetParagraph.id}].`;
    
    if (type === 'mc') {
      prompt = `Based strictly on paragraph [${targetParagraph.id}], which term relates most closely to the concept of "${cleanedKeyword}"?`;
      options = [
        cleanedKeyword,
        capitalize(rotateWord(cleanedKeyword, 1)),
        capitalize(rotateWord(cleanedKeyword, 2)),
        capitalize(rotateWord(cleanedKeyword, 3))
      ];
      // Shuffle options
      correct = Math.floor(Math.random() * 4);
      const temp = options[0];
      options[0] = options[correct];
      options[correct] = temp;
      correctText = options[correct];
    } else if (type === 'fitb') {
      // Find keyword in paragraph and replace it
      const replaceRegex = new RegExp(`\\b${cleanedKeyword}\\b`, 'i');
      if (pText.match(replaceRegex)) {
        prompt = pText.replace(replaceRegex, "_______").substring(0, 180) + "...";
      } else {
        prompt = `Based on the context, complete the following: "The system relies on the core principle of _______."`;
      }
    } else {
      prompt = `Explain how the text describes the core functions of the keyword "${cleanedKeyword}" in paragraph [${targetParagraph.id}].`;
    }
    
    questions.push({
      id: `Q${i+1}`,
      type: type,
      paragraphId: targetParagraph.id,
      prompt: prompt,
      options: options.length > 0 ? options : null,
      correct: type === 'mc' ? correct : correctText,
      explanation: explanation,
      evidence: `Paragraph [${targetParagraph.id}]: "...${pText.substring(0, 80)}..."`
    });
  }
  
  return {
    title: appState.activeFile ? `Exam: ${appState.activeFile.name.split('.')[0]}` : "Interactive Custom Exam",
    paragraphs: paragraphsList,
    questions: questions
  };
}

// Helpers
export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function rotateWord(word, shift) {
  const suffix = ["-oriented", " Factor", " Threshold", " Matrix"];
  return word + (suffix[shift % suffix.length]);
}

export function idxMod(val, mod) {
  return mod > 0 ? (val % mod) : 0;
}
