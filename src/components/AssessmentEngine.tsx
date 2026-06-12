import React, { useState, useEffect } from "react";
import { Clock, ShieldAlert, Cpu, ArrowRight, BookOpen, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { Question, QuestionDifficulty, SkillTag } from "../types";

interface AssessmentEngineProps {
  currentTrackName: string;
  isOffline: boolean;
  onAnswerSubmit: (questionId: string, selectedOptionIndex: number, timeTaken: number) => void;
  onFinish: () => void;
  currentQuestion: Question | null;
  currentIndex: number; // 1-based index for showing Q1/Q6
  totalQuestions: number;
  isSubmitting: boolean;
}

export default function AssessmentEngine({
  currentTrackName,
  isOffline,
  onAnswerSubmit,
  onFinish,
  currentQuestion,
  currentIndex,
  totalQuestions,
  isSubmitting,
}: AssessmentEngineProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [activeTabWarnings, setActiveTabWarnings] = useState(0);
  const [difficultyHistory, setDifficultyHistory] = useState<
    { index: number; tag: SkillTag; difficulty: QuestionDifficulty; status: "Current" | "Correct" | "Incorrect" }[]
  >([]);

  // Timer ticker
  useEffect(() => {
    setSeconds(0);
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestion]);

  // Tab switching blur proctoring simulator
  useEffect(() => {
    const handleBlur = () => {
      setActiveTabWarnings((prev) => prev + 1);
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  // Sync current question to difficulty trackers for adaptive analytics logs
  useEffect(() => {
    if (currentQuestion) {
      setSelectedOption(null);
      setDifficultyHistory((prev) => {
        // If question already in history, don't re-append
        if (prev.some((h) => h.index === currentIndex)) return prev;
        return [
          ...prev.map((item) => (item.status === "Current" ? { ...item, status: "Correct" } : item)), // placeholder update
          {
            index: currentIndex,
            tag: currentQuestion.tag,
            difficulty: currentQuestion.difficulty,
            status: "Current",
          },
        ];
      });
    }
  }, [currentQuestion, currentIndex]);

  const handleOptionClick = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleNext = () => {
    if (selectedOption === null || !currentQuestion) return;
    onAnswerSubmit(currentQuestion.id, selectedOption, seconds);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="assessment-main-panel">
      {/* Quiz Area */}
      <div className="lg:col-span-2 space-y-6" id="exam-canvas">
        <div className="bg-[#121212] rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden" id="quiz-question-card">
          {/* Header Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Current KCA Tech Hackathon Assessment Project
              </p>
              <h2 className="text-lg font-extrabold text-white">{currentTrackName}</h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Question Index Badge */}
              <span className="bg-white/[0.04] text-gray-300 px-3 py-1 rounded-full text-xs font-bold font-mono border border-white/5">
                Q {currentIndex}/{totalQuestions}
              </span>
              
              {/* Time tracker */}
              <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold font-mono border border-amber-500/20">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>{formatTime(seconds)}</span>
              </div>
            </div>
          </div>

          {/* Prompt / Simulated offline warning */}
          {isOffline && (
            <div className="mb-4 bg-amber-950/20 text-amber-400 text-xs p-3.5 rounded-xl flex items-center space-x-2 border border-amber-500/20" id="offline-assessment-alert">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <strong>Offline Assessment Active:</strong> Your responses are being buffered in the browser's <code>localStorage</code> cache. When server connection resumes, results will automatically sync up optimistically.
              </span>
            </div>
          )}

          {/* Tab switching alert */}
          {activeTabWarnings > 0 && (
            <div className="mb-4 bg-rose-950/20 text-rose-400 text-xs p-3.5 rounded-xl flex items-center space-x-2 border border-rose-500/20" id="proctoring-warning">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
              <span>
                <strong>Proctor Alert ({activeTabWarnings}):</strong> Tab-switching detected. This assessment maintains secure state-logging rules. Continued inactivity will alert educators.
              </span>
            </div>
          )}

          {/* The question text */}
          {currentQuestion ? (
            <div className="space-y-6" id="active-question-wrapper">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {/* Tag Indicator */}
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-extrabold uppercase tracking-wide">
                    {currentQuestion.tag}
                  </span>
                  {/* Adapted Difficulty Indicators */}
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border flex items-center space-x-1 ${
                    currentQuestion.difficulty === "Easy" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    currentQuestion.difficulty === "Medium" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/20 ring-1 ring-rose-300/30"
                  }`}>
                    <Zap className="h-2.5 w-2.5 fill-current" />
                    <span>Adapted: {currentQuestion.difficulty}</span>
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white leading-snug">
                  {currentQuestion.text}
                </h3>
              </div>

              {/* Multiple choice fields */}
              <div className="space-y-3 pt-2" id="options-grid">
                {currentQuestion.options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = selectedOption === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionClick(index)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/10 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                          : "bg-white/[0.02] border-white/5 hover:border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.04]"
                      }`}
                      aria-label={`Option ${letter}: ${option}`}
                      id={`option-${letter.toLowerCase()}`}
                    >
                      <div className="flex items-center space-x-3.5 pr-2">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors ${
                          isSelected
                            ? "bg-emerald-500 text-black border-emerald-500"
                            : "bg-white/[0.04] text-gray-400 border-white/5"
                        }`}>
                          {letter}
                        </span>
                        <span className="leading-tight">{option}</span>
                      </div>
                      
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Nav actions buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <p className="text-xs font-medium text-gray-400 flex items-center space-x-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Choose an option to unlock next adaptive slide.</span>
                </p>

                <button
                  onClick={handleNext}
                  disabled={selectedOption === null || isSubmitting}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${
                    selectedOption !== null && !isSubmitting
                      ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer font-extrabold"
                      : "bg-white/[0.04] text-gray-500 border border-white/5 cursor-not-allowed"
                  }`}
                  id="submit-slide-button"
                >
                  <span>{currentIndex === totalQuestions ? "Assemble Reports" : "Next Skill Slide"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4" id="completed-quiz-notice">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-white">Assessing your readiness score...</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">Please wait while the AI assessment system evaluates your score trends and generates recommendations.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Adaptive Analytics Log Sidebar */}
      <div className="space-y-6" id="diagnostic-telemetry">
        <div className="bg-[#0F0F0F] text-white rounded-3xl p-6 border border-white/5 shadow-2xl" id="adaptive-telemetry-panel">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/25">
              <Cpu className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight font-sans">Adaptive Core Telemetry</h3>
              <p className="text-[10px] text-gray-500">Real-time classification logs</p>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
            SkillPath adapts to your capacity. When you answer a question correctly, difficulty increases 
            to isolate your peak proficiency boundary. Getting a question wrong lowers difficulty, allowing 
            us to identify technical blocks.
          </p>

          <div className="space-y-3" id="telemetry-items">
            {difficultyHistory.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  item.status === "Current"
                    ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 font-semibold"
                    : "bg-white/[0.02] border-white/5 text-gray-405"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded text-gray-400 font-bold border border-white/5">
                      Q{item.index}
                    </span>
                    <span className="font-bold text-gray-300">{item.tag}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 flex items-center space-x-1">
                    <span>Baseline Difficulty:</span>
                    <span className={`font-semibold ${
                      item.difficulty === "Easy" ? "text-cyan-400" :
                      item.difficulty === "Medium" ? "text-indigo-400" :
                      "text-rose-400 font-bold"
                    }`}>
                      {item.difficulty}
                    </span>
                  </p>
                </div>

                <div>
                  {item.status === "Current" ? (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] uppercase tracking-wider font-extrabold pulse-glow">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-white/[0.04] text-gray-500 rounded text-[9px] uppercase tracking-wider font-bold border border-white/10">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {difficultyHistory.length === 0 && (
              <div className="text-center py-6 border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-gray-500">Awaiting diagnostic start...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
