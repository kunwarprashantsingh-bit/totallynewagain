import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Sparkles, Send, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { ai } from '../services/geminiService';

const AIConsultant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Welcome to Survvi Opulence Insights. I am your Strategic AI Consultant. How can I assist with your industrial foresight today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userMsg,
        config: {
          systemInstruction: "You are a world-class industrial management consultant and AI strategist at Survvi Opulence Insights. Provide concise, high-level strategic advice on building materials, energy, and global supply chains. Use a professional, authoritative, and forward-thinking tone.",
        },
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I apologize, I am unable to process that request at the moment." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to strategic engine. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-brand/90 backdrop-blur-2xl border border-text/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-text/10 flex items-center justify-between bg-accent/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-text">Strategic Oracle</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-text/40 uppercase font-bold tracking-widest">Active Intelligence</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text/40 hover:text-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-xs leading-relaxed",
                    msg.role === 'user' ? "bg-accent text-brand font-bold" : "bg-surface border border-text/10 text-text/80"
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-text/40">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Synthesizing Signal...</span>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-text/10 bg-surface">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask the Oracle..."
                  className="w-full bg-brand border border-text/10 rounded-2xl px-4 py-3 text-xs text-text placeholder:text-text/20 focus:outline-none focus:border-accent/50 pr-12"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-accent rounded-xl flex items-center justify-center text-brand hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[8px] text-text/20 mt-3 text-center uppercase tracking-widest font-bold">
                Powered by Astraeus Industrial AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-accent rounded-2xl shadow-2xl flex items-center justify-center text-brand relative group"
      >
        <div className="absolute inset-0 bg-accent rounded-2xl animate-ping opacity-20 group-hover:opacity-40" />
        <MessageSquare className="w-8 h-8 relative z-10" />
      </motion.button>
    </div>
  );
};

export default AIConsultant;
