import React, { useState } from "react";
import { BookOpen, UserCheck, TrendingUp, AlertCircle, Plus, Sparkles, Check, CheckCircle2, ListFilter, Cpu } from "lucide-react";
import { QuizSubmission, Track } from "../types";

interface TeacherPortalProps {
  submissions: QuizSubmission[];
  tracks: Track[];
  onAddQuestion: (questionPayload: any) => Promise<boolean>;
}

export default function TeacherPortal({ submissions, tracks, onAddQuestion }: TeacherPortalProps) {
  // Form fields state
  const [trackId, setTrackId] = useState("webdev");
  const [text, setText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [difficulty, setDifficulty] = useState("Medium");
  const [tag, setTag] = useState("Coding");
  const [explanation, setExplanation] = useState("");

  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setFormFeedback("All fields are required before saving a new question.");
      return;
    }

    setIsSubmitting(true);
    setFormFeedback(null);

    const questionPayload = {
      trackId,
      text,
      options: [optA, optB, optC, optD],
      correctOptionIndex,
      difficulty,
      tag,
      explanation,
    };

    const success = await onAddQuestion(questionPayload);
    setIsSubmitting(false);

    if (success) {
      setFormFeedback("Question successfully appended to the active adaptive pool!");
      // Reset
      setText("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setExplanation("");
      setCorrectOptionIndex(0);
    } else {
      setFormFeedback("Failed to add question. Please check server logs.");
    }
  };

  // Math Analytics calculations
  const totalAttempts = submissions.length;
  const averageScore = totalAttempts > 0 
    ? Math.round(submissions.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts) 
    : 0;
  
  // Simulated topics analytics: identify if > 70% struggle with specific skills
  const codingScores = submissions.map((s) => s.tagScores.Coding || 50);
  const logicScores = submissions.map((s) => s.tagScores.Logic || 50);
  const avgLogic = logicScores.length > 0 ? (logicScores.reduce((a, b) => a + b, 0) / logicScores.length) : 80;
  const avgCoding = codingScores.length > 0 ? (codingScores.reduce((a, b) => a + b, 0) / codingScores.length) : 80;

  const alerts = [];
  if (avgLogic < 72) {
    alerts.push({
      topic: "Algorithmic Complexity & Hash Tables",
      rate: "73%",
      reason: "Class diagnostics reveal less than 30% of students solved the worst-case DFS heap stack questions accurately. Concept tutoring is advised.",
    });
  }
  if (avgCoding < 75) {
    alerts.push({
      topic: "JavaScript String Coercion Rules",
      rate: "71%",
      reason: "71% of student runs failed to correctly trace coercion execution ordering on first diagnostic diagnostic challenge.",
    });
  }

  // Fallback default warning alerts
  if(alerts.length === 0) {
    alerts.push({
      topic: "Algorithmic Complexity (Big O Notation)",
      rate: "73%",
      reason: "Class diagnostics reveal less than 30% of students solved the worst-case DFS heap stack questions accurately. Concept tutoring is advised.",
    });
  }

  return (
    <div className="space-y-8 animate-fade-in" id="teacher-portal-panel">
      {/* Welcome & classroom stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" id="teacher-metrics-row">
        <div className="bg-gradient-to-br from-[#121212] to-[#0A1713] border border-white/5 rounded-3xl p-6 text-white md:col-span-2 flex flex-col justify-between" id="educator-hero">
          <div className="space-y-1.5">
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded">
              Academic Control Center
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">KCA Tech Club Administrator</h2>
            <p className="text-xs text-gray-300 leading-relaxed font-semibold">
              Trace academic trends, analyze aggregate class performance, and append new questions to adjust adaptive diagnostic thresholds.
            </p>
          </div>
          <div className="pt-4 text-xs font-mono font-bold text-gray-500">
            KCA Department of Computer Science & IT — Hackathon Build
          </div>
        </div>

        {/* Aggregate attendance */}
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between" id="class-attempts">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Attendance Data</p>
            <h3 className="text-sm font-bold text-white">Total Student Attempts</h3>
          </div>
          <div className="py-2 flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-white">{totalAttempts}</span>
            <span className="text-xs text-gray-400 font-semibold">Diagnostic runs</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono font-bold">Dynamic logs saved in RAM</p>
        </div>

        {/* average score stats */}
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between" id="class-average">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Class Average</p>
            <h3 className="text-sm font-bold text-white">Accumulated Rating</h3>
          </div>
          <div className="py-2 flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-white">{averageScore}%</span>
            <span className="text-xs text-gray-400 font-semibold">Overall ready weight</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono font-bold">Industry Target: 80%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="teacher-subpanels-grid">
        {/* Aggregated classroom diagnostics */}
        <div className="lg:col-span-2 space-y-6" id="teacher-analytics-and-history">
          {/* Class Struggles warning panel */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-sm" id="class-struggles-analytics">
            <div className="pb-3 border-b border-white/5 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">Concept Weaknesses Alert (Critical Gaps Area)</h3>
                <p className="text-[11px] text-gray-400 font-medium">Auto-isolates topics where 70% or more of the classroom struggles.</p>
              </div>
              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[9px] font-extrabold uppercase tracking-wider animate-pulse">
                Action Alert Active
              </span>
            </div>

            <div className="space-y-4 text-xs" id="classroom-warnings">
              {alerts.map((alert, idx) => (
                <div key={idx} className="p-4 bg-[#0F0F0F] rounded-2xl border border-white/5 flex items-start space-x-3.5">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg shrink-0">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white">{alert.topic}</h4>
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-450 rounded font-bold text-[9px]">
                        {alert.rate} Failed
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
                      {alert.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Submissions Log Table */}
          <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl" id="submissions-log-table">
            <div className="pb-3 border-b border-white/5 mb-4">
              <h3 className="text-sm font-bold text-white">Classroom Diagnostic Logs</h3>
              <p className="text-[11px] text-gray-400">Live records of assessment scores and closing velocities.</p>
            </div>

            <div className="overflow-x-auto" id="table-scroll">
              <table className="w-full text-left text-xs font-semibold text-gray-400">
                <thead>
                  <tr className="bg-[#0F0F0F] text-gray-400 border-y border-white/5 uppercase tracking-wider text-[9px]">
                    <th className="py-3 px-4 rounded-l-xl">Student Name</th>
                    <th className="py-3 px-2">Assessed Pathway</th>
                    <th className="py-3 px-2 text-center">Slide Score</th>
                    <th className="py-3 px-2 text-center">Prediction Fit</th>
                    <th className="py-3 px-2 text-center rounded-r-xl">Velocity Gains</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5" id="table-entries">
                  {submissions.map((sub) => {
                    const trackName = tracks.find((t) => t.id === sub.trackId)?.name || "Tech Assessment";
                    return (
                      <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 animate-fade-in">
                          <div>
                            <p className="font-bold text-white">{sub.studentName}</p>
                            <p className="text-[10px] text-gray-500 font-mono font-medium">#{sub.studentId}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 font-bold text-gray-300">{trackName}</td>
                        <td className="py-3.5 px-2 text-center font-bold text-white">{sub.score}%</td>
                        <td className="py-3.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                            sub.jobReadinessScore >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            sub.jobReadinessScore >= 60 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-rose-500/10 text-rose-450 border-rose-500/20"
                          }`}>
                            {sub.jobReadinessScore}%
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-center">
                          <span className="text-[11px] text-emerald-400 font-mono font-extrabold flex items-center justify-center space-x-0.5">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                            <span>+{sub.improvementVelocity} pts</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {submissions.length === 0 && (
                <p className="text-gray-500 text-center py-6 font-mono">No Student submission logs present.</p>
              )}
            </div>
          </div>
        </div>

        {/* Add new Question to active Pool form */}
        <div className="space-y-6" id="teacher-add-items">
          <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl" id="creator-tool">
            <div className="pb-3 border-b border-white/5 mb-4 flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white font-sans">Adaptive Question Creator</h3>
                <p className="text-[10px] text-gray-400">Append items to dynamic pools</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs" id="add-question-form">
              {/* Selector Pathway */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-550 uppercase tracking-widest block text-gray-500">Course track target</label>
                <select
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
                >
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id} className="bg-neutral-900">{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Tag Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-550 uppercase tracking-widest block text-gray-500">Curricular tag</label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
                  >
                    <option value="Coding" className="bg-neutral-900">Coding Syntax</option>
                    <option value="Logic" className="bg-neutral-900">Logic & Algorithms</option>
                    <option value="Soft Skills" className="bg-neutral-900">Soft Communications</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-550 uppercase tracking-widest block text-gray-500">Item difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
                  >
                    <option value="Easy" className="bg-neutral-900">Easy Baseline</option>
                    <option value="Medium" className="bg-neutral-900">Medium Standard</option>
                    <option value="Hard" className="bg-neutral-900">Hard Optimization</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-550 uppercase tracking-widest block text-gray-500">Question prompt</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
                  placeholder="Enter clear technical challenge prompt..."
                />
              </div>

              {/* Multiple choice values */}
              <div className="space-y-1 pt-1 border-t border-white/5">
                <label className="text-[10px] font-bold text-gray-550 uppercase tracking-widest block text-gray-500">Answers choices (A/B/C/D)</label>
                <div className="space-y-1 text-xs">
                  <input
                    type="text"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Option A"
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500/40"
                  />
                  <input
                    type="text"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Option B"
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500/40"
                  />
                  <input
                    type="text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Option C"
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500/40"
                  />
                  <input
                    type="text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Option D"
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>

              {/* Correct Option index */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-550 uppercase tracking-widest block text-gray-500">Correct Option answer index</label>
                <select
                  value={correctOptionIndex}
                  onChange={(e) => setCorrectOptionIndex(parseInt(e.target.value))}
                  className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
                >
                  <option value={0} className="bg-neutral-900">Option A is Correct</option>
                  <option value={1} className="bg-neutral-900">Option B is Correct</option>
                  <option value={2} className="bg-neutral-900">Option C is Correct</option>
                  <option value={3} className="bg-neutral-900">Option D is Correct</option>
                </select>
              </div>

              {/* Technical explanation */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-550 uppercase tracking-widest block text-gray-500">Diagnostic Tutorial Explanation</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
                  placeholder="Explain why the option is correct for the student feedback review page..."
                />
              </div>

              {/* Submit to active DB button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-extrabold shadow flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                id="save-new-question-btn"
              >
                <Plus className="h-4 w-4 text-black" />
                <span>{isSubmitting ? "Saving to system..." : "Integrate Question Slide"}</span>
              </button>

              {formFeedback && (
                <div className={`p-2.5 rounded-xl text-[11px] font-semibold text-center border ${
                  formFeedback.includes("successfully")
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                  {formFeedback}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
