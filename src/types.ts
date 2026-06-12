export type UserRole = "Student" | "Teacher";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  learningGoals: string[];
}

export type SkillTag = "Coding" | "Logic" | "Soft Skills";
export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export interface Question {
  id: string;
  trackId: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  difficulty: QuestionDifficulty;
  tag: SkillTag;
  explanation: string;
}

export interface Track {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  industryStandard: {
    Coding: number; // 0-100 target
    Logic: number;
    "Soft Skills": number;
  };
}

export interface QuizSubmission {
  id: string;
  studentId: string;
  studentName: string;
  trackId: string;
  timestamp: string;
  answers: {
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
    timeTakenSeconds: number;
    difficulty: QuestionDifficulty;
    tag: SkillTag;
  }[];
  score: number; // overall percentage (0-100)
  tagScores: {
    Coding: number;
    Logic: number;
    "Soft Skills": number;
  };
  jobReadinessScore: number; // calculated overall prediction
  improvementVelocity: number; // simulated points closed per day/week
}

export interface RoadmapRecommendation {
  trackName: string;
  jobReadinessScore: number;
  skillGapAnalysis: {
    skill: SkillTag;
    currentScore: number;
    targetScore: number;
    gapStatus: "Exceeds" | "On Track" | "Needs Improvement" | "Critical Gap";
    explanation: string;
  }[];
  curatedResources: {
    type: "YouTube Video" | "Official Documentation" | "KCA Library Resource";
    title: string;
    description: string;
    urlOrCallNumber: string;
  }[];
  actionPlan: string[];
}

export interface SMSLog {
  id: string;
  timestamp: string;
  recipientPhone: string;
  message: string;
  provider: "Africa's Talking";
  status: "Sent" | "Delivered" | "Failed";
  apiPayload: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
