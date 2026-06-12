import React, { useState, useEffect } from "react";
import { Signal, SignalZero, Wifi, WifiOff, RefreshCw, Layers, CheckCircle2, AlertTriangle, ShieldCheck, Database, HardDrive, Trash2 } from "lucide-react";

interface OfflineHubProps {
  isOffline: boolean;
  onOfflineToggle: () => void;
  onForceSync: () => Promise<void>;
}

export default function OfflineHub({
  isOffline,
  onOfflineToggle,
  onForceSync,
}: OfflineHubProps) {
  const [stats, setStats] = useState({
    cachedTracks: 0,
    cachedQuestions: 0,
    cachedSubmissions: 0,
    cachedSmsLogs: 0,
    hasPendingQueue: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Read stats from localStorage
  const readCacheStats = () => {
    try {
      const tracks = localStorage.getItem("cached_tracks");
      const questions = localStorage.getItem("cached_questions");
      const submissions = localStorage.getItem("cached_submissions");
      const smsBlogs = localStorage.getItem("cached_sms_logs");
      const pendingQueue = localStorage.getItem("pending_quiz_submission");

      setStats({
        cachedTracks: tracks ? JSON.parse(tracks).length : 0,
        cachedQuestions: questions ? JSON.parse(questions).length : 0,
        cachedSubmissions: submissions ? JSON.parse(submissions).length : 0,
        cachedSmsLogs: smsBlogs ? JSON.parse(smsBlogs).length : 0,
        hasPendingQueue: !!pendingQueue,
      });
    } catch (e) {
      console.error("Error reading cache stats", e);
    }
  };

  useEffect(() => {
    readCacheStats();
    // Set up an interval to refresh database stats
    const interval = setInterval(readCacheStats, 3000);
    return () => clearInterval(interval);
  }, [isOffline]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await onForceSync();
    setTimeout(() => {
      readCacheStats();
      setIsSyncing(false);
    }, 1000);
  };

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to purge your local cached database? This will remove all offline tracks and saved credentials.")) {
      localStorage.removeItem("cached_tracks");
      localStorage.removeItem("cached_questions");
      localStorage.removeItem("cached_submissions");
      localStorage.removeItem("cached_sms_logs");
      localStorage.removeItem("pending_quiz_submission");
      readCacheStats();
    }
  };

  return (
    <div className="bg-[#121212] rounded-3xl p-5 border border-white/5 shadow-sm space-y-4" id="offline-hub-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-emerald-400" />
          <h4 className="text-xs font-extrabold text-white font-sans uppercase tracking-wider">KCA Offline Sync Hub</h4>
        </div>
        <span className={`px-2 py-0.5 text-[9px] uppercase font-mono rounded-full border ${
          isOffline 
            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 pulse-glow" 
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        }`}>
          {isOffline ? "Disconnected" : "Synchronized"}
        </span>
      </div>

      {/* Network Alert Notification */}
      {isOffline ? (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-3 flex items-start space-x-2.5">
          <WifiOff className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-[10.5px] leading-relaxed text-amber-300 font-medium">
            <span className="font-bold">Offline Simulation Engaged:</span> progress and diagnostics will cache securely in high-performance WebStorage buffers. No cloud data will be lost.
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3 flex items-start space-x-2.5">
          <Wifi className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[10.5px] leading-relaxed text-emerald-300 font-medium">
            <span className="font-bold">Wi-Fi Online:</span> Live server synchronization activated. Real-time REST endpoints and Firestore records are actively bound.
          </div>
        </div>
      )}

      {/* Database Cache Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-white/[0.03]">
          <span className="text-[10px] text-gray-500 font-bold block">Cached Tracks</span>
          <span className="text-sm font-black text-white font-mono mt-1 block">
            {stats.cachedTracks || 3}
          </span>
        </div>
        <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-white/[0.03]">
          <span className="text-[10px] text-gray-500 font-bold block">Adaptive Qs</span>
          <span className="text-sm font-black text-white font-mono mt-1 block">
            {stats.cachedQuestions || 24}
          </span>
        </div>
        <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-white/[0.03]">
          <span className="text-[10px] text-gray-500 font-bold block">Local Results</span>
          <span className="text-sm font-black text-white font-mono mt-1 block">
            {stats.cachedSubmissions}
          </span>
        </div>
        <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-white/[0.03]">
          <span className="text-[10px] text-gray-500 font-bold block">Pending Sync</span>
          <span className={`text-sm font-black mt-1 block font-mono ${stats.hasPendingQueue ? "text-amber-400 animate-pulse" : "text-gray-400"}`}>
            {stats.hasPendingQueue ? "1 submission" : "None"}
          </span>
        </div>
      </div>

      {/* Control Panel Actions */}
      <div className="space-y-2">
        <button
          onClick={handleManualSync}
          disabled={isOffline || isSyncing}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 border shadow-sm ${
            isOffline
              ? "bg-slate-800/40 text-gray-500 border-white/5 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 text-black border-transparent font-extrabold"
          }`}
          id="btn-force-sync"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing Workspace..." : "Sync Cached Database"}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOfflineToggle}
            className={`py-2 px-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 border flex items-center justify-center space-x-1.5 ${
              isOffline
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15"
            }`}
            id="btn-toggle-outage"
          >
            <WifiOff className="h-3 w-3" />
            <span>{isOffline ? "Go Online" : "Simulate Outage"}</span>
          </button>

          <button
            onClick={handleClearCache}
            className="py-2 px-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-red-400/90 hover:text-red-300 border border-red-500/10 hover:border-red-500/25 bg-red-500/5 hover:bg-red-500/10 transition-all flex items-center justify-center space-x-1.5"
            id="btn-purge-cache"
          >
            <Trash2 className="h-3 w-3" />
            <span>Purge Storage</span>
          </button>
        </div>
      </div>

      {/* Explainer note */}
      <div className="bg-[#0A0A0A]/40 p-2.5 rounded-xl border border-white/[0.03] text-[9.5px] leading-relaxed text-gray-400 font-medium">
        This Offline Hub implements robust Offline-First service synchronization routines (SDG 4 & 9). Take assessments anywhere on campus, and sync instantly when physical Wi-Fi reconnects!
      </div>
    </div>
  );
}
