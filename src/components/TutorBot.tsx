import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, MessageSquare, ChevronDown, ChevronUp, User, Eraser, Loader2 } from "lucide-react";
import { ChatMessage } from "../types";

interface TutorBotProps {
  contextSubmissionId?: string;
}

export default function TutorBot({ contextSubmissionId }: TutorBotProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-coach",
      sender: "ai",
      text: "Habari! I am your SkillPath Coach. I can help explain tough logical puzzles, coding syntaxes, or soft values we tested. What topic is on your mind?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const textOfChoice = textToSend || inputText;
    if (!textOfChoice.trim() || isLoading) return;

    if (!textToSend) setInputText("");

    const userMsg: ChatMessage = {
      id: `m-user-${Date.now()}`,
      sender: "user",
      text: textOfChoice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          contextSubmissionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: `m-ai-${Date.now()}`,
          sender: "ai",
          text: data.text || "I processed your request, feedback coming shortly.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("Chat api request issue");
      }
    } catch (error) {
      console.error(error);
      const aiErrorMsg: ChatMessage = {
        id: `m-ai-err-${Date.now()}`,
        sender: "ai",
        text: "I encountered a transient network connection issue. However, remember that React Virtual DOM operates by diffing virtual components in-memory to prevent browser paint costs! Let me know if you want to discuss standard coercion behaviors.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "initial-coach-reset",
        sender: "ai",
        text: "Log wiped. Fresh workspace ready! Ask me anything about engineering syntax, DFS complexity, or client communications.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickStartPrompts = [
    { label: "Explain React DOM Virtual Diffs", prompt: "Explain React's Virtual DOM in plain terms" },
    { label: "Demystify Coercion 1 + '2' + 3", prompt: "Why does 1 + '2' + 3 equal '123' in JS?" },
    { label: "Worst Case Space DFS Graph", prompt: "What is the space complexity of Depth First Search and why?" },
  ];

  return (
    <div className="bg-[#121212] rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "560px" }} id="tutor-chat-widget">
      {/* Chat header bar */}
      <div className="bg-[#0F0F0F] text-white p-4 flex items-center justify-between border-b border-white/5" id="chat-header">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-500 rounded-xl text-black" id="bot-badge">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight font-sans text-white">SkillPath AI Coach</h3>
            <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-extrabold pulse-glow">Tutorial Bot Active</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="p-1 px-1.5 hover:bg-white/[0.04] rounded text-gray-400 hover:text-rose-450 transition-colors"
            title="Clear tutor conversation logs"
            aria-label="Wipe logs"
            id="wipe-logs-btn"
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-white/[0.04] rounded text-gray-400 hover:text-white transition-colors"
            id="toggle-chat-visibility"
            aria-label="Minimize chatbot"
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Chat body */}
      {isOpen && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[350px]" id="chat-scroller">
            {messages.map((m) => {
              const isAi = m.sender === "ai";
              return (
                <div key={m.id} className={`flex items-start gap-2.5 ${!isAi ? "flex-row-reverse" : ""}`} id={`msg-bubble-${m.id}`}>
                  {/* Avatar wrapper */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                    isAi 
                      ? "bg-white/[0.04] border-white/5 text-gray-300" 
                      : "bg-emerald-500 border-[#10b981] text-black"
                  }`}>
                    {isAi ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </div>

                  {/* Message bubble speech text */}
                  <div className="space-y-1 max-w-[80%]">
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed font-medium shadow-sm border ${
                      isAi 
                        ? "bg-white/[0.02] text-gray-300 rounded-tl-none border-white/5" 
                        : "bg-emerald-500 text-black rounded-tr-none border-[#10b981]/10 font-bold"
                    }`}>
                      <p className="whitespace-pre-line">{m.text}</p>
                    </div>
                    <span className={`text-[9px] text-gray-500 font-mono block ${!isAi ? "text-right" : ""}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex items-start gap-2.5" id="loader-bubble">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-white/[0.04] border border-white/5 text-gray-300">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="p-3 bg-[#0F0F0F] rounded-2xl rounded-tl-none border border-white/5 flex items-center space-x-2 text-xs text-gray-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
                  <span>Solving academic model...</span>
                </div>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>

          {/* Quick study triggers buttons */}
          <div className="px-4 pb-2 pt-1 border-t border-white/5 bg-[#0F0F0F] space-y-1.5" id="quick-starters">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Quick Review Concepts</p>
            <div className="flex flex-wrap gap-1" id="quick-prompt-buttons">
              {quickStartPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.prompt)}
                  className="bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-gray-300 text-[10px] font-semibold py-1 px-2.5 rounded-lg transition-colors cursor-pointer"
                  id={`quick-link-${idx}`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-white/5 flex items-center space-x-2 bg-[#0F0F0F]"
            id="chat-composer"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a technical or logical question..."
              className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition-colors"
              aria-label="Type tech custom question"
              id="chat-text-input"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl transition-all ${
                inputText.trim() && !isLoading ? "shadow-lg cursor-pointer font-bold" : "opacity-40 cursor-not-allowed"
              }`}
              aria-label="Send chatbot command"
              id="chat-send-submit"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
