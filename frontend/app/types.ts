export type QuestionType = 'multiple-choice' | 'short-answer' | 'fill-in-the-blank';

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[]; // Used for multiple-choice
  correctAnswer: string; // The exact answer text or index representation
  citation: string; // The paragraph identifier, e.g., "P1", "P3"
  explanation: string;
  outOfBounds?: boolean; // Hallucination flag for Educator Mode
  curriculumAligned?: boolean; // Curriculum alignment flag
}

export interface SourceParagraph {
  id: string; // e.g. "P1", "P2"
  text: string;
}

export interface MockDocument {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  paragraphs: SourceParagraph[];
  questions: Question[];
}

export interface ExamConfig {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  strictness: 'standard' | 'high-rigor' | 'absolute-grounded';
  types: {
    multipleChoice: boolean;
    shortAnswer: boolean;
    fillInTheBlank: boolean;
  };
}

export type AppState = 'upload' | 'analyzing' | 'config' | 'workspace';
export type WorkspaceRole = 'student' | 'educator';
export type QuizStatus = 'idle' | 'taking' | 'submitted';
