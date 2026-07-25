"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  UploadCloud,
  FileText,
  Settings,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Lock,
  Edit3,
  Trash2,
  Eye,
  BookOpen,
  Download,
  Sparkles,
  RefreshCw,
  Play,
  Check,
  HelpCircle,
  FileCode,
  FileCheck,
  User,
  GraduationCap
} from "lucide-react";
import { mockDocuments } from "./mockData";
import { Question, SourceParagraph, MockDocument, ExamConfig, AppState, WorkspaceRole, QuizStatus } from "./types";

export default function Home() {
  // App States
  const [appState, setAppState] = useState<AppState>("upload");
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [customFile, setCustomFile] = useState<{ name: string; size: string } | null>(null);
  const [customFileObject, setCustomFileObject] = useState<File | null>(null);

  // Configuration State
  const [config, setConfig] = useState<ExamConfig>({
    questionCount: 5,
    difficulty: "medium",
    strictness: "absolute-grounded",
    types: {
      multipleChoice: true,
      shortAnswer: true,
      fillInTheBlank: true,
    }
  });

  // Analyzing State Simulation
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [analysisStep, setAnalysisStep] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Workspace State
  const [activeRole, setActiveRole] = useState<WorkspaceRole>("student");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // Student State
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("idle");
  const [studentScore, setStudentScore] = useState<number>(0);

  // Educator State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Question | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // --- Mock Analysis Steps ---
  const analysisSteps = [
    { title: "Ingesting Document Tokens", desc: "Parsing file bytes and extracting raw UTF-8 text structure." },
    { title: "Indexing Context Boundaries", desc: "Hashing paragraphs and locking attention vector spaces." },
    { title: "Generation Audit Constraints", desc: "Setting temperature coordinates to 0.0 and locking token probability weights." },
    { title: "Strict Fact Bounding Checks", desc: "Auditing knowledge grounding queries to eliminate hallucination vectors." },
    { title: "Formatting Assessment Paper", desc: "Compiling multiple-choice, fill-in-the-blanks, and answer keys." }
  ];

  // --- Handlers & Actions ---
  const handleSelectMockDoc = (docId: string) => {
    const doc = mockDocuments.find(d => d.id === docId);
    if (doc) {
      setSelectedDoc(doc);
      setQuestions(JSON.parse(JSON.stringify(doc.questions))); // Deep clone
      setAppState("config");
    }
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile({ name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB` });
      setCustomFileObject(file);
      // Build a placeholder document based on the uploaded file name
      const placeholderDoc: MockDocument = {
        id: "custom-doc",
        title: file.name.replace(/\.[^/.]+$/, ""),
        description: `Custom uploaded file to be analyzed by the FastAPI backend.`,
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        paragraphs: [],
        questions: []
      };
      setSelectedDoc(placeholderDoc);
      setAppState("config");
    }
  };

  const handleStartAnalysis = async () => {
    setAppState("analyzing");
    setAnalysisProgress(0);
    setAnalysisStep(0);

    if (selectedDoc?.id === "custom-doc" && customFileObject) {
      setAnalysisLogs([
        "[SYSTEM] Contacting FastAPI backend at http://localhost:8000...",
        `[SYSTEM] Source: ${customFileObject.name} (${(customFileObject.size / 1024).toFixed(1)} KB)`,
        "[SYSTEM] Uploading file bytes to backend..."
      ]);

      // Slowly increment progress to 90% while waiting for API response
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev < 90) return prev + 5;
          return prev;
        });
      }, 150);

      try {
        const formData = new FormData();
        formData.append("file", customFileObject);

        const response = await fetch(`http://localhost:8000/upload-document/?question_count=${config.questionCount}`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Server returned error status: ${response.status}`);
        }

        const data = await response.json();

        clearInterval(progressInterval);
        setAnalysisProgress(100);
        setAnalysisStep(analysisSteps.length - 1);
        setAnalysisLogs((prev) => [
          ...prev,
          "[OK] Bytes received and parsed.",
          `[SYSTEM] Parsed ${data.total_characters} characters, split into ${data.total_chunks_created} chunks.`,
          `[SYSTEM] Generated ${data.questions.length} questions from context.`,
          "[SYSTEM] Running strict grounding validation...",
          "[OK] Analysis complete! Loading workspace..."
        ]);

        // Construct the custom MockDocument with backend data
        const updatedDoc: MockDocument = {
          id: "custom-doc",
          title: customFileObject.name.replace(/\.[^/.]+$/, ""),
          description: `Custom file processed dynamically by SEGS backend.`,
          fileName: customFileObject.name,
          fileSize: `${(customFileObject.size / 1024 / 1024).toFixed(2)} MB`,
          paragraphs: data.chunks.map((text: string, idx: number) => ({
            id: `P${idx + 1}`,
            text: text
          })),
          questions: data.questions
        };

        setTimeout(() => {
          setSelectedDoc(updatedDoc);

          // Apply client-side filters
          let filtered = [...updatedDoc.questions];
          filtered = filtered.filter(q => {
            if (q.type === "multiple-choice" && !config.types.multipleChoice) return false;
            if (q.type === "short-answer" && !config.types.shortAnswer) return false;
            if (q.type === "fill-in-the-blank" && !config.types.fillInTheBlank) return false;
            return true;
          });

          setQuestions(filtered);
          setAppState("workspace");
          setQuizStatus("taking");
          setStudentAnswers({});
        }, 1500);

      } catch (err: any) {
        clearInterval(progressInterval);
        setAnalysisLogs((prev) => [
          ...prev,
          `[ERROR] Failed to connect to FastAPI backend: ${err.message}`,
          "[SYSTEM] Please check if the FastAPI backend is running on http://localhost:8000"
        ]);
        setTimeout(() => {
          alert(`Connection Error: ${err.message}. Make sure backend is running.`);
          setAppState("config");
        }, 3000);
      }
    } else {
      // Default simulated flow for preset mock documents
      setAnalysisLogs([
        "[SYSTEM] Initializing Gemma 2B Grounded Execution Environment...",
        `[SYSTEM] Source: ${selectedDoc?.fileName || "default_document"}`,
        `[SYSTEM] Scope Constraints: Restricted to ${selectedDoc?.paragraphs.length} paragraphs.`
      ]);

      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          const next = prev + 4;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (selectedDoc) {
                let filtered = [...selectedDoc.questions];
                filtered = filtered.filter(q => {
                  if (q.type === "multiple-choice" && !config.types.multipleChoice) return false;
                  if (q.type === "short-answer" && !config.types.shortAnswer) return false;
                  if (q.type === "fill-in-the-blank" && !config.types.fillInTheBlank) return false;
                  return true;
                });
                const count = Math.min(config.questionCount, filtered.length);
                setQuestions(filtered.slice(0, count));
              }
              setAppState("workspace");
              setQuizStatus("taking");
              setStudentAnswers({});
            }, 600);
            return 100;
          }
          return next;
        });
      }, 120);
    }
  };

  // Simulation of Grounded AI generation (skip if custom-doc)
  useEffect(() => {
    if (appState !== "analyzing") return;
    if (selectedDoc?.id === "custom-doc") return;

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const next = prev + 4;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (selectedDoc) {
              let filtered = [...selectedDoc.questions];
              filtered = filtered.filter(q => {
                if (q.type === "multiple-choice" && !config.types.multipleChoice) return false;
                if (q.type === "short-answer" && !config.types.shortAnswer) return false;
                if (q.type === "fill-in-the-blank" && !config.types.fillInTheBlank) return false;
                return true;
              });

              const count = Math.min(config.questionCount, filtered.length);
              setQuestions(filtered.slice(0, count));
            }
            setAppState("workspace");
            setQuizStatus("taking");
            setStudentAnswers({});
          }, 600);
          return 100;
        }
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [appState, selectedDoc, config]);

  // Handle updates to step indicator and log generation (skip if custom-doc)
  useEffect(() => {
    if (appState !== "analyzing") return;
    if (selectedDoc?.id === "custom-doc") return;

    const stepIndex = Math.min(
      Math.floor((analysisProgress / 100) * analysisSteps.length),
      analysisSteps.length - 1
    );
    setAnalysisStep(stepIndex);

    const stepLogs = [
      `[OK] File ingestion complete. Total tokens parsed: ${512 + stepIndex * 240}`,
      `[INFO] Created local hashes for paragraph vectors [P1] to [P${selectedDoc?.paragraphs.length}].`,
      `[AUDIT] Temperature set to 0.00. Sampling overrides locked. Creativity parameter: DISABLED.`,
      `[BOUNDS CHECK] Auditing generated outputs. Verified 0 external entity leaks.`,
      `[SYSTEM] Formatting output schemas. Compiling correct answers and citation offsets.`
    ];

    if (analysisProgress > 0 && analysisProgress % 20 === 0) {
      const idx = Math.floor(analysisProgress / 20) - 1;
      if (stepLogs[idx]) {
        setAnalysisLogs((prev) => [...prev, stepLogs[idx]]);
      }
    }
  }, [analysisProgress, appState]);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [analysisLogs]);

  // --- Scroll & Highlight Citation ---
  const handleScrollToCitation = (citationId: string) => {
    setActiveParagraphId(citationId);

    // Find the paragraph element inside the scrollable left panel
    const element = document.getElementById(`doc-para-${citationId}`);
    if (element && leftPanelRef.current) {
      const panel = leftPanelRef.current;
      const scrollTop = element.offsetTop - panel.offsetTop - 16;
      panel.scrollTo({
        top: scrollTop,
        behavior: "smooth"
      });
    }
  };

  // --- Student Quiz Actions ---
  const handleStudentAnswerChange = (qId: string, value: string) => {
    setStudentAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    questions.forEach((q) => {
      const studentAns = (studentAnswers[q.id] || "").trim().toLowerCase();
      const correctAns = q.correctAnswer.trim().toLowerCase();

      if (q.type === "multiple-choice") {
        if (studentAns === correctAns) score++;
      } else if (q.type === "fill-in-the-blank") {
        if (studentAns === correctAns) score++;
      } else {
        // Short answer simple heuristic match
        const keywords = correctAns.split(" ");
        const matched = keywords.filter(word => word.length > 3 && studentAns.includes(word));
        if (matched.length >= Math.min(2, 10)) {
          score++;
        }
      }
    });

    setStudentScore(score);
    setQuizStatus("submitted");
  };

  // --- Educator Operations ---
  const handleStartEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditForm({ ...q });
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === editForm.id ? { ...editForm } : q))
    );
    setEditingQuestionId(null);
    setEditForm(null);
  };

  const handlePruneOutOfBounds = () => {
    setQuestions((prev) => prev.filter((q) => !q.outOfBounds));
  };

  const handleExport = (format: "json" | "markdown") => {
    const exportData = {
      documentTitle: selectedDoc?.title,
      fileName: selectedDoc?.fileName,
      generatedQuestions: questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.questionText,
        options: q.options || null,
        answer: q.correctAnswer,
        citation: `[P${q.citation}]`,
        explanation: q.explanation,
        compliant: !q.outOfBounds
      }))
    };

    let fileContent = "";
    let fileType = "application/json";
    let extension = "json";

    if (format === "json") {
      fileContent = JSON.stringify(exportData, null, 2);
    } else {
      fileType = "text/markdown";
      extension = "md";
      fileContent = `# EXAM PAPER: ${exportData.documentTitle}\nSource Document: ${exportData.fileName}\n\n`;
      questions.forEach((q, idx) => {
        fileContent += `## Question ${idx + 1} (${q.type})\n${q.questionText}\n\n`;
        if (q.options) {
          q.options.forEach((opt, oIdx) => {
            fileContent += `${String.fromCharCode(65 + oIdx)}. ${opt}\n`;
          });
          fileContent += `\n`;
        }
        fileContent += `* **Answer**: ${q.correctAnswer}\n`;
        fileContent += `* **Citation**: [${q.citation}]\n`;
        fileContent += `* **Explanation**: ${q.explanation}\n\n`;
        fileContent += `---\n\n`;
      });
    }

    // Trigger dummy download
    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `segs_generated_exam_${selectedDoc?.id || "export"}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(format.toUpperCase());
    setTimeout(() => setExportSuccess(null), 3000);
  };

  // Helper stats for Educator Dashboard
  const stats = useMemo(() => {
    const total = questions.length;
    const compliant = questions.filter(q => !q.outOfBounds).length;
    const hallucinations = total - compliant;
    const alignmentRate = total > 0 ? Math.round((compliant / total) * 100) : 100;

    return { total, compliant, hallucinations, alignmentRate };
  }, [questions]);

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-[#f3f4f6] antialiased">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-gray-900/60 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-600/20 animate-pulse-slow">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display text-lg font-bold tracking-tight text-white">SEGS</h1>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/40 rounded px-1.5 py-0.5 font-mono uppercase">Grounded AI</span>
            </div>
            <p className="text-xs text-text-muted">Strict Context-Bounding Exam Generator</p>
          </div>
        </div>

        {appState === "workspace" && (
          <div className="flex items-center space-x-4">
            {/* Role Switcher */}
            <div className="bg-gray-950/80 p-0.5 border border-white/5 rounded-lg flex">
              <button
                onClick={() => { setActiveRole("student"); setEditingQuestionId(null); }}
                className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all active:scale-98 ${activeRole === "student"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Student View</span>
              </button>
              <button
                onClick={() => setActiveRole("educator")}
                className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all active:scale-98 ${activeRole === "educator"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Educator Audit</span>
              </button>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setAppState("upload")}
              className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-white/10 text-text-secondary hover:bg-white/5 transition-all active:scale-98"
            >
              Upload New File
            </button>
          </div>
        )}
      </header>

      {/* VIEW STATES */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 max-w-7xl w-full mx-auto">

        {/* STATE 1: UPLOAD & SOURCE SELECT */}
        {appState === "upload" && (
          <div className="w-full max-w-4xl space-y-8 py-8">
            <div className="text-center space-y-3">
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-white">
                Eliminate Hallucinations in Assessments
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto text-sm leading-relaxed">
                Upload your course outlines, textbooks, or lecture transcripts. SEGS confines the generation model
                strictly to uploaded paragraphs, mapping every generated option to verifiable source citation hashes.
              </p>
            </div>

            {/* File Upload Area */}
            <div className="border border-dashed border-white/10 bg-gray-900/40 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors relative group">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleCustomFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-gray-950/80 border border-white/5 rounded-xl transition-transform group-hover:scale-105">
                  <UploadCloud className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Drag & drop your files here, or click to browse</p>
                  <p className="text-xs text-text-muted mt-1">Supports PDF, DOCX, or TXT (Max 15MB)</p>
                </div>
              </div>
            </div>

            {/* Mock/Preset Documents selector */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold tracking-wide text-indigo-300 uppercase">
                  Or select a curriculum sample file
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectMockDoc(doc.id)}
                    className="border border-white/5 bg-[#111827]/70 rounded-xl p-5 hover:border-indigo-500/30 hover:bg-gray-900/50 transition-all cursor-pointer flex flex-col justify-between group active:scale-98"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-text-muted uppercase">{doc.fileSize}</span>
                        <span className="text-xs font-mono text-indigo-400 font-medium">{doc.fileName}</span>
                      </div>
                      <h4 className="font-display font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {doc.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-text-muted font-mono uppercase">
                        {doc.paragraphs.length} Paragraph Contexts
                      </span>
                      <div className="flex items-center text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                        <span>Load Sample</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STATE 2: EXAM CONFIGURATION */}
        {appState === "config" && selectedDoc && (
          <div className="w-full max-w-2xl space-y-8 py-8">
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-indigo-950 border border-indigo-800/40 rounded-lg text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-white">Configure Assessment Output</h2>
                <p className="text-xs text-text-muted mt-0.5">Bound: {selectedDoc.title} ({selectedDoc.fileName})</p>
              </div>
            </div>

            <div className="border border-white/5 bg-[#111827]/70 rounded-xl p-6 space-y-6">

              {/* Question Count Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Number of Questions</label>
                  <span className="text-xs font-mono text-indigo-400 font-bold bg-indigo-950/60 border border-indigo-900/50 rounded-md px-2 py-0.5">
                    {config.questionCount} Questions
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max={selectedDoc.questions.length}
                  value={config.questionCount}
                  onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-mono">
                  <span>2 Min</span>
                  <span>{selectedDoc.questions.length} Max</span>
                </div>
              </div>

              {/* Question Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white block">Question Formats</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`flex items-center justify-between border rounded-xl p-3.5 cursor-pointer transition-all active:scale-98 ${config.types.multipleChoice
                    ? "border-indigo-500/50 bg-indigo-950/20 text-white"
                    : "border-white/5 bg-gray-950/40 text-text-secondary hover:border-white/10"
                    }`}>
                    <span className="text-xs font-medium">Multiple Choice</span>
                    <input
                      type="checkbox"
                      checked={config.types.multipleChoice}
                      onChange={(e) => setConfig({
                        ...config,
                        types: { ...config.types, multipleChoice: e.target.checked }
                      })}
                      className="rounded border-gray-800 text-indigo-600 focus:ring-indigo-600 bg-gray-900"
                    />
                  </label>

                  <label className={`flex items-center justify-between border rounded-xl p-3.5 cursor-pointer transition-all active:scale-98 ${config.types.fillInTheBlank
                    ? "border-indigo-500/50 bg-indigo-950/20 text-white"
                    : "border-white/5 bg-gray-950/40 text-text-secondary hover:border-white/10"
                    }`}>
                    <span className="text-xs font-medium">Fill in the Blank</span>
                    <input
                      type="checkbox"
                      checked={config.types.fillInTheBlank}
                      onChange={(e) => setConfig({
                        ...config,
                        types: { ...config.types, fillInTheBlank: e.target.checked }
                      })}
                      className="rounded border-gray-800 text-indigo-600 focus:ring-indigo-600 bg-gray-900"
                    />
                  </label>

                  <label className={`flex items-center justify-between border rounded-xl p-3.5 cursor-pointer transition-all active:scale-98 ${config.types.shortAnswer
                    ? "border-indigo-500/50 bg-indigo-950/20 text-white"
                    : "border-white/5 bg-gray-950/40 text-text-secondary hover:border-white/10"
                    }`}>
                    <span className="text-xs font-medium">Short Answer</span>
                    <input
                      type="checkbox"
                      checked={config.types.shortAnswer}
                      onChange={(e) => setConfig({
                        ...config,
                        types: { ...config.types, shortAnswer: e.target.checked }
                      })}
                      className="rounded border-gray-800 text-indigo-600 focus:ring-indigo-600 bg-gray-900"
                    />
                  </label>
                </div>
              </div>

              {/* Strictness Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Bounding Strictness Level</label>
                  <span className="flex items-center text-[10px] font-mono text-indigo-400 uppercase">
                    <Lock className="h-3 w-3 mr-1" /> Grounded AI Mode
                  </span>
                </div>

                <div className="space-y-2">
                  <div
                    onClick={() => setConfig({ ...config, strictness: "absolute-grounded" })}
                    className={`border p-4 rounded-xl cursor-pointer transition-all active:scale-98 ${config.strictness === "absolute-grounded"
                      ? "border-indigo-500 bg-indigo-950/20"
                      : "border-white/5 bg-gray-950/40 hover:border-white/10"
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white flex items-center">
                        Absolute Grounded (100% Citation)
                      </span>
                      <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-900 px-1.5 rounded uppercase font-mono">Recommended</span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Forces strict local attention masks. Forbids pre-trained weights from generating nouns or numeric assets unless explicitly in the text. Full generation audit runs automatically.
                    </p>
                  </div>

                  <div
                    onClick={() => setConfig({ ...config, strictness: "high-rigor" })}
                    className={`border p-4 rounded-xl cursor-pointer transition-all active:scale-98 ${config.strictness === "high-rigor"
                      ? "border-indigo-500 bg-indigo-950/20"
                      : "border-white/5 bg-gray-950/40 hover:border-white/10"
                      }`}
                  >
                    <span className="text-xs font-bold text-white block mb-1">
                      High Rigor Context (Semantics Match)
                    </span>
                    <p className="text-xs text-text-secondary">
                      Permits descriptive rewording of concepts, but holds facts to source paragraphs. Low probability warnings alert educators to verify citations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action controls */}
            <div className="flex space-x-3">
              <button
                onClick={() => setAppState("upload")}
                className="flex-1 py-3 text-xs font-semibold rounded-xl border border-white/10 text-text-secondary hover:bg-white/5 transition-all active:scale-98"
              >
                Back to Upload
              </button>
              <button
                onClick={handleStartAnalysis}
                className="flex-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/10 active:scale-98 flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Initialize Grounded Generation</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 3: ANALYZING (GROUNDED AI SYSTEM DEMO) */}
        {appState === "analyzing" && (
          <div className="w-full max-w-2xl space-y-8 py-8">
            <div className="text-center space-y-3">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-indigo-600/30 rounded-full blur-xl animate-pulse"></div>
                <div className="bg-indigo-950 border border-indigo-700/50 p-4 rounded-full text-indigo-400 relative">
                  <Brain className="h-10 w-10 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>
              <h2 className="font-display text-2xl font-extrabold text-white">Analyzing & Bounds Verification</h2>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Running token boundary mapping. Validating Gemma weights against context hashes...
              </p>
            </div>

            {/* Terminal Monitor */}
            <div className="border border-white/10 bg-gray-950 rounded-xl p-5 font-mono text-[11px] text-indigo-300 space-y-3 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-900/30">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100"
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>

              <div className="h-44 overflow-y-auto space-y-2 select-text" style={{ contentVisibility: 'auto' }}>
                {analysisLogs.map((log, idx) => (
                  <div key={idx} className="leading-5">
                    {log.startsWith("[OK]") && <span className="text-emerald-400 mr-1.5">✓</span>}
                    {log.startsWith("[AUDIT]") && <span className="text-amber-400 mr-1.5">⚠</span>}
                    <span className={log.startsWith("[SYSTEM]") ? "text-white font-bold" : "text-indigo-200/80"}>
                      {log}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* Checklist Step */}
            <div className="border border-white/5 bg-[#111827]/40 rounded-xl p-5 space-y-3">
              {analysisSteps.map((step, idx) => {
                const isDone = analysisStep > idx;
                const isActive = analysisStep === idx;
                return (
                  <div key={idx} className={`flex items-start space-x-3 transition-colors ${isDone ? "text-emerald-400" : isActive ? "text-white" : "text-text-muted"
                    }`}>
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : isActive ? (
                        <div className="h-4 w-4 rounded-full border border-indigo-500 border-t-transparent animate-spin"></div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-white/10 bg-gray-950"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono">{step.title}</h4>
                      {isActive && <p className="text-[10px] text-text-secondary mt-0.5">{step.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STATE 4: WORKSPACE (SPLIT PANE VIEW) */}
        {appState === "workspace" && selectedDoc && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[75vh]">

            {/* LEFT PANE: GROUNDED DOCUMENT VIEWER (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col bg-gray-950/80 border border-white/5 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center space-x-2">
                  <FileCode className="h-4 w-4 text-indigo-400" />
                  <h3 className="font-display text-sm font-bold text-white">Source Context</h3>
                </div>
                <div className="text-[10px] font-mono text-text-muted bg-gray-900 border border-white/5 rounded px-2 py-0.5 uppercase">
                  {selectedDoc.fileName}
                </div>
              </div>

              {/* Instructions and Metadata */}
              <div className="bg-indigo-950/20 border border-indigo-950 rounded-lg p-3 text-xs text-indigo-200 leading-relaxed">
                <strong>Strict Boundary Verified:</strong> Generated questions are bound to the segments below. Clicking a citation code (e.g. <code>[P1]</code>) will focus the source paragraph.
              </div>

              {/* Paragraphs body */}
              <div
                ref={leftPanelRef}
                className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[60vh] select-text"
              >
                {selectedDoc.paragraphs.map((p) => {
                  const isActive = activeParagraphId === p.id;
                  return (
                    <div
                      key={p.id}
                      id={`doc-para-${p.id}`}
                      onClick={() => setActiveParagraphId(p.id)}
                      className={`border p-4 rounded-xl transition-all cursor-pointer relative ${isActive
                        ? "border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-500/5"
                        : "border-white/5 bg-gray-900/40 hover:border-white/10"
                        }`}
                    >
                      <span className={`absolute top-3 left-3 text-[10px] font-bold font-mono px-2 py-0.5 rounded ${isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-950 border border-white/5 text-text-secondary"
                        }`}>
                        {p.id}
                      </span>
                      <p className="text-xs text-text-secondary leading-relaxed pl-12 pt-0.5">
                        {p.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANE: EXAM QUIZ WORKSPACE / EDUCATOR AUDIT (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col bg-[#111827]/50 border border-white/5 rounded-xl p-5 space-y-4 relative">

              {/* STUDENT VIEW FLOW */}
              {activeRole === "student" && (
                <div className="flex-1 flex flex-col space-y-4">

                  {/* Quiz Top bar info */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-mono text-text-secondary">
                      {quizStatus === "taking" ? "QUIZ IN PROGRESS" : "GRADED SCORECARD"}
                    </span>
                    {quizStatus === "submitted" && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-text-secondary">Result:</span>
                        <span className="text-sm font-mono font-bold bg-indigo-950/60 border border-indigo-900 text-indigo-400 rounded-md px-2.5 py-0.5">
                          {studentScore} / {questions.length} ({Math.round((studentScore / questions.length) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Active quiz questions */}
                  <div className="flex-1 overflow-y-auto pr-2 space-y-5 max-h-[58vh]">
                    {questions.map((q, idx) => {
                      const ans = studentAnswers[q.id] || "";
                      const isGraded = quizStatus === "submitted";
                      const isCorrect = q.type === "multiple-choice"
                        ? ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
                        : q.type === "fill-in-the-blank"
                          ? ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
                          : ans.length > 5; // Simplified visual pass representation

                      return (
                        <div key={q.id} className="border border-white/5 bg-gray-950/40 rounded-xl p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-mono text-text-muted">QUESTION 0{idx + 1}</span>
                            <div className="flex items-center space-x-2">
                              {isGraded && (
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center ${isCorrect ? "bg-emerald-950 text-emerald-300 border border-emerald-900" : "bg-rose-950 text-rose-300 border border-rose-900"
                                  }`}>
                                  {isCorrect ? <Check className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                  {isCorrect ? "CORRECT" : "INCORRECT"}
                                </span>
                              )}
                              <button
                                onClick={() => handleScrollToCitation(q.citation)}
                                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-900 hover:bg-indigo-900 hover:text-white transition-all active:scale-98"
                              >
                                Source: [{q.citation}]
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-white leading-relaxed">{q.questionText}</h4>

                          {/* Render options for Multiple Choice */}
                          {q.type === "multiple-choice" && q.options && (
                            <div className="grid grid-cols-1 gap-2 pt-1">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = ans === opt;
                                const isCorrectOpt = q.correctAnswer === opt;

                                let optionBg = "border-white/5 bg-gray-900/30 text-text-secondary hover:border-white/10";
                                if (isGraded) {
                                  if (isCorrectOpt) {
                                    optionBg = "border-emerald-500 bg-emerald-950/20 text-emerald-300";
                                  } else if (isSelected) {
                                    optionBg = "border-rose-500 bg-rose-950/20 text-rose-300";
                                  }
                                } else if (isSelected) {
                                  optionBg = "border-indigo-500 bg-indigo-950/20 text-white";
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    disabled={isGraded}
                                    onClick={() => handleStudentAnswerChange(q.id, opt)}
                                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all active:scale-98 flex items-center justify-between ${optionBg}`}
                                  >
                                    <span>{opt}</span>
                                    {!isGraded && isSelected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Render text inputs for Fill-in-the-blank */}
                          {q.type === "fill-in-the-blank" && (
                            <div className="pt-1">
                              <input
                                type="text"
                                disabled={isGraded}
                                placeholder="Type the missing word here..."
                                value={ans}
                                onChange={(e) => handleStudentAnswerChange(q.id, e.target.value)}
                                className={`w-full p-3 bg-gray-900/40 border rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 ${isGraded
                                  ? isCorrect
                                    ? "border-emerald-500 bg-emerald-950/10 text-emerald-300"
                                    : "border-rose-500 bg-rose-950/10 text-rose-300"
                                  : "border-white/5"
                                  }`}
                              />
                            </div>
                          )}

                          {/* Render textarea for Short Answer */}
                          {q.type === "short-answer" && (
                            <div className="pt-1">
                              <textarea
                                rows={2}
                                disabled={isGraded}
                                placeholder="Explain your answer in a few sentences..."
                                value={ans}
                                onChange={(e) => handleStudentAnswerChange(q.id, e.target.value)}
                                className="w-full p-3 bg-gray-900/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                              />
                            </div>
                          )}

                          {/* Reveal detailed explanations and citations after graded */}
                          {isGraded && (
                            <div className="bg-gray-900/70 border border-white/5 rounded-xl p-3.5 text-[11px] leading-relaxed text-text-secondary mt-2">
                              <p className="mb-1 text-white font-semibold">Grounded Explanation:</p>
                              <p>{q.explanation}</p>
                              {q.outOfBounds && (
                                <div className="mt-2 text-rose-400 bg-rose-950/15 border border-rose-950/50 rounded-lg p-2 flex items-start space-x-2">
                                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                                  <span>
                                    <strong>Out-of-Bounds Alert:</strong> This question represents an AI Hallucination because it queries context vectors not documented in the source segments.
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submission and Retake Actions */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {quizStatus === "taking" ? "All questions are strictly cited." : "Practice exam complete."}
                    </span>

                    {quizStatus === "taking" ? (
                      <button
                        onClick={handleSubmitQuiz}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all active:scale-98"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <button
                        onClick={() => { setQuizStatus("taking"); setStudentAnswers({}); }}
                        className="border border-white/10 hover:bg-white/5 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all active:scale-98 flex items-center space-x-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Retake Exam</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* EDUCATOR VIEW FLOW */}
              {activeRole === "educator" && (
                <div className="flex-1 flex flex-col space-y-4">

                  {/* Assessment stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-950/60 p-4 border border-white/5 rounded-xl font-sans">
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted block font-mono">TOTAL QUESTIONS</span>
                      <span className="text-lg font-bold text-white font-mono">{stats.total}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted block font-mono">STRICTLY COMPLIANT</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">{stats.compliant}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted block font-mono">OOB LEAK DETECTED</span>
                      <span className={`text-lg font-bold font-mono ${stats.hallucinations > 0 ? "text-rose-400" : "text-text-muted"}`}>
                        {stats.hallucinations}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted block font-mono">ALIGNMENT RATE</span>
                      <span className="text-lg font-bold text-indigo-400 font-mono">{stats.alignmentRate}%</span>
                    </div>
                  </div>

                  {/* Compliance Warnings Banner */}
                  {stats.hallucinations > 0 && (
                    <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 flex items-start justify-between space-x-3">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-white">Out-of-Bounds Hallucinations Detected</h4>
                          <p className="text-[11px] text-rose-300/80 mt-0.5 leading-relaxed">
                            {stats.hallucinations} questions references facts outside the uploaded context document. Prune them below to maintain 100% curriculum bounds.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handlePruneOutOfBounds}
                        className="bg-rose-900/60 hover:bg-rose-800 border border-rose-700/50 text-[10px] font-bold text-white px-3 py-1.5 rounded-lg transition-all shrink-0 active:scale-98"
                      >
                        Prune Hallucinations
                      </button>
                    </div>
                  )}

                  {/* Questions List & Editors */}
                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[46vh]">
                    {questions.map((q, idx) => {
                      const isEditing = editingQuestionId === q.id;

                      return (
                        <div
                          key={q.id}
                          className={`border rounded-xl p-5 space-y-3 transition-colors ${q.outOfBounds
                            ? "border-rose-900/50 bg-rose-950/5"
                            : "border-white/5 bg-gray-950/40"
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono text-text-muted">QUESTION 0{idx + 1}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 border border-white/5 text-text-secondary uppercase">
                                {q.type}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {q.outOfBounds ? (
                                <span className="text-[9px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-900 px-2 py-0.5 rounded">
                                  HALLUCINATION RISK
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-900 px-2 py-0.5 rounded">
                                  100% ALIGNED
                                </span>
                              )}
                              <button
                                onClick={() => handleScrollToCitation(q.citation)}
                                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-900 hover:bg-indigo-900 hover:text-white transition-all active:scale-98"
                              >
                                Citation: [{q.citation}]
                              </button>
                            </div>
                          </div>

                          {/* Editable Question Forms */}
                          {isEditing && editForm ? (
                            <div className="space-y-3 pt-1">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-text-muted">Question Text</label>
                                <textarea
                                  rows={2}
                                  value={editForm.questionText}
                                  onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                                  className="w-full p-2.5 bg-gray-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                              </div>

                              {editForm.options && (
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-mono text-text-muted block">Options (Multiple Choice)</label>
                                  {editForm.options.map((opt, oIdx) => (
                                    <input
                                      key={oIdx}
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const newOpts = [...(editForm.options || [])];
                                        newOpts[oIdx] = e.target.value;
                                        setEditForm({ ...editForm, options: newOpts });
                                      }}
                                      className="w-full p-2 bg-gray-900 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                                    />
                                  ))}
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-text-muted">Correct Answer</label>
                                  <input
                                    type="text"
                                    value={editForm.correctAnswer}
                                    onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                                    className="w-full p-2 bg-gray-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-text-muted">Citation Section</label>
                                  <input
                                    type="text"
                                    value={editForm.citation}
                                    onChange={(e) => setEditForm({ ...editForm, citation: e.target.value })}
                                    className="w-full p-2 bg-gray-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="flex space-x-2 pt-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-98"
                                >
                                  Save Updates
                                </button>
                                <button
                                  onClick={() => setEditingQuestionId(null)}
                                  className="border border-white/10 hover:bg-white/5 text-text-secondary text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-98"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Non-editing Display
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-white leading-relaxed">{q.questionText}</h4>

                              {q.options && (
                                <ul className="list-disc pl-4 space-y-1">
                                  {q.options.map((opt, oIdx) => (
                                    <li key={oIdx} className={`text-xs ${q.correctAnswer === opt ? "text-emerald-400 font-medium" : "text-text-secondary"}`}>
                                      {opt} {q.correctAnswer === opt && "(Answer)"}
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {!q.options && (
                                <p className="text-xs text-text-secondary">
                                  <strong>Expected Answer:</strong> <span className="text-emerald-400">{q.correctAnswer}</span>
                                </p>
                              )}

                              {q.outOfBounds && (
                                <div className="text-[10px] text-rose-400 bg-rose-950/15 border border-rose-950/30 rounded-lg p-2.5 leading-relaxed">
                                  <strong>Hallucination Fact Vector:</strong> The topic model identified an out-of-bounds entity reference. Facts regarding &quot;{q.correctAnswer}&quot; are unsupported by the loaded document.
                                </div>
                              )}

                              <div className="pt-2 border-t border-white/5 flex items-center space-x-2.5">
                                <button
                                  onClick={() => handleStartEdit(q)}
                                  className="text-[10px] font-semibold text-text-secondary hover:text-white flex items-center space-x-1 transition-all active:scale-98"
                                >
                                  <Edit3 className="h-3 w-3" />
                                  <span>Edit Question</span>
                                </button>
                                <button
                                  onClick={() => setQuestions(prev => prev.filter(item => item.id !== q.id))}
                                  className="text-[10px] font-semibold text-rose-400/80 hover:text-rose-400 flex items-center space-x-1 transition-all active:scale-98"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Export Controls */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-text-muted font-sans">
                      Pruned exam contains {stats.total} questions.
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExport("json")}
                        className="bg-gray-900 hover:bg-gray-800 border border-white/10 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-all active:scale-98 flex items-center space-x-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export JSON</span>
                      </button>
                      <button
                        onClick={() => handleExport("markdown")}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-all active:scale-98 flex items-center space-x-1.5"
                      >
                        <FileCheck className="h-3.5 w-3.5" />
                        <span>Export MD Exam</span>
                      </button>
                    </div>
                  </div>

                  {/* Alert banner for success export */}
                  {exportSuccess && (
                    <div className="absolute bottom-16 right-5 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs px-4 py-2.5 rounded-lg shadow-lg animate-fade-in flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Successfully exported exam as {exportSuccess}!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}