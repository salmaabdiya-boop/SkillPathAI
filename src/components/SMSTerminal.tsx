import React, { useState } from "react";
import { MessageSquare, Phone, Send, Terminal, Sparkles, Smartphone, BellRing, Copy, Check } from "lucide-react";
import { SMSLog } from "../types";

interface SMSTerminalProps {
  logs: SMSLog[];
  onTriggerSimulateText: (phone: string, text: string) => void;
  isOffline: boolean;
}

export default function SMSTerminal({ logs, onTriggerSimulateText, isOffline }: SMSTerminalProps) {
  const [recipientPhone, setRecipientPhone] = useState("+254 712 345 678");
  const [customMessage, setCustomMessage] = useState("KCA Tech Club Alert: Hackathon milestone draft due Sunday night!");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSendCustomSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone.trim() || !customMessage.trim()) return;
    onTriggerSimulateText(recipientPhone, customMessage);
    // don't wipe customMessage to allow re-sending or testing
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Latest SMS received
  const latestSMS = logs.length > 0 ? logs[0] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="sms-simulator-panel">
      {/* Outbound Control and Terminal Logs code */}
      <div className="lg:col-span-2 space-y-6" id="sms-api-logs-terminal">
        <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl" id="sms-trigger-form-card">
          <div className="pb-3 border-b border-white/5 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-sans">Africa's Talking Sandbox Gateway</h3>
              <p className="text-[11px] text-gray-400 font-medium">Verify outbound RESTful payloads and mock texts.</p>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-extrabold uppercase tracking-wider">
              SMS Service Status: Live
            </span>
          </div>

          <form onSubmit={handleSendCustomSim} className="grid grid-cols-1 md:grid-cols-3 gap-4" id="custom-sms-form">
            <div className="space-y-1">
              <label htmlFor="student-phone" className="text-[10px] font-bold text-gray-550 block text-gray-500 uppercase tracking-widest">Recipient (Kenya Prefixed)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="text"
                  id="student-phone"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
                  placeholder="+254 700 000 000"
                />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label htmlFor="sms-body" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block flex items-center justify-between">
                <span>Message text payload</span>
                <span className="font-mono text-[9px] text-gray-500 lowercase">{customMessage.length}/160 characters</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="sms-body"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="flex-1 bg-[#0F0F0F] border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
                  placeholder="Type a custom campus alert message..."
                />
                <button
                  type="submit"
                  disabled={isOffline || !customMessage.trim()}
                  className={`px-4 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-extrabold shadow flex items-center space-x-1 transition-all ${
                    isOffline ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  id="send-sms-btn"
                >
                  <Send className="h-3 w-3 text-black" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </form>

          {isOffline && (
            <p className="text-[10px] text-amber-500 font-bold mt-2 flex items-center space-x-1 font-mono">
              <span>●</span>
              <span>Offline: SMS dispatches are locked inside optimistic queues until network sync is restored.</span>
            </p>
          )}
        </div>

        {/* Live Terminal Console logs */}
        <div className="bg-[#0A0A0A]/90 text-gray-100 rounded-3xl p-6 border border-white/5 shadow-2xl space-y-4" id="logs-console-window">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-xs font-bold text-gray-300">Outbound API Webhook Stream Logs</span>
          </div>

          <div className="font-mono text-[11px] leading-relaxed space-y-3 max-h-[250px] overflow-y-auto" id="terminal-screen-scroller">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-white/[0.02] rounded-xl border border-white/5 space-y-1.5" id={`term-log-${log.id}`}>
                <div className="flex items-center justify-between text-[9px] text-gray-505 font-bold">
                  <span>Timestamp: {new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="text-emerald-400">PROVIDER: {log.provider}</span>
                </div>
                
                <p className="text-gray-300">
                  <span className="text-emerald-500">OUTBOUND SMS TO</span> <span className="font-bold underline">{log.recipientPhone}</span> : "{log.message}"
                </p>

                {/* API Request schema parameters expansion */}
                <div className="mt-2 text-gray-400 space-y-1 font-mono text-[10px]" id={`api-payload-${log.id}`}>
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1">
                    <span className="text-pink-400 text-[9px] uppercase font-semibold">Africa's Talking HTTP Request POST payload</span>
                    <button
                      onClick={() => copyToClipboard(log.apiPayload, log.id)}
                      className="text-gray-550 hover:text-white flex items-center space-x-1"
                      aria-label="Copy raw json payload"
                    >
                      {copiedId === log.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedId === log.id ? "Copied" : "Copy Payload"}</span>
                    </button>
                  </div>
                  <pre className="bg-black/85 p-2.5 rounded border border-white/5 leading-normal text-[9px] text-cyan-300 font-semibold overflow-x-auto">
                    {log.apiPayload}
                  </pre>
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <p className="text-gray-600 text-center py-6 font-mono font-medium">Awaiting SMS dispatcher event triggers...</p>
            )}
          </div>
        </div>
      </div>

      {/* Real-time smartphone preview shell */}
      <div className="space-y-4" id="smartphone-wrapper">
        <h3 className="text-sm font-bold text-white font-sans">Mock Smartphone Sync</h3>
        <p className="text-xs text-gray-400">Live preview of student SMS push notifications arrived.</p>

        <div className="relative mx-auto max-w-[260px] h-[500px] bg-[#0A0A0A] border-[10px] border-[#1C1C1E] rounded-[40px] shadow-2xl overflow-hidden flex flex-col justify-between" id="smartphone-shell">
          {/* Top Notch speaker */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#1C1C1E] rounded-full z-20 flex items-center justify-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700"></span>
            <span className="w-8 h-1 bg-slate-900 rounded-full"></span>
          </div>

          <div className="relative flex-1 p-4 pt-10 flex flex-col justify-between bg-gradient-to-b from-emerald-950/20 via-slate-950 to-indigo-950/20" id="smartphone-screen">
            {/* Status indicators */}
            <div className="flex justify-between items-center text-[9px] text-gray-450 font-mono font-bold px-1 mb-2">
              <span>9:41 AM</span>
              <div className="flex items-center space-x-1.5">
                <span>5G</span>
                <span className="w-4 h-2 bg-[#1C1C1E] border border-white/10 rounded"></span>
              </div>
            </div>

            {/* Simulated Push Notification Slide Card */}
            <div className="flex-1 flex flex-col justify-start" id="smartphone-notification-center">
              {latestSMS ? (
                <div className="bg-[#121212]/95 text-white p-3 rounded-2xl shadow-xl space-y-1.5 border border-white/10 animate-bounce relative z-10" id="mock-sms-toast">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-[10px] font-extrabold text-emerald-400">
                      <BellRing className="h-3 w-3 text-emerald-400" />
                      <span>SkillPath AI Alert</span>
                    </div>
                    <span className="text-[8px] font-mono font-bold text-gray-500">Just Now</span>
                  </div>
                  
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-white">{latestSMS.recipientPhone}</p>
                    <p className="text-[10px] text-gray-300 leading-normal font-semibold font-sans">{latestSMS.message}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-2 opacity-50">
                  <Smartphone className="h-8 w-8 text-gray-650 stroke-1" />
                  <p className="text-[10px] text-gray-500 font-semibold leading-tight">No notifications. Lockscreen active.</p>
                </div>
              )}
            </div>

            {/* Quick action lockscreen bar */}
            <div className="text-center pb-2">
              <span className="w-16 h-1 bg-[#1C1C1E] rounded-full inline-block"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
