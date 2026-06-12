import React from "react";
import { GraduationCap, Signal, SignalZero, Wifi, WifiOff, Sun, Moon, Sparkles, LogIn, Users, LogOut } from "lucide-react";
import { UserRole } from "../types";

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isOffline: boolean;
  onOfflineToggle: () => void;
  highContrast: boolean;
  onHighContrastToggle: () => void;
  studentName: string;
  user: any;
  onSignOut: () => void;
}

export default function Header({
  currentRole,
  onRoleChange,
  isOffline,
  onOfflineToggle,
  highContrast,
  onHighContrastToggle,
  studentName,
  user,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#0F0F0F] text-gray-200 border-b border-white/5" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Title and Badge */}
        <div className="flex items-center space-x-3" id="brand-container">
          <div className="p-2 bg-emerald-500 rounded-xl" id="badge-wrapper">
            <GraduationCap className="h-6 w-6 text-black" id="brand-icon" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                SkillPath <span className="text-emerald-500">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                KCA University
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium" id="tagline-text">
              Tracking your path to Industry-Ready
            </p>
          </div>
        </div>

        {/* Configurations Hub */}
        <div className="flex items-center space-x-4 md:space-x-6" id="controls-hub">
          {/* Offline Support Toggle (PWA Simulation) */}
          <button
            onClick={onOfflineToggle}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 border ${
              isOffline
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 ring-2 ring-amber-500/20 pulse-glow"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
            title="Simulate Wi-Fi disconnection for offline test taking"
            aria-label="Toggle Offline Caching Simulation"
            id="wifi-toggle-button"
          >
            {isOffline ? (
              <>
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4" />
                <span className="hidden sm:inline">Live Syncing</span>
              </>
            )}
          </button>

          {/* High Contrast Mode for Accessibility */}
          <button
            onClick={onHighContrastToggle}
            className={`p-2 rounded-lg transition-colors border ${
              highContrast
                ? "bg-white text-slate-900 border-white"
                : "bg-white/[0.02] text-gray-400 border-white/5 hover:text-white"
            }`}
            title="Toggle Accessibility High Contrast Mode"
            aria-label="Toggle High Contrast"
            id="contrast-mode-button"
          >
            <Sun className="h-4 w-4" />
          </button>

          {/* Role selection switcher */}
          <div className="flex items-center bg-white/[0.02] p-1 rounded-xl border border-white/5" id="role-selector">
            <button
              onClick={() => onRoleChange("Student")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === "Student"
                  ? "bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : "text-gray-400 hover:text-white"
              }`}
              id="student-role-button"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Student</span>
            </button>
            <button
              onClick={() => onRoleChange("Teacher")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === "Teacher"
                  ? "bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : "text-gray-400 hover:text-white"
              }`}
              id="teacher-role-button"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Educator</span>
            </button>
          </div>

          {/* User detail info */}
          <div className="flex items-center space-x-2 sm:space-x-3.5" id="user-profile-badge">
            <div className="hidden sm:flex flex-col text-right justify-center">
              <p className="text-xs font-bold text-white">
                {user ? user.displayName || user.name : (currentRole === "Student" ? studentName : "Dr. Mary Mwangi")}
              </p>
              <p className="text-[10px] font-mono text-gray-500">
                {user ? user.email : (currentRole === "Student" ? "2504796@students.kcau.ac.ke" : "dept.cs@kcau.ac.ke")}
              </p>
            </div>
            <button
              onClick={onSignOut}
              className="px-2 py-1 sm:px-2.5 sm:py-1 text-[10px] font-extrabold tracking-wider uppercase text-red-400 hover:text-red-300 border border-red-500/10 hover:border-red-500/35 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer flex items-center space-x-1"
              id="logout-button"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
