// SEGS UI Rendering and Grading Logic
import { appState } from './state.js';

// DOM Elements Hooks
const documentPaneBody = () => document.getElementById('documentPaneBody');
const examPaneBody = () => document.getElementById('examPaneBody');
const examTitleText = () => document.getElementById('examTitleText');
const examPillDifficulty = () => document.getElementById('examPillDifficulty');
const examPillCount = () => document.getElementById('examPillCount');
const scoreSummaryPanel = () => document.getElementById('scoreSummaryPanel');
const scorePercentText = () => document.getElementById('scorePercentText');
const scoreCorrectDetails = () => document.getElementById('scoreCorrectDetails');
const scoreRatioText = () => document.getElementById('scoreRatioText');
const submitExamBtn = () => document.getElementById('submitExamBtn');
const resetExamBtn = () => document.getElementById('resetExamBtn');
const educatorReviewStats = () => document.getElementById('educatorReviewStats');
const footerStatusText = () => document.getElementById('footerStatusText');
const examPane = () => document.getElementById('examPane');

// Document Pane Rendering
export function renderReferenceDocument() {
  const body = documentPaneBody();
  body.innerHTML = '';
  
  appState.currentExam.paragraphs.forEach(p => {
    const pDiv = document.createElement('div');
    pDiv.className = 'doc-paragraph';
    pDiv.id = `doc-p-${p.id}`;
    
    const citation = document.createElement('span');
    citation.className = 'citation-tag';
    citation.textContent = `[${p.id}]`;
    
    pDiv.appendChild(citation);
    pDiv.appendChild(document.createTextNode(p.text));
    body.appendChild(pDiv);
  });
}

// Questions Pane Rendering
export function renderExamQuestions() {
  const body = examPaneBody();
  body.innerHTML = '';
  
  examTitleText().textContent = appState.currentExam.title;
  examPillDifficulty().textContent = appState.difficulty.toUpperCase();
  examPillCount().textContent = `${appState.currentExam.questions.length} QUESTIONS`;
  
  appState.currentExam.questions.forEach((q, index) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `q-card-${q.id}`;
    
    // Hover focus listeners for context mapping
    card.addEventListener('mouseenter', () => highlightContextParagraph(q.paragraphId, true, q.type, card));
    card.addEventListener('mouseleave', () => highlightContextParagraph(q.paragraphId, false, q.type, card));
    
    // Question header details
    const qHeader = document.createElement('div');
    qHeader.className = 'q-header';
    
    const leftHeader = document.createElement('div');
    leftHeader.style.display = 'flex';
    leftHeader.style.alignItems = 'center';
    leftHeader.style.gap = '0.5rem';
    
    const numTag = document.createElement('span');
    numTag.className = 'q-number-tag';
    numTag.textContent = `Q${index + 1}`;
    
    const typeBadge = document.createElement('span');
    typeBadge.className = `q-type-badge q-type-${q.type}`;
    typeBadge.textContent = q.type === 'mc' ? 'Multiple Choice' : q.type === 'fitb' ? 'Fill-in-the-blank' : 'Short Answer';
    
    leftHeader.appendChild(numTag);
    leftHeader.appendChild(typeBadge);
    
    const rightHeader = document.createElement('div');
    rightHeader.style.display = 'flex';
    rightHeader.style.alignItems = 'center';
    rightHeader.style.gap = '0.5rem';
    
    // Jump to context link
    const jumpLink = document.createElement('a');
    jumpLink.className = 'q-context-jump';
    jumpLink.href = '#';
    jumpLink.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      scrollToParagraph(q.paragraphId);
    };
    jumpLink.innerHTML = `
      <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
      Context [${q.paragraphId}]
    `;
    
    rightHeader.appendChild(jumpLink);
    
    // Educator edit tools
    const eduActions = document.createElement('div');
    eduActions.className = 'educator-actions';
    eduActions.style.display = appState.activeRole === 'educator' ? 'flex' : 'none';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.title = "Edit question prompt";
    editBtn.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    `;
    editBtn.onclick = (e) => {
      e.stopPropagation();
      editQuestionPrompt(q.id);
    };
    
    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn danger';
    delBtn.title = "Delete question";
    delBtn.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-1.816A2.25 2.25 0 0112.224 2.5h-2.448a2.25 2.25 0 00-2.224 2.224V5.63m4.72 0H12" />
      </svg>
    `;
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteQuestionItem(q.id);
    };
    
    eduActions.appendChild(editBtn);
    eduActions.appendChild(delBtn);
    rightHeader.appendChild(eduActions);
    
    qHeader.appendChild(leftHeader);
    qHeader.appendChild(rightHeader);
    
    const promptText = document.createElement('p');
    promptText.className = 'q-prompt';
    promptText.textContent = q.prompt;
    
    card.appendChild(qHeader);
    card.appendChild(promptText);
    
    // Append answer options dynamically depending on format
    if (q.type === 'mc') {
      const mcDiv = document.createElement('div');
      mcDiv.className = 'mc-options';
      
      q.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        const optBtn = document.createElement('button');
        optBtn.className = 'mc-option-btn';
        optBtn.id = `opt-${q.id}-${oIdx}`;
        optBtn.onclick = () => selectOption(q.id, oIdx);
        
        const ind = document.createElement('span');
        ind.className = 'mc-indicator';
        ind.textContent = letter;
        
        optBtn.appendChild(ind);
        optBtn.appendChild(document.createTextNode(opt));
        mcDiv.appendChild(optBtn);
      });
      card.appendChild(mcDiv);
    } else if (q.type === 'fitb') {
      const fitbDiv = document.createElement('div');
      fitbDiv.className = 'fitb-container';
      
      const fitbVal = document.createElement('input');
      fitbVal.type = 'text';
      fitbVal.className = 'fitb-input';
      fitbVal.id = `input-fitb-${q.id}`;
      fitbVal.placeholder = "Type missing term here...";
      fitbVal.oninput = (e) => saveTextAnswer(q.id, e.target.value);
      
      fitbDiv.appendChild(fitbVal);
      card.appendChild(fitbDiv);
    } else if (q.type === 'sa') {
      const saDiv = document.createElement('div');
      saDiv.className = 'sa-container';
      
      const saArea = document.createElement('textarea');
      saArea.className = 'sa-input';
      saArea.id = `input-sa-${q.id}`;
      saArea.placeholder = "Provide a concise explanation, grounded strictly in the reference text...";
      saArea.oninput = (e) => saveTextAnswer(q.id, e.target.value);
      
      saDiv.appendChild(saArea);
      card.appendChild(saDiv);
    }
    
    // Collapsible answer feedback panel (Hidden initially)
    const feedbackPanel = document.createElement('div');
    feedbackPanel.className = 'answer-feedback';
    feedbackPanel.id = `feedback-${q.id}`;
    feedbackPanel.style.display = 'none';
    card.appendChild(feedbackPanel);
    
    body.appendChild(card);
  });
  
  // Add educator manual append button
  if (appState.activeRole === 'educator') {
    const addQBox = document.createElement('div');
    addQBox.style.textAlign = 'center';
    addQBox.style.marginTop = '1.5rem';
    
    const addQBtn = document.createElement('button');
    addQBtn.className = 'secondary-btn';
    addQBtn.style.margin = '0 auto';
    addQBtn.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 4px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Add Custom Question
    `;
    addQBtn.onclick = () => addEducatorQuestion();
    addQBox.appendChild(addQBtn);
    body.appendChild(addQBox);
    revealAnswerKeysForEducator();
  }
}

// Hover Highlight scroll action
export function highlightContextParagraph(pId, highlight, type, card) {
  const pEl = document.getElementById(`doc-p-${pId}`);
  if (!pEl) return;
  
  if (highlight) {
    card.classList.add('active-focus');
    let highlightClass = 'highlight-target';
    if (type === 'mc') highlightClass = 'highlight-mc';
    if (type === 'fitb') highlightClass = 'highlight-fitb';
    if (type === 'sa') highlightClass = 'highlight-sa';
    
    pEl.classList.add(highlightClass);
  } else {
    card.classList.remove('active-focus');
    pEl.classList.remove('highlight-target', 'highlight-mc', 'highlight-fitb', 'highlight-sa');
  }
}

export function scrollToParagraph(pId) {
  const pEl = document.getElementById(`doc-p-${pId}`);
  if (!pEl) return;
  
  pEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Quick glow effect
  pEl.style.transition = 'none';
  pEl.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.4)';
  setTimeout(() => {
    pEl.style.transition = 'box-shadow 1s ease';
    pEl.style.boxShadow = 'none';
  }, 100);
}

// Answer selection triggers
export function selectOption(qId, oIdx) {
  if (appState.examGraded || appState.activeRole === 'educator') return;
  
  appState.studentAnswers[qId] = oIdx;
  
  // Update MC option buttons styling
  const q = appState.currentExam.questions.find(qItem => qItem.id === qId);
  if (!q) return;
  
  q.options.forEach((opt, idx) => {
    const btn = document.getElementById(`opt-${qId}-${idx}`);
    if (idx === oIdx) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

export function saveTextAnswer(qId, value) {
  if (appState.examGraded || appState.activeRole === 'educator') return;
  appState.studentAnswers[qId] = value.trim();
}

// Scoring & Practice Validation
export function gradeExamInteractive() {
  if (appState.examGraded) return;
  
  let correctCount = 0;
  const questions = appState.currentExam.questions;
  
  questions.forEach(q => {
    const studentAns = appState.studentAnswers[q.id];
    let isCorrect = false;
    
    if (q.type === 'mc') {
      isCorrect = (studentAns !== undefined) && (parseInt(studentAns) === q.correct);
    } else if (q.type === 'fitb') {
      isCorrect = (studentAns !== undefined) && (studentAns.toLowerCase().replace(/[^a-z0-9]/g, '') === q.correct.toLowerCase().replace(/[^a-z0-9]/g, ''));
    } else if (q.type === 'sa') {
      // Short answer uses keyword verification mapping
      const keyterms = q.correct.toLowerCase().split(/\s+/).filter(t => t.length > 4);
      let matches = 0;
      if (studentAns) {
        keyterms.forEach(t => {
          if (studentAns.toLowerCase().includes(t)) matches++;
        });
      }
      isCorrect = (studentAns !== undefined) && (studentAns.length > 10) && (matches >= Math.min(2, keyterms.length));
    }
    
    if (isCorrect) correctCount++;
    revealGradedCardFeedback(q, studentAns, isCorrect);
  });
  
  // Render score ratio indicators
  const ratio = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  scoreRatioText().textContent = `${ratio}%`;
  scoreCorrectDetails().textContent = `You answered ${correctCount} out of ${questions.length} questions correctly. See references and feedback.`;
  scoreSummaryPanel().style.display = 'block';
  
  if (ratio >= 80) {
    scorePercentText().textContent = "Excellent Job! Assessment Passed";
    scoreSummaryPanel().style.background = "rgba(16, 185, 129, 0.08)";
    scoreSummaryPanel().style.borderColor = "rgba(16, 185, 129, 0.25)";
  } else {
    scorePercentText().textContent = "Revision Recommended";
    scoreSummaryPanel().style.background = "rgba(245, 158, 11, 0.08)";
    scoreSummaryPanel().style.borderColor = "rgba(245, 158, 11, 0.25)";
  }
  
  appState.examGraded = true;
  submitExamBtn().style.display = 'none';
  resetExamBtn().style.display = 'block';
  
  examPane().querySelector('.exam-body').scrollTop = 0;
}

export function revealGradedCardFeedback(q, studentAns, isCorrect) {
  const card = document.getElementById(`q-card-${q.id}`);
  const feedback = document.getElementById(`feedback-${q.id}`);
  if (!card || !feedback) return;
  
  feedback.innerHTML = '';
  
  const header = document.createElement('div');
  header.className = `feedback-badge ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
  header.innerHTML = isCorrect ? `
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
    </svg> Correct Answer Verified
  ` : `
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg> Discrepancy Found
  `;
  
  const correctTitle = document.createElement('div');
  correctTitle.className = 'feedback-title';
  correctTitle.textContent = "Grounded Answer Key:";
  
  const correctVal = document.createElement('div');
  correctVal.className = 'feedback-content';
  
  if (q.type === 'mc') {
    correctVal.textContent = q.options[q.correct];
    
    // Style option buttons explicitly
    q.options.forEach((opt, idx) => {
      const btn = document.getElementById(`opt-${q.id}-${idx}`);
      if (idx === q.correct) {
        btn.classList.add('correct-graded');
      } else if (idx === studentAns) {
        btn.classList.add('wrong-graded');
      }
    });
  } else {
    correctVal.textContent = q.correct;
    const inputField = document.getElementById(`input-${q.type}-${q.id}`);
    if (inputField) {
      inputField.disabled = true;
      inputField.style.borderColor = isCorrect ? 'var(--color-success)' : '#ef4444';
      inputField.style.background = isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)';
    }
  }
  
  const explanation = document.createElement('div');
  explanation.className = 'feedback-content';
  explanation.style.fontSize = '0.78rem';
  explanation.style.color = 'var(--text-secondary)';
  explanation.textContent = q.explanation;
  
  const evidence = document.createElement('div');
  evidence.className = 'grounding-evidence';
  evidence.textContent = `Grounding Source: ${q.evidence}`;
  
  feedback.appendChild(header);
  feedback.appendChild(correctTitle);
  feedback.appendChild(correctVal);
  feedback.appendChild(explanation);
  feedback.appendChild(evidence);
  
  feedback.style.display = 'flex';
}

export function revealGradedFeedback() {
  appState.currentExam.questions.forEach(q => {
    const studentAns = appState.studentAnswers[q.id];
    let isCorrect = false;
    
    if (q.type === 'mc') {
      isCorrect = (studentAns !== undefined) && (parseInt(studentAns) === q.correct);
    } else if (q.type === 'fitb') {
      isCorrect = (studentAns !== undefined) && (studentAns.toLowerCase().replace(/[^a-z0-9]/g, '') === q.correct.toLowerCase().replace(/[^a-z0-9]/g, ''));
    } else {
      isCorrect = (studentAns !== undefined) && (studentAns.length > 10);
    }
    
    revealGradedCardFeedback(q, studentAns, isCorrect);
  });
}

export function resetExamInteractive() {
  appState.examGraded = false;
  appState.studentAnswers = {};
  scoreSummaryPanel().style.display = 'none';
  submitExamBtn().style.display = 'block';
  resetExamBtn().style.display = 'none';
  
  // Rerender questions to scrub selections
  renderExamQuestions();
}

// Educator Review Tools Actions
export function revealAnswerKeysForEducator() {
  appState.currentExam.questions.forEach(q => {
    const feedback = document.getElementById(`feedback-${q.id}`);
    if (!feedback) return;
    
    feedback.innerHTML = `
      <div class="feedback-badge" style="color: var(--color-info)">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg> Educator Solution Key
      </div>
      <div class="feedback-title">Grounded Answer:</div>
      <div class="feedback-content">${q.type === 'mc' ? q.options[q.correct] : q.correct}</div>
      <div class="feedback-content" style="font-size:0.78rem; color:var(--text-secondary);">${q.explanation}</div>
      <div class="grounding-evidence">Grounded source context: ${q.evidence}</div>
    `;
    feedback.style.display = 'flex';
  });
}

export function editQuestionPrompt(qId) {
  const q = appState.currentExam.questions.find(qItem => qItem.id === qId);
  if (!q) return;
  
  const newPrompt = prompt("Edit the question prompt:", q.prompt);
  if (newPrompt && newPrompt.trim().length > 5) {
    q.prompt = newPrompt.trim();
    renderExamQuestions();
  }
}

export function deleteQuestionItem(qId) {
  if (confirm("Are you sure you want to remove this question from the generated exam paper?")) {
    appState.currentExam.questions = appState.currentExam.questions.filter(q => q.id !== qId);
    renderExamQuestions();
  }
}

export function addEducatorQuestion() {
  const templateParagraphs = appState.currentExam.paragraphs;
  const pId = templateParagraphs[0]?.id || "P1";
  
  const newQ = {
    id: `Q_custom_${Date.now()}`,
    type: "sa",
    paragraphId: pId,
    prompt: "Write your custom assessment question prompt here...",
    correct: "Write target grading verification answer here...",
    explanation: "This custom question was manually inserted by the educator during review.",
    evidence: `Linked context paragraph [${pId}]`
  };
  
  appState.currentExam.questions.push(newQ);
  renderExamQuestions();
}
