import React from "react";
import { Code, BarChart3, Cloud, Compass, Star, GraduationCap, ChevronRight, BookOpen } from "lucide-react";
import { Track } from "../types";

interface TrackListProps {
  tracks: Track[];
  onSelectTrack: (trackId: string) => void;
  studentName: string;
}

export default function TrackList({ tracks, onSelectTrack, studentName }: TrackListProps) {
  const getIcon = (name: string) => {
    switch (name) {
      case "Code":
        return <Code className="h-6 w-6 text-emerald-400" />;
      case "BarChart3":
        return <BarChart3 className="h-6 w-6 text-emerald-400" />;
      case "Cloud":
        return <Cloud className="h-6 w-6 text-emerald-400" />;
      default:
        return <Compass className="h-6 w-6 text-gray-405" />;
    }
  };

  return (
    <div className="space-y-8" id="track-list-view">
      {/* Hero Welcome Unit */}
      <div className="bg-gradient-to-br from-[#121212] to-[#0F1714] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-white/5" id="welcome-hero">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-emerald-500/5 rounded-full blur-2xl" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Star className="h-3.5 w-3.5 fill-emerald-400" />
            <span>KCA Student Success Platform</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Habari, <span className="text-emerald-400">{studentName}</span>!
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed font-sans">
            Welcome to your **SkillPath AI** Diagnostic Hub. This system uses adaptive testing parameters 
            to isolate specific concept gaps, map your current proficiencies against East African tech industry job requirements, 
            and output dynamic learning roadmaps featuring real local KCA University Library inventory call-numbers.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-gray-300">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-xl">
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
              <span>SDG 4: Quality Education</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-xl">
              <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
              <span>SDG 8: Decent Work</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pathways Panel Section */}
      <div className="space-y-4" id="pathways-section">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Select Your Target Engineering Pathway</h2>
          <p className="text-xs text-gray-400">Pick a track to run our diagnostic assessment on your coding strength, analytical patterns, and soft values.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="tracks-cards-grid">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="group bg-[#121212] rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between"
              id={`track-${track.id}`}
            >
              <div className="space-y-4">
                {/* Track icon */}
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-white/[0.04] rounded-xl group-hover:bg-white/[0.08] transition-colors">
                    {getIcon(track.icon)}
                  </div>
                  <span className="text-[10px] tracking-wider uppercase font-extrabold text-[#10b981] bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                    Adaptive Active
                  </span>
                </div>

                {/* Info titles */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {track.name}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed min-h-[40px]">
                    {track.description}
                  </p>
                </div>

                {/* Target Score benchmarks */}
                <div className="bg-white/[0.02] rounded-xl p-3 space-y-2 border border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Industry Standard Benchmarks
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium font-sans">Coding</p>
                      <p className="font-bold text-white">{track.industryStandard.Coding}%</p>
                    </div>
                    <div className="border-x border-white/5">
                      <p className="text-[10px] text-gray-500 font-medium font-sans">Logic & DSA</p>
                      <p className="font-bold text-white">{track.industryStandard.Logic}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium font-sans">Soft Skills</p>
                      <p className="font-bold text-white">{track.industryStandard["Soft Skills"]}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Launcher CTA */}
              <button
                onClick={() => onSelectTrack(track.id)}
                className="mt-6 w-full flex items-center justify-center space-x-1 py-2.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 group-hover:border-emerald-500/30 group-hover:text-emerald-400 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer"
                id={`launch-${track.id}-btn`}
              >
                <span>Launch Diagnostic</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
