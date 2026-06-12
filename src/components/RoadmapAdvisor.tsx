import React, { useState } from "react";
import { Sparkles, MapPin, CheckSquare, Square, Youtube, Book, FileText, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import { RoadmapRecommendation, SkillTag } from "../types";

interface RoadmapAdvisorProps {
  roadmap: RoadmapRecommendation;
  onClose: () => void;
}

export default function RoadmapAdvisor({ roadmap, onClose }: RoadmapAdvisorProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleChecklist = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "YouTube Video":
        return <Youtube className="h-4 w-4 text-red-400" />;
      case "Official Documentation":
        return <FileText className="h-4 w-4 text-indigo-400" />;
      case "KCA Library Resource":
        return <Book className="h-4 w-4 text-emerald-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="roadmap-advisor-view">
      {/* Roadmap Header Card */}
      <div className="bg-gradient-to-br from-[#121212] to-[#0A1713] text-white rounded-3xl p-6 md:p-8 shadow-xl relative border border-white/5" id="roadmap-congratulations">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="h-3 w-3 fill-emerald-400" />
            <span>AI Curriculum Synchronization Model</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Your Career Road Map is Ready
          </h2>

          <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
            Based on your diagnostics, our advisors have generated this localized career playbook. It synchronizes you with 
            academic resources in KCA's physical library and leading practical visual courses to quickly bridge performance gaps.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-2">
            <span className="bg-[#0F0F0F] text-gray-300 px-3 py-1.5 rounded-lg border border-white/5">
              Track: <strong>{roadmap.trackName}</strong>
            </span>
            <span className="bg-[#0F0F0F] text-gray-300 px-3 py-1.5 rounded-lg border border-white/5">
              Rating: <strong>{roadmap.jobReadinessScore}% Ready</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="roadmap-subcomponents">
        {/* Gap Status Analysis + Resources */}
        <div className="lg:col-span-2 space-y-6" id="gap-and-resources-canvas">
          {/* Detailed Skill Gap Advice */}
          <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl" id="detailed-gap-advising">
            <div className="pb-3 border-b border-white/5 mb-4">
              <h3 className="text-sm font-bold text-white">Assessor Calibration Breakdown</h3>
              <p className="text-[11px] text-gray-400">What the industry requires vs where your diagnosis stands.</p>
            </div>

            <div className="space-y-4 text-xs" id="roadmap-gap-metrics">
              {roadmap.skillGapAnalysis.map((item, idx) => (
                <div key={idx} className="p-4 bg-[#0F0F0F] rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{item.skill}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold border ${
                      item.gapStatus === "Exceeds" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      item.gapStatus === "On Track" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                      item.gapStatus === "Needs Improvement" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse"
                    }`}>
                      {item.gapStatus}
                    </span>
                  </div>

                  {/* Range trackers */}
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white/[0.04] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${item.currentScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono font-bold">
                      {item.currentScore}% / {item.targetScore}%
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Resources (Docs, Videos, and Library Catalog) */}
          <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl" id="curated-curricular-items">
            <div className="pb-3 border-b border-white/5 mb-4">
              <h3 className="text-sm font-bold text-white">Target Curated Curricular Reserves</h3>
              <p className="text-[11px] text-gray-400">Includes direct manuals, leading channels, and local KCA Reserve stack locations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="curated-resources-cards">
              {roadmap.curatedResources.map((resource, idx) => (
                <div key={idx} className="p-4 bg-[#0F0F0F] rounded-2xl border border-white/5 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5">
                      {getSourceIcon(resource.type)}
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500">
                        {resource.type}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-tight">
                      {resource.title}
                    </h4>

                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                      {resource.description}
                    </p>
                  </div>

                  {/* Action link or Library Call-number code */}
                  <div className="bg-[#121212] p-2 rounded-xl flex items-center justify-between text-[10px] border border-white/5">
                    <span className="text-gray-500 font-mono font-bold">
                      {resource.type === "KCA Library Resource" ? "Call Shelf Number:" : "Direct Link:"}
                    </span>
                    <a
                      href={resource.urlOrCallNumber.startsWith("http") ? resource.urlOrCallNumber : "#"}
                      target={resource.urlOrCallNumber.startsWith("http") ? "_blank" : undefined}
                      rel="referrer"
                      className="text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded font-mono font-extrabold tracking-wide border border-emerald-500/25"
                    >
                      {resource.urlOrCallNumber}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action checklist schedules sidebar */}
        <div className="space-y-6" id="roadmap-action-checklist">
          <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl" id="action-checklist">
            <div className="pb-3 border-b border-white/5 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Diagnostic Action Plan</h3>
                <p className="text-[10px] text-gray-500">Daily milestones checklist</p>
              </div>
              <span className="bg-white/[0.04] text-gray-300 border border-white/5 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                {Object.values(completedSteps).filter(Boolean).length}/{roadmap.actionPlan.length} Done
              </span>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
              Tick off finished steps as you master the materials. Focus on syntax blocks and library reads.
            </p>

            <div className="space-y-2.5" id="action-checklist-rows">
              {roadmap.actionPlan.map((step, index) => {
                const isCheck = !!completedSteps[index];
                return (
                  <button
                    key={index}
                    onClick={() => toggleChecklist(index)}
                    className={`w-full text-left p-3 rounded-xl border flex items-start space-x-2.5 cursor-pointer text-xs font-semibold transition-all ${
                      isCheck
                        ? "bg-emerald-500/5 border-emerald-500/15 text-gray-500 font-medium"
                        : "bg-[#0F0F0F] border-white/5 hover:border-white/10 text-gray-300 hover:text-white"
                    }`}
                  >
                    <div className="shrink-0 mt-0.5" id={`checklist-check-${index}`}>
                      {isCheck ? (
                        <CheckSquare className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-600 hover:text-gray-500" />
                      )}
                    </div>
                    <span className={`leading-relaxed ${isCheck ? "line-through opacity-60" : ""}`}>{step}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick help trigger */}
            <div className="mt-6 bg-[#0F0F0F] border border-white/5 rounded-2xl p-4 flex items-start space-x-2" id="quick-help-advisor">
              <AlertCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-[11px] font-bold text-white">Need clarification?</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Open the <strong>SkillPath Coach</strong> AI tutor on your right or bottom side to ask specific questions about your diagnostic road map recommendations!
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-2.5 bg-emerald-505 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-xl text-xs shadow flex items-center justify-center space-x-1"
              id="close-roadmap-view-btn"
            >
              <span>Back to Pathways Hub</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
