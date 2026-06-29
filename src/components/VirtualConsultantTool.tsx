import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Database } from 'lucide-react';
import { analyzeDocument } from '../services/api';

const VirtualConsultantTool = () => {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const result = await analyzeDocument(text);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="grid lg:grid-cols-2 gap-12"
    >
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">AI Virtual <span className="text-accent">Consultant</span></h3>
        <p className="text-white/40 text-sm leading-relaxed">
          Upload project specs, internal strategy docs, or market reports. Our AI cross-references your private data with Survvi Opulence Insights's global industrial intelligence to identify hidden risks.
        </p>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your project document or strategy text here for immediate AI analysis..."
            className="w-full h-64 bg-brand/40 border border-white/10 rounded-3xl p-6 text-white text-sm focus:outline-none focus:border-accent transition-all resize-none"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              onClick={() => setText("")}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Clear
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="px-6 py-2 bg-accent text-brand rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze Document"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-brand/40 rounded-3xl p-8 border border-white/5 flex flex-col">
        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          Strategic Gap Analysis
        </h4>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : analysis ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-white/70 leading-relaxed whitespace-pre-wrap">
                {analysis}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-white/20">
              <Database className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-sm italic">Analysis results will appear here after you process a document.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VirtualConsultantTool;
