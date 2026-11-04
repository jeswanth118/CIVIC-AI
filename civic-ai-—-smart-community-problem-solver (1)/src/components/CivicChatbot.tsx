import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, RefreshCw, X, ArrowUpRight, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface CivicChatbotProps {
  onClose?: () => void;
  isStandalone?: boolean;
}

/**
 * CivicChatbot - Premium Dark Glassmorphism Aesthetic
 * - Deep black #030405 background
 * - Translucent glass surfaces with subtle silver reflections
 * - Thin silver borders: rgba(255, 255, 255, 0.12)
 * - Modern futuristic typography (Space Grotesk & Inter)
 * - Restrained outer glows and smooth micro-interactions
 */
export const CivicChatbot: React.FC<CivicChatbotProps> = ({ onClose, isStandalone = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'Hello! I am CIVIC AI, your community intelligence assistant. You can ask about municipal reporting procedures, track community issues, or get guidance on civic concerns.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelTier] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    { title: 'Report a local problem', query: 'How do I submit a problem report for my neighborhood?' },
    { title: 'Understanding community issues', query: 'How does CIVIC AI analyze and categorize reported community issues?' },
    { title: 'Track a civic concern', query: 'Can I track the progress and status of a complaint using its ID?' },
    { title: 'Municipal response process', query: 'What steps occur between filing a report and dispatching municipal crews?' }
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          systemInstruction: "You are CIVIC AI Municipal Assistant, an intelligent civic advisor for citizens and municipal teams. Provide concise, clear, and realistic guidance about local infrastructure, community problem reporting, status tracking, and city services. Maintain a helpful, calm, and professional tone.",
          modelTier,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server chatbot.');
      }

      const data = await response.json();
      const modelMsg: Message = {
        role: 'model',
        content: data.reply || 'I processed your request successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        role: 'model',
        content: 'Unable to connect to the CIVIC AI service at this moment. Please verify your connection or try again shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#030405] text-[#F5F5F5] font-sans select-text relative overflow-hidden ${
      isStandalone ? 'max-w-4xl mx-auto rounded-3xl border border-white/12 shadow-[0_24px_80px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.18)] my-6 min-h-[620px]' : 'w-full'
    }`}>
      {/* Subtle Ambient Silver Lighting in Background */}
      <div className="absolute top-0 right-1/4 w-[320px] h-[220px] bg-white/[0.03] rounded-full blur-[90px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-[280px] h-[180px] bg-white/[0.02] rounded-full blur-[80px] pointer-events-none -z-0" />

      {/* 1. MINIMAL SOPHISTICATED HEADER */}
      <div className="relative z-10 px-5 py-3.5 border-b border-white/10 bg-[#060709]/80 backdrop-blur-2xl flex items-center justify-between shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold tracking-tight text-white font-heading">
                CIVIC AI
              </h2>
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
            </div>
            <p className="text-[11px] text-[#A5A7AB] font-normal leading-none mt-0.5 tracking-wide">
              Community Intelligence Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Reset Conversation button */}
          <button
            onClick={() => setMessages([{
              role: 'model',
              content: 'Conversation reset. How can I help your community today?',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }])}
            className="p-1.5 text-[#73777D] hover:text-white rounded-lg hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-all cursor-pointer"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Close/Minimize button if within floating panel */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#73777D] hover:text-white rounded-lg hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-all cursor-pointer"
              title="Close chat"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. CONVERSATION AREA */}
      <div className="relative z-10 flex-1 overflow-y-auto px-5 py-5 space-y-4 text-xs sm:text-sm">
        {/* Welcome State if single initial greeting */}
        {messages.length === 1 && (
          <div className="py-6 px-3 text-center space-y-3.5 max-w-sm mx-auto">
            <div className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/16 flex items-center justify-center text-white mx-auto shadow-[0_0_25px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25)]">
              <Sparkles className="w-5 h-5 text-neutral-200" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white font-heading tracking-tight">
              How can I help your community?
            </h3>
            <p className="text-xs text-[#A5A7AB] leading-relaxed font-normal">
              Ask a question, explore a community concern, or get guidance from CIVIC AI.
            </p>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-opacity duration-200`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed text-xs sm:text-[13px] backdrop-blur-xl ${
                  isUser
                    ? 'bg-[#14161B]/90 text-[#FFFFFF] border border-white/15 rounded-tr-none shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18)]'
                    : 'bg-[#08090C]/80 text-[#ECECEC] border border-white/10 rounded-tl-none shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                }`}
              >
                <div className="whitespace-pre-wrap font-normal leading-relaxed">
                  {msg.content}
                </div>
              </div>
              <span className="text-[10px] text-[#73777D] mt-1 px-1 font-mono tracking-tight">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-start space-y-1">
            <div className="bg-[#08090C]/80 border border-white/10 backdrop-blur-xl rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-2 text-xs text-[#A5A7AB] shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '160ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '320ms' }} />
              <span className="text-[11px] text-[#73777D] ml-1 font-medium font-mono">CIVIC AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. QUICK SUGGESTION PILLS (Shown when conversation is short) */}
      {messages.length <= 3 && (
        <div className="relative z-10 px-4 pb-2 shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.query)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#08090C]/90 hover:bg-[#121418] border border-white/12 hover:border-white/30 text-[#A5A7AB] hover:text-white text-[11px] transition-all cursor-pointer disabled:opacity-50 shadow-sm backdrop-blur-md"
              >
                <span>{item.title}</span>
                <ArrowUpRight className="w-3 h-3 text-[#73777D]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. MESSAGE COMPOSER */}
      <div className="relative z-10 p-3.5 sm:p-4 bg-[#060709]/85 backdrop-blur-2xl border-t border-white/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center rounded-2xl bg-[#090A0D]/90 border border-white/12 focus-within:border-white/35 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask CIVIC AI anything..."
            disabled={loading}
            className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm text-[#F5F5F5] placeholder-[#73777D] resize-none focus:outline-none min-h-[44px] max-h-24"
            aria-label="Message CIVIC AI"
          />

          <div className="pr-2">
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-xl bg-white text-black disabled:bg-white/10 disabled:text-neutral-500 hover:bg-neutral-200 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
        <div className="text-[10px] text-center text-[#73777D] mt-2 font-mono tracking-tight">
          Enter to send · Shift + Enter for new line
        </div>
      </div>
    </div>
  );
};
export default CivicChatbot;
