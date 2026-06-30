import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Handshake, Users, ChevronRight, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  agent: 'Acquirer AI' | 'Target AI';
  text: string;
  type: 'offer' | 'counter' | 'analysis';
}

const mockChat: Message[] = [
  { agent: 'Acquirer AI', text: 'Initial offer generated: $45.2B cash + stock mix. Premium of 18% over 30-day VWAP.', type: 'offer' },
  { agent: 'Target AI', text: 'Analyzing offer... Rejecting based on internal synergy models indicating $5B unrecognized IP value.', type: 'analysis' },
  { agent: 'Target AI', text: 'Counter-offer proposed: $52.0B. Requirement: Retention of core R&D team for 36 months.', type: 'counter' },
  { agent: 'Acquirer AI', text: 'Evaluating counter... Synergy overlap detected in R&D. Proposing $48.5B with earn-outs.', type: 'offer' }
];

export function AutonomousNegotiationSimulator() {
  const [messages, setMessages] = useState<Message[]>([mockChat[0]]);
  const [isRunning, setIsRunning] = useState(false);

  const simulateNext = () => {
    if (messages.length < mockChat.length) {
      setMessages(prev => [...prev, mockChat[prev.length]]);
    }
  };

  return (
    <div className="w-full h-full bg-brand p-6 rounded-3xl border border-white/5 flex flex-col gap-6 text-white font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20">
            <Handshake className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h3 className="text-xl font-medium tracking-tight">Autonomous M&A Simulator</h3>
            <p className="text-sm text-gray-400">Multi-Agent game theory negotiation modeling</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setIsRunning(!isRunning);
            if (!isRunning) {
              const int = setInterval(() => {
                setMessages(prev => {
                  if(prev.length < mockChat.length) return [...prev, mockChat[prev.length]];
                  clearInterval(int);
                  setIsRunning(false);
                  return prev;
                });
              }, 2000);
            }
          }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
            isRunning ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 hover:bg-fuchsia-500/20"
          )}
        >
          {isRunning ? 'Halt Simulation' : 'Run Agent Simulation'}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
        {/* Left: Agents Setup */}
        <div className="flex flex-col gap-4">
          <div className="p-5 bg-brand-light/20 rounded-2xl border border-white/5 flex flex-col gap-4">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Bot className="w-4 h-4 text-fuchsia-400" />
              Acquirer Agent (Alpha)
            </h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between"><span>Max Valuation:</span> <span className="text-white">$50.0B</span></div>
              <div className="flex justify-between"><span>Strategy:</span> <span className="text-white">Aggressive Cost Synergy</span></div>
              <div className="flex justify-between"><span>Patience Factor:</span> <span className="text-white">Low</span></div>
            </div>
          </div>
          <div className="flex items-center justify-center -my-2 z-10">
            <Zap className="w-5 h-5 text-gray-500" />
          </div>
          <div className="p-5 bg-brand-light/20 rounded-2xl border border-white/5 flex flex-col gap-4">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Target Agent (Beta)
            </h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between"><span>Min Acceptable:</span> <span className="text-white">$48.0B</span></div>
              <div className="flex justify-between"><span>Strategy:</span> <span className="text-white">IP Defense / Talent Retention</span></div>
              <div className="flex justify-between"><span>Patience Factor:</span> <span className="text-white">High</span></div>
            </div>
          </div>
        </div>

        {/* Right: Live Chat / Simulation Log */}
        <div className="lg:col-span-2 bg-brand-light/20 rounded-2xl border border-white/5 flex flex-col overflow-hidden relative">
          <div className="p-4 border-b border-white/5 bg-brand/50 backdrop-blur-sm z-10">
            <h4 className="text-sm font-medium text-gray-300">Live Agent Negotiation Log</h4>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "max-w-[80%] p-4 rounded-xl border border-white/5",
                    msg.agent === 'Acquirer AI' ? "bg-fuchsia-500/10 self-start rounded-tl-sm" : "bg-cyan-500/10 self-end rounded-tr-sm"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      msg.agent === 'Acquirer AI' ? "text-fuchsia-400" : "text-cyan-400"
                    )}>
                      {msg.agent}
                    </span>
                    <span className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded bg-brand">
                      {msg.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{msg.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            {isRunning && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="self-center flex items-center gap-2 text-xs text-gray-500 my-4"
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                Agents computing Nash Equilibrium...
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
