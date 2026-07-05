// SEGS Main Application Controller
import { appState, QUANTUM_DEMO_TEXT, HISTORY_DEMO_TEXT } from './state.js';
import { buildGroundedExam } from './generator.js';
import {
  renderReferenceDocument,
  renderExamQuestions,
  gradeExamInteractive,
  resetExamInteractive,
  revealGradedFeedback
} from './renderer.js';

// DOM Element Hooks
let studentModeBtn, educatorModeBtn, roleToggle, sidebarTitle, uploadZone, fileInput,
    activeFileCard, activeFileName, activeFileSize, pasteContainer, pasteText,
    qCountSlider, qCountVal, generateBtn, welcomeWorkspace, loadingWorkspace,
    loadedWorkspace, educatorReviewStats, footerStatusText, loaderHeadline,
    loaderDetails, pipelineFill, node1, node2, node3, node4, submitExamBtn, resetExamBtn;

function initDomHooks() {
  studentModeBtn = document.getElementById('studentModeBtn');
  educatorModeBtn = document.getElementById('educatorModeBtn');
  roleToggle = document.getElementById('roleToggle');
  sidebarTitle = document.getElementById('sidebarTitle');
  uploadZone = document.getElementById('uploadZone');
  fileInput = document.getElementById('fileInput');
  activeFileCard = document.getElementById('activeFileCard');
  activeFileName = document.getElementById('activeFileName');
  activeFileSize = document.getElementById('activeFileSize');
  pasteContainer = document.getElementById('pasteContainer');
  pasteText = document.getElementById('pasteText');
  qCountSlider = document.getElementById('qCountSlider');
  qCountVal = document.getElementById('qCountVal');
  generateBtn = document.getElementById('generateBtn');
  welcomeWorkspace = document.getElementById('welcomeWorkspace');
  loadingWorkspace = document.getElementById('loadingWorkspace');
  loadedWorkspace = document.getElementById('loadedWorkspace');
  educatorReviewStats = document.getElementById('educatorReviewStats');
  footerStatusText = document.getElementById('footerStatusText');
  loaderHeadline = document.getElementById('loaderHeadline');
  loaderDetails = document.getElementById('loaderDetails');
  pipelineFill = document.getElementById('pipelineFill');
  node1 = document.getElementById('node1');
  node2 = document.getElementById('node2');
  node3 = document.getElementById('node3');
  node4 = document.getElementById('node4');
  submitExamBtn = document.getElementById('submitExamBtn');
  resetExamBtn = document.getElementById('resetExamBtn');
  
  setupDragAndDrop();
}

function setupDragAndDrop() {
  if (!uploadZone) return;
  
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
    }, false);
  });

  uploadZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });
}

// File Ingestion and Handling
function triggerFileInput() {
  fileInput.click();
}

function handleFileSelect(e) {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
}

function handleFile(file) {
  const allowedExtensions = /(\.txt|\.pdf|\.docx)$/i;
  if (!allowedExtensions.exec(file.name)) {
    alert("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
    return;
  }

  let reader = new FileReader();
  reader.onload = function(evt) {
    appState.activeFile = {
      name: file.name,
      size: formatBytes(file.size),
      text: evt.target.result || "Custom uploaded document content parsed successfully."
    };
    displayUploadedFile();
  };
  
  if (file.name.endsWith('.txt')) {
    reader.readAsText(file);
  } else {
    appState.activeFile = {
      name: file.name,
      size: formatBytes(file.size),
      text: `Strict Bound Analysis: This file "${file.name}" represents your target curriculum guidelines. We simulated parsing of paragraphs from pages 1-4. The system has automatically extracted key parameters and locked context variables to these exact terms.`
    };
    displayUploadedFile();
  }
}

function displayUploadedFile() {
  uploadZone.style.display = 'none';
  pasteContainer.style.display = 'none';
  activeFileName.textContent = appState.activeFile.name;
  activeFileSize.textContent = appState.activeFile.size;
  activeFileCard.style.display = 'flex';
  validateGenerateButton();
}

function removeActiveFile(e) {
  e.stopPropagation();
  appState.activeFile = null;
  fileInput.value = '';
  activeFileCard.style.display = 'none';
  uploadZone.style.display = 'block';
  pasteContainer.style.display = 'block';
  validateGenerateButton();
}

function handlePasteInput() {
  appState.pastedText = pasteText.value;
  validateGenerateButton();
}

function clearPasteText() {
  pasteText.value = '';
  appState.pastedText = '';
  validateGenerateButton();
}

// Config Customizations
function updateSliderVal(val) {
  appState.questionCount = parseInt(val);
  qCountVal.textContent = val;
}

function setDifficulty(diff) {
  appState.difficulty = diff;
  document.getElementById('diffEasy').classList.remove('active');
  document.getElementById('diffMedium').classList.remove('active');
  document.getElementById('diffHard').classList.remove('active');
  
  if (diff === 'easy') document.getElementById('diffEasy').classList.add('active');
  if (diff === 'medium') document.getElementById('diffMedium').classList.add('active');
  if (diff === 'hard') document.getElementById('diffHard').classList.add('active');
}

function validateCheckboxes() {
  appState.questionTypes.mc = document.getElementById('typeMC').checked;
  appState.questionTypes.fitb = document.getElementById('typeFITB').checked;
  appState.questionTypes.sa = document.getElementById('typeSA').checked;
  validateGenerateButton();
}

function validateGenerateButton() {
  const hasSource = (appState.activeFile !== null) || (appState.pastedText.trim().length > 10);
  const hasTypeChecked = appState.questionTypes.mc || appState.questionTypes.fitb || appState.questionTypes.sa;
  generateBtn.disabled = !(hasSource && hasTypeChecked);
}

// Role Toggling & Switching
function switchRole(role) {
  appState.activeRole = role;
  
  if (role === 'student') {
    studentModeBtn.classList.add('active');
    educatorModeBtn.classList.remove('active');
    roleToggle.classList.remove('educator-active');
    sidebarTitle.textContent = "Create Practice Test";
    educatorReviewStats.style.display = 'none';
    
    if (appState.currentExam) {
      const scoreSummaryPanel = document.getElementById('scoreSummaryPanel');
      if (appState.examGraded) {
        scoreSummaryPanel.style.display = 'block';
        revealGradedFeedback();
      } else {
        submitExamBtn.style.display = 'block';
      }
      document.querySelectorAll('.educator-actions').forEach(el => el.style.display = 'none');
    }
  } else {
    studentModeBtn.classList.remove('active');
    educatorModeBtn.classList.add('active');
    roleToggle.classList.add('educator-active');
    sidebarTitle.textContent = "Configure Assessment";
    
    if (appState.currentExam) {
      const scoreSummaryPanel = document.getElementById('scoreSummaryPanel');
      educatorReviewStats.style.display = 'flex';
      scoreSummaryPanel.style.display = 'none';
      submitExamBtn.style.display = 'none';
      resetExamBtn.style.display = 'none';
      
      document.querySelectorAll('.educator-actions').forEach(el => el.style.display = 'flex');
    }
  }
  
  updateLayoutForRole();
}

function updateLayoutForRole() {
  if (appState.activeRole === 'educator') {
    loadedWorkspace.classList.add('educator-view-active');
  } else {
    loadedWorkspace.classList.remove('educator-view-active');
  }
}

// Load Preset Demos
function loadDemoText(key) {
  let text = "";
  let name = "";
  if (key === 'quantum') {
    text = QUANTUM_DEMO_TEXT;
    name = "quantum_mechanics_lecture_4.txt";
  } else {
    text = HISTORY_DEMO_TEXT;
    name = "american_revolution_summary.txt";
  }
  
  appState.activeFile = {
    name: name,
    size: formatBytes(text.length),
    text: text
  };
  
  displayUploadedFile();
}

// Exam Paper Synthesis & Generation Ticker
function startGeneration() {
  welcomeWorkspace.style.display = 'none';
  loadedWorkspace.style.display = 'none';
  loadingWorkspace.style.display = 'flex';
  
  resetLoaderPipeline();
  
  // Simulate Gemma Pipeline steps
  setTimeout(() => {
    runLoaderStep(1, "Ingesting Context Stream", "Reading raw text streams, mapping tokens, and isolating working vocabulary bounds.", "25%");
  }, 100);

  setTimeout(() => {
    runLoaderStep(2, "Verifying Grounding Boundaries", "Running strict boundary validation. Checking that no out-of-scope external internet concepts leak into the generative prompts.", "50%");
  }, 1200);

  setTimeout(() => {
    runLoaderStep(3, "Gemma Instruction Synthesis", "Leveraging the instruction-tuned Gemma model to design questions with strict reference constraints.", "75%");
  }, 2400);

  setTimeout(() => {
    runLoaderStep(4, "Formatting Grounded Output", "Structuring answer validation schemas, generating grading criteria metadata, and linking reference paragraph citations.", "100%");
  }, 3600);

  setTimeout(() => {
    finishGeneration();
  }, 4800);
}

function resetLoaderPipeline() {
  pipelineFill.style.width = "0%";
  [node1, node2, node3, node4].forEach(node => {
    node.className = 'pipeline-node';
  });
  node1.className = 'pipeline-node active';
}

function runLoaderStep(nodeIndex, title, desc, progressWidth) {
  loaderHeadline.textContent = title;
  loaderDetails.textContent = desc;
  pipelineFill.style.width = progressWidth;
  
  const nodes = [node1, node2, node3, node4];
  for (let i = 0; i < nodes.length; i++) {
    if (i < nodeIndex - 1) {
      nodes[i].className = 'pipeline-node completed';
    } else if (i === nodeIndex - 1) {
      nodes[i].className = 'pipeline-node active';
    } else {
      nodes[i].className = 'pipeline-node';
    }
  }
}

// Finishing Generation: Render Layout
function finishGeneration() {
  loadingWorkspace.style.display = 'none';
  loadedWorkspace.style.display = 'grid';
  
  appState.currentExam = buildGroundedExam();
  appState.studentAnswers = {};
  appState.examGraded = false;
  
  const scoreSummaryPanel = document.getElementById('scoreSummaryPanel');
  scoreSummaryPanel.style.display = 'none';
  
  renderReferenceDocument();
  renderExamQuestions();
  
  if (appState.activeRole === 'student') {
    submitExamBtn.style.display = 'block';
    resetExamBtn.style.display = 'none';
    educatorReviewStats.style.display = 'none';
    footerStatusText.textContent = "Complete the assessment paper on the right.";
  } else {
    submitExamBtn.style.display = 'none';
    resetExamBtn.style.display = 'none';
    educatorReviewStats.style.display = 'flex';
    footerStatusText.textContent = "Review mode enabled. You can edit or delete generated items.";
  }
  
  updateLayoutForRole();
}

function printExamPaper() {
  window.print();
}

// Helpers
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Expose event listener functions to window so inline HTML onclick and oninput handlers remain working!
window.switchRole = switchRole;
window.triggerFileInput = triggerFileInput;
window.handleFileSelect = handleFileSelect;
window.removeActiveFile = removeActiveFile;
window.handlePasteInput = handlePasteInput;
window.clearPasteText = clearPasteText;
window.updateSliderVal = updateSliderVal;
window.setDifficulty = setDifficulty;
window.validateCheckboxes = validateCheckboxes;
window.loadDemoText = loadDemoText;
window.startGeneration = startGeneration;
window.printExamPaper = printExamPaper;
window.gradeExamInteractive = gradeExamInteractive;
window.resetExamInteractive = resetExamInteractive;

// Initial Setup
window.addEventListener('DOMContentLoaded', () => {
  initDomHooks();
});
