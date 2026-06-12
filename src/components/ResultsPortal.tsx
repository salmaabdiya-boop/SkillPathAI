import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Award, Compass, TrendingUp, RefreshCw, Sparkles, AlertTriangle, BookOpen, Clock, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import { QuizSubmission, Track } from "../types";

interface ResultsPortalProps {
  submission: QuizSubmission;
  track: Track;
  onTakeAgain: () => void;
  onGenerateRoadmap: () => void;
  isGeneratingRoadmap: boolean;
  questionsList: any[];
}

export default function ResultsPortal({
  submission,
  track,
  onTakeAgain,
  onGenerateRoadmap,
  isGeneratingRoadmap,
  questionsList,
}: ResultsPortalProps) {
  // Map data for Recharts Radar Chart
  const chartData = [
    {
      subject: "Coding Proficiency",
      "Your Score": submission.tagScores.Coding,
      "Industry Benchmark": track.industryStandard.Coding,
      fullMark: 100,
    },
    {
      subject: "Logical & DSA Strength",
      "Your Score": submission.tagScores.Logic,
      "Industry Benchmark": track.industryStandard.Logic,
      fullMark: 100,
    },
    {
      subject: "Professional Soft Skills",
      "Your Score": submission.tagScores["Soft Skills"],
      "Industry Benchmark": track.industryStandard["Soft Skills"],
      fullMark: 100,
    },
  ];

  const getGapStatus = (current: number, target: number) => {
    const diff = current - target;
    if (diff >= 0) return { label: "Exceeds", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (diff > -10) return { label: "Borderline", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
    if (diff > -22) return { label: "Needs Work", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { label: "Critical Gap", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
  };

  return (
    <div className="space-y-8" id="results-portal-view">
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="results-summary-cards">
        {/* Job readiness overall */}
        <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col justify-between" id="job-readiness-card">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Predicted Job Readiness
            </p>
            <h3 className="text-sm font-bold text-gray-300">{track.name}</h3>
          </div>
          
          <div className="py-6 flex items-baseline space-x-2">
            <span className="text-5xl font-extrabold text-white tracking-tight">
              {submission.jobReadinessScore}%
            </span>
            <span className="text-xs text-gray-500 font-medium">Ready</span>
          </div>

          <div className="bg-[#0F0F0F] rounded-xl p-3 border border-white/5 text-xs text-gray-400 font-medium leading-relaxed">
            {submission.jobReadinessScore >= 80 ? (
              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1"></span>
                Extremely high fit! Ready to submit resume to partners.
              </span>
            ) : submission.jobReadinessScore >= 60 ? (
              <span className="text-amber-400 font-semibold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1"></span>
                Nearing alignment. Solid progress; close remaining gaps.
              </span>
            ) : (
              <span className="text-rose-400 font-semibold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mr-1"></span>
                Action needed. Build up basic blocks with roadmap tutor.
              </span>
            )}
          </div>
        </div>

        {/* Aggregate Score percentage */}
        <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col justify-between" id="diagnostic-score-card">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Diagnostic Score
            </p>
            <h3 className="text-sm font-bold text-gray-300">Correct Ratio on Slide</h3>
          </div>

          <div className="py-6 flex items-baseline space-x-2">
            <span className="text-5xl font-extrabold text-white tracking-tight">
              {submission.score}%
            </span>
            <span className="text-xs text-gray-500 font-medium">of Questions Correct</span>
          </div>

          <div className="flex justify-between items-center text-xs font-semibold text-gray-500 border-t border-white/5 pt-3">
            <span>Adaptive Challenge</span>
            <span>6/6 Slides</span>
          </div>
        </div>

        {/* Improvement velocity metric */}
        <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col justify-between animate-fade-in" id="velocity-trend-card">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Improvement Velocity
              </span>
              <div className="p-1 px-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-extrabold rounded-full flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span>Gain Trend</span>
              </div>
            </div>
            <h3 className="text-sm font-bold text-gray-300">Competency pace per week</h3>
          </div>

          <div className="py-6 flex items-baseline space-x-2">
            <span className="text-5xl font-extrabold text-white tracking-tight">
              +{submission.improvementVelocity}
            </span>
            <span className="text-xs text-gray-500 font-medium">Points / Cycle</span>
          </div>

          <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-[11px] text-gray-400">
            Evaluating how fast you are patching concepts. Excellent score elevation velocity since first diagnostic run!
          </div>
        </div>
      </div>

      {/* Radar Map & Skill Gaps Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="diagnostic-visual-panels">
        {/* Radar Graphic Chart */}
        <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl" id="radar-visual-chart">
          <div className="pb-4 mb-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-white">Industry Alignment Radar</h3>
            <p className="text-[11px] text-gray-400">Maps your score vs East African market expectation benchmarks.</p>
          </div>

          <div className="h-72" id="recharts-container" style={{ width: "100%", position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} />
                <Radar
                   name="Your Competency"
                   dataKey="Your Score"
                   stroke="#10b981"
                   fill="#10b981"
                   fillOpacity={0.2}
                />
                <Radar
                   name="Target Benchmark"
                   dataKey="Industry Benchmark"
                   stroke="#3b82f6"
                   fill="#3b82f6"
                   fillOpacity={0.05}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Gap Analysis list */}
        <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col justify-between" id="gaps-list">
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white">Concept Verification Check</h3>
              <p className="text-[11px] text-gray-400">Isolate blocks to schedule with partner tutorial modules.</p>
            </div>

            <div className="space-y-3" id="gap-items">
              {/* Coding info */}
              <div className="p-3.5 bg-[#0F0F0F] rounded-2xl border border-white/5 flex items-center justify-between" id="coding-gap">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">Coding Syntax & Compilation</h4>
                  <div className="text-[10px] text-gray-500 flex items-center space-x-2">
                    <span>Performance: {submission.tagScores.Coding}%</span>
                    <span className="text-white/10">|</span>
                    <span>Target: {track.industryStandard.Coding}%</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border uppercase tracking-wider ${
                  getGapStatus(submission.tagScores.Coding, track.industryStandard.Coding).color
                }`}>
                  {getGapStatus(submission.tagScores.Coding, track.industryStandard.Coding).label}
                </span>
              </div>

              {/* Logic info */}
              <div className="p-3.5 bg-[#0F0F0F] rounded-2xl border border-white/5 flex items-center justify-between" id="logic-gap">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">Logical Reasoning & DSA Costs</h4>
                  <div className="text-[10px] text-gray-500 flex items-center space-x-2">
                    <span>Performance: {submission.tagScores.Logic}%</span>
                    <span className="text-white/10">|</span>
                    <span>Target: {track.industryStandard.Logic}%</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border uppercase tracking-wider ${
                  getGapStatus(submission.tagScores.Logic, track.industryStandard.Logic).color
                }`}>
                  {getGapStatus(submission.tagScores.Logic, track.industryStandard.Logic).label}
                </span>
              </div>

              {/* Soft Skills info */}
              <div className="p-3.5 bg-[#0F0F0F] rounded-2xl border border-white/5 flex items-center justify-between" id="softskills-gap">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">Strategic Professional Values</h4>
                  <div className="text-[10px] text-gray-500 flex items-center space-x-2">
                    <span>Performance: {submission.tagScores["Soft Skills"]}%</span>
                    <span className="text-white/10">|</span>
                    <span>Target: {track.industryStandard["Soft Skills"]}%</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border uppercase tracking-wider ${
                  getGapStatus(submission.tagScores["Soft Skills"], track.industryStandard["Soft Skills"]).color
                }`}>
                  {getGapStatus(submission.tagScores["Soft Skills"], track.industryStandard["Soft Skills"]).label}
                </span>
              </div>
            </div>
          </div>

          {/* AI Career roadmap dispatch zone */}
          <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 text-center mt-6" id="roadmap-generation-box">
            <p className="text-[11px] text-gray-400 font-medium mb-3">
              Unlock a personalized career roadmap using KCA Library reserves & YouTube lists.
            </p>
            <button
              onClick={onGenerateRoadmap}
              disabled={isGeneratingRoadmap}
              className={`w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-xl text-xs tracking-wide shadow flex items-center justify-center space-x-1.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
              id="request-roadmap-btn"
            >
              <Sparkles className="h-4 w-4 fill-black text-black" />
              <span>{isGeneratingRoadmap ? "Assembling Roadmap..." : "Generate AI Career Roadmap"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide reviews details */}
      <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl space-y-6" id="questions-review">
        <div className="border-b border-white/5 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-white">Adaptive Diagnostic Evaluation Review</h3>
            <p className="text-xs text-gray-400">Analyze why each option is correct, and learn from mistakes.</p>
          </div>
          <button
            onClick={onTakeAgain}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition-colors cursor-pointer"
            id="try-again-button"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retake Diagnostic</span>
          </button>
        </div>

        <div className="space-y-4" id="reviewed-items-list">
          {submission.answers.map((ans, idx) => {
            const questionData = questionsList.find((q) => q.id === ans.questionId) || ans;
            if (!questionData) return null;

            return (
              <div key={idx} className="p-4 bg-[#0F0F0F] border border-white/5 rounded-2xl space-y-3" id={`review-item-${idx}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-mono bg-white/[0.04] text-gray-300 px-2 py-0.5 rounded font-extrabold border border-white/5 text-[10px]">
                      Slide {idx + 1}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-medium text-[10px]">
                      {ans.tag}
                    </span>
                    <span className="px-2 py-0.5 bg-white/[0.02] text-gray-400 rounded border border-white/5 font-medium text-[10px]">
                      Difficulty: {ans.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs">
                    {ans.isCorrect ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center space-x-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full font-bold border border-rose-500/20 flex items-center space-x-1">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Incorrect</span>
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500 font-mono font-bold">
                      ({ans.timeTakenSeconds}s taken)
                    </span>
                  </div>
                </div>

                <p className="text-sm font-bold text-white leading-snug">
                  {questionData.text || "Verify concept answers on diagnostics review"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/5" id="your-choice">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Your Selected Answer:</span>
                    <p className={`font-semibold ${ans.isCorrect ? "text-gray-300" : "text-rose-400"}`}>
                      {questionData.options && Array.isArray(questionData.options) && questionData.options[ans.selectedOptionIndex]
                        ? questionData.options[ans.selectedOptionIndex]
                        : `Option Index ${ans.selectedOptionIndex + 1}`}
                    </p>
                  </div>
                  {!ans.isCorrect && (
                    <div className="p-2.5 bg-emerald-500/5 text-gray-300 rounded-xl border border-emerald-500/10" id="actual-correct">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Correct Option Answer:</span>
                      <p className="font-bold text-emerald-400">
                        {questionData.options && Array.isArray(questionData.options) && questionData.options[questionData.correctOptionIndex]
                          ? questionData.options[questionData.correctOptionIndex]
                          : "Refer to documentation for correct choice"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5 text-xs text-gray-400 space-y-1" id="concept-explanation">
                  <p className="font-bold text-white flex items-center space-x-1">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Tutorial Explanation:</span>
                  </p>
                  <p className="leading-relaxed font-medium">{questionData.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
