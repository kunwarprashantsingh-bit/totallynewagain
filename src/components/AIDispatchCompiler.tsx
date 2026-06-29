import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, Sparkles, FileText, Check, Cpu, ArrowRight, ShieldAlert, Coins, Leaf, Download, Play, Pause, Volume2, VolumeX, Headphones, Radio, Activity } from 'lucide-react';
import { ai } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Article {
  title: string;
  summary: string;
  source: string;
  date: string;
}

interface AIDispatchCompilerProps {
  articles: Article[];
  topic: string;
}

const PERSONAS = [
  {
    id: 'sro',
    name: 'Sober Risk Officer (SRO)',
    icon: ShieldAlert,
    color: 'text-red-400 border-red-500/20 bg-red-500/5 hover:border-red-500/40',
    activeColor: 'border-red-500 bg-red-500/10 text-red-400',
    role: 'Focuses on supply bottlenecks, raw material price spikes, draft capacity locks, and downside risk margins.'
  },
  {
    id: 'sca',
    name: 'Sovereign Capital Allocator (SCA)',
    icon: Coins,
    color: 'text-accent border-accent/20 bg-accent/5 hover:border-accent/40',
    activeColor: 'border-accent bg-accent/10 text-accent',
    role: 'Focuses on regional price spreads, arbitrage corridors, interest rate hedges, and macroeconomic alpha signals.'
  },
  {
    id: 'cso',
    name: 'Sustainability Chief (CSO)',
    icon: Leaf,
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40',
    activeColor: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
    role: 'Focuses on clinker-factor regulations, scope-3 logistics emissions, carbon border tax offsets (CBAM), and fuel fuel-cell shifts.'
  }
];

const AIDispatchCompiler: React.FC<AIDispatchCompilerProps> = ({ articles, topic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [activePersona, setActivePersona] = useState('sro');
  const [loading, setLoading] = useState(false);
  const [compilingStep, setCompilingStep] = useState('');
  const [briefing, setBriefing] = useState<string | null>(null);

  // Voice Briefing Audio states
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentParaIdx, setCurrentParaIdx] = useState(-1);
  const [isDroneMuted, setIsDroneMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<any>(null);
  const droneNodesRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Parse briefing into individual paragraphs for highlighting
  const paragraphs = useMemo(() => {
    if (!briefing) return [];
    return briefing
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }, [briefing]);

  // Handle ambient corporate synth drone
  const startDrone = () => {
    try {
      if (isDroneMuted) return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.value = 55; // low A1 drone

      osc2.type = 'triangle';
      osc2.frequency.value = 55.3; // detuned chorusing hum

      filter.type = 'lowpass';
      filter.frequency.value = 110; // warm, filtered hum
      filter.Q.value = 1.2;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5); // very quiet

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      droneNodesRef.current = { osc1, osc2, gainNode, filter };
    } catch (e) {
      console.error("Web Audio drone failed", e);
    }
  };

  const stopDrone = () => {
    try {
      const ctx = audioCtxRef.current;
      const nodes = droneNodesRef.current;
      if (nodes && ctx) {
        nodes.gainNode.gain.cancelScheduledValues(ctx.currentTime);
        nodes.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        setTimeout(() => {
          try {
            nodes.osc1.stop();
            nodes.osc2.stop();
            ctx.close();
          } catch (e) {}
        }, 600);
      }
      audioCtxRef.current = null;
      droneNodesRef.current = null;
    } catch (e) {}
  };

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // Draw subtle tech grid lines in background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      const activeFactor = isPlayingVoice ? 1 : 0.15;
      const speedFactor = isPlayingVoice ? 0.08 : 0.015;

      // Draw multiple colored transparent sine waves
      const waves = [
        { color: 'rgba(197, 160, 89, 0.4)', amp: 18 * activeFactor, freq: 0.012, speed: 1 },
        { color: 'rgba(255, 255, 255, 0.15)', amp: 10 * activeFactor, freq: 0.02, speed: 1.5 },
        { color: 'rgba(197, 160, 89, 0.1)', amp: 25 * activeFactor, freq: 0.007, speed: 0.7 },
      ];

      waves.forEach(w => {
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * w.freq + phase * w.speed) * w.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      phase += speedFactor;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlayingVoice]);

  // Clean raw markdown text for clean narration
  const cleanTextForNarration = (text: string) => {
    return text
      .replace(/#+\s*/g, '') // remove headings
      .replace(/\*\*/g, '') // remove bolding
      .replace(/\*/g, '') // remove italic bullets
      .replace(/-\s*/g, '') // remove bullet points
      .trim();
  };

  // Speak specific paragraph
  const speakParagraph = (idx: number) => {
    if (idx < 0 || idx >= paragraphs.length) {
      // reached end
      setIsPlayingVoice(false);
      setCurrentParaIdx(-1);
      stopDrone();
      return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const rawPara = paragraphs[idx];
    const speechText = cleanTextForNarration(rawPara);

    const utterance = new SpeechSynthesisUtterance(speechText);
    
    // Choose professional english voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = playbackSpeed;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setCurrentParaIdx(idx);
    };

    utterance.onend = () => {
      speakParagraph(idx + 1);
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error", e);
      // fallback to next
      if (isPlayingVoice) {
        speakParagraph(idx + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPauseVoice = () => {
    if (isPlayingVoice) {
      // Pause/Stop
      window.speechSynthesis.cancel();
      stopDrone();
      setIsPlayingVoice(false);
      setCurrentParaIdx(-1);
    } else {
      // Start Playback
      setIsPlayingVoice(true);
      startDrone();
      speakParagraph(0);
    }
  };

  // Change playback speed dynamically
  useEffect(() => {
    if (isPlayingVoice && currentParaIdx >= 0) {
      // Re-trigger current paragraph with new speed
      speakParagraph(currentParaIdx);
    }
  }, [playbackSpeed]);

  // Handle muting drone dynamically
  useEffect(() => {
    if (isDroneMuted) {
      stopDrone();
    } else if (isPlayingVoice && !audioCtxRef.current) {
      startDrone();
    }
  }, [isDroneMuted]);

  // Clean up on component close or modal close
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
      stopDrone();
      setIsPlayingVoice(false);
      setCurrentParaIdx(-1);
    }
    return () => {
      window.speechSynthesis.cancel();
      stopDrone();
    };
  }, [isOpen]);

  const toggleArticleSelect = (idx: number) => {
    setSelectedArticles(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : prev.length < 3 ? [...prev, idx] : prev
    );
  };

  const handleCompile = async () => {
    if (selectedArticles.length === 0) return;
    setLoading(true);
    setBriefing(null);

    const steps = [
      "Securing industrial data packets...",
      "Executing NLP news entity correlation maps...",
      "Injecting strategic macro-risk overlays...",
      "Structuring executive directive brief..."
    ];

    // Staggered status updates for high-end terminal feel
    for (let i = 0; i < steps.length; i++) {
      setCompilingStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const selectedList = selectedArticles.map(idx => articles[idx]);
    const articlesText = selectedList.map((art, i) => 
      `ARTICLE ${i+1}:\nTitle: ${art.title}\nSource: ${art.source}\nSummary: ${art.summary}`
    ).join("\n\n");

    const persona = PERSONAS.find(p => p.id === activePersona);

    const systemPrompt = `You are an elite, top-tier industrial intelligence analyst operating under the executive persona: "${persona?.name}".
Your task is to analyze raw commodity and logistics news summaries for the topic "${topic}" and compile a pristine, high-impact Executive Intelligence Briefing.

Maintain an authoritative, sober, and exceptionally professional tone. Structure your response into exactly three beautifully laid out sections with standard markdown headings:

# EXECUTIVE BRIEFING: ${topic.toUpperCase()} STRATEGIC ANALYSIS
Provide a cohesive, highly synthesized macro overview connecting the selected stories. Frame the general landscape and what it means for major industrial bulk buyers and energy allocators.

# CORE VULNERABILITIES & ALPHA EXPOSURES
Identify 2-3 specific strategic exposures, supply-chain frictions, or price-difference opportunities based on the stories. Write these with precise, punchy bullet points.

# TACTICAL ACTIONS REQUIRED
Deliver 3 highly tactical, actionable procurement or hedging recommendations for the board of directors. Include clear, risk-managed strategies.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze these recent news bulletins:\n\n${articlesText}`,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      setBriefing(response.text || "Failed to generate dispatch.");
    } catch (err) {
      console.error(err);
      setBriefing("An error occurred during Gemini strategic processing. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWorkspace = () => {
    if (!briefing) return;
    
    const item = {
      id: `ai-briefing-${topic}-${Date.now()}`,
      title: `AI Intelligence Briefing (${topic})`,
      summary: briefing.slice(0, 200) + "...",
      fullContent: briefing,
      date: new Date().toLocaleDateString(),
      source: `Survvi AI - ${PERSONAS.find(p => p.id === activePersona)?.name}`
    };

    // Dispatch custom event to sync with App.tsx workspace array
    const event = new CustomEvent('ai_studio_add_workspace', {
      detail: { item, type: 'research' }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="w-full flex flex-col items-center mt-12 border-t border-white/10 pt-12">
      <div className="bg-gradient-to-r from-accent/10 via-brand-light/5 to-transparent border border-accent/20 rounded-2xl p-6 lg:p-8 max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center shrink-0 border border-accent/30 shadow-lg shadow-accent/10">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-wider">AI Executive Intelligence Dispatch</h4>
            <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-lg">
              Aggregate raw industry updates, select an executive persona, and compile an authoritative board briefing processed by Google Gemini.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-accent text-brand font-bold uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all shadow-lg shadow-accent/20 shrink-0"
        >
          Launch Dispatch Builder
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-brand-dark/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Top Banner */}
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-accent animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">Survvi AI Intel Briefing Compiler</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white flex items-center justify-center text-sm font-bold uppercase"
                >
                  ✕
                </button>
              </div>

              {/* Main compiler split pane */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-8 grid lg:grid-cols-12 gap-8">
                
                {/* Left controls: 7 span */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Step 1: Select Articles */}
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-accent mb-3 flex items-center gap-1.5">
                      <Newspaper className="w-3.5 h-3.5" />
                      Step 1: Select Up to 3 Articles ({selectedArticles.length}/3)
                    </h5>
                    
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 scrollbar-hide">
                      {articles.map((art, idx) => {
                        const isSelected = selectedArticles.includes(idx);
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleArticleSelect(idx)}
                            className={cn(
                              "p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3",
                              isSelected 
                                ? "border-accent bg-accent/5 text-white" 
                                : "border-white/5 bg-white/5 hover:border-white/20 text-white/70"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                              isSelected ? "border-accent bg-accent text-brand" : "border-white/20"
                            )}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-accent uppercase">{art.source}</span>
                                <span className="text-[9px] text-white/30 font-mono">{art.date}</span>
                              </div>
                              <h6 className="text-xs font-bold mt-1 line-clamp-1">{art.title}</h6>
                              <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">{art.summary}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Select Persona */}
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-accent mb-3 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      Step 2: Assign Strategic Analysis Persona
                    </h5>
                    
                    <div className="grid sm:grid-cols-3 gap-3">
                      {PERSONAS.map((p) => {
                        const Icon = p.icon;
                        const isSelected = activePersona === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setActivePersona(p.id)}
                            className={cn(
                              "p-4 rounded-xl border text-left flex flex-col justify-between transition-all gap-3 h-36",
                              isSelected ? p.activeColor : p.color
                            )}
                          >
                            <Icon className="w-5 h-5 shrink-0" />
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider block">{p.name}</span>
                              <p className="text-[8px] text-white/40 mt-1 leading-snug line-clamp-2">{p.role}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit compile button */}
                  <button
                    onClick={handleCompile}
                    disabled={selectedArticles.length === 0 || loading}
                    className="w-full py-4 bg-accent text-brand rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent/90 disabled:opacity-40 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Compile Custom AI Briefing
                  </button>

                </div>

                {/* Right briefing display: 5 span */}
                <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto max-h-[500px]">
                  
                  {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                      <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                        <div className="absolute inset-0 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                        <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                      </div>
                      <span className="text-xs font-mono text-accent animate-pulse">{compilingStep}</span>
                      <span className="text-[9px] text-white/30 uppercase tracking-widest mt-2 font-black">Connecting to Gemini...</span>
                    </div>
                  ) : briefing ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col justify-between"
                    >
                      {/* Premium Strategic Voice Briefing Controller */}
                      <div className="bg-[#090b0e] border border-white/10 rounded-2xl p-4 mb-4 shadow-xl space-y-3 relative overflow-hidden">
                        {/* Audio Canvas visualizer */}
                        <div className="h-14 w-full relative bg-black/40 rounded-xl overflow-hidden border border-white/5">
                          <canvas 
                            ref={canvasRef} 
                            width={320} 
                            height={56} 
                            className="w-full h-full block"
                          />
                          <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[8px] font-black tracking-widest text-accent uppercase">
                            <Radio className={cn("w-3 h-3 text-accent", isPlayingVoice && "animate-pulse")} />
                            {isPlayingVoice ? "Sovereign Briefing Active" : "Voice Synthesizer Ready"}
                          </div>
                          
                          {isPlayingVoice && (
                            <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[8px] font-mono text-white/40 uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              Ambient Drone Active
                            </div>
                          )}
                        </div>

                        {/* Player controls */}
                        <div className="flex items-center justify-between gap-3">
                          <button
                            onClick={handlePlayPauseVoice}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all border shrink-0",
                              isPlayingVoice 
                                ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white"
                                : "bg-accent text-brand border-accent hover:scale-[1.02]"
                            )}
                          >
                            {isPlayingVoice ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                Pause Briefing
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                Listen to Briefing
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            {/* Ambient synth volume controller */}
                            <button
                              onClick={() => setIsDroneMuted(!isDroneMuted)}
                              className={cn(
                                "p-2 rounded-xl border transition-all",
                                isDroneMuted 
                                  ? "bg-white/5 border-white/10 text-white/30" 
                                  : "bg-accent/10 border-accent/20 text-accent hover:bg-accent hover:text-brand"
                              )}
                              title={isDroneMuted ? "Enable Ambient Synth Drone" : "Mute Ambient Synth Drone"}
                            >
                              {isDroneMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>

                            {/* Speed selector */}
                            <div className="flex border border-white/10 bg-white/5 rounded-xl overflow-hidden p-0.5">
                              {[1.0, 1.25, 1.5].map(speed => (
                                <button
                                  key={speed}
                                  onClick={() => setPlaybackSpeed(speed)}
                                  className={cn(
                                    "px-2 py-1.5 rounded-lg text-[9px] font-black transition-all",
                                    playbackSpeed === speed 
                                      ? "bg-accent text-brand font-black" 
                                      : "text-white/40 hover:text-white"
                                  )}
                                >
                                  {speed}x
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 font-sans text-xs text-white/80 leading-relaxed overflow-y-auto pr-2 scrollbar-hide space-y-4 max-h-[220px]">
                        {paragraphs.map((para, i) => {
                          const isHeading = para.startsWith('#');
                          const isCurrent = currentParaIdx === i;
                          
                          if (isHeading) {
                            return (
                              <h4 key={i} className={cn(
                                "text-sm font-extrabold text-accent uppercase tracking-wider border-b border-white/5 pb-1 mt-4 transition-all duration-300",
                                isCurrent && "text-white scale-[1.02] border-accent/30 shadow-[0_4px_12px_rgba(197,160,89,0.15)]"
                              )}>
                                {para.replace(/#/g, '').trim()}
                              </h4>
                            );
                          }
                          
                          return (
                            <p 
                              key={i} 
                              className={cn(
                                "transition-all duration-300 p-2.5 rounded-lg border border-transparent",
                                isCurrent 
                                  ? "bg-accent/10 border-accent/20 text-white shadow-[0_4px_12px_rgba(197,160,89,0.08)] font-medium translate-x-1" 
                                  : "text-white/70"
                              )}
                            >
                              {para}
                            </p>
                          );
                        })}
                      </div>

                      <div className="mt-6 pt-5 border-t border-white/5 flex gap-3">
                        <button
                          onClick={handleAddToWorkspace}
                          className="flex-1 py-3 bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white hover:bg-accent hover:text-brand transition-all flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Save to Strategic Workspace
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-white/20">
                      <FileText className="w-12 h-12 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-wider">No Briefing Compiled</span>
                      <p className="text-[10px] text-white/40 mt-1 max-w-[200px]">Select articles on the left, pick an executive analyzer, and compile your boards Briefing.</p>
                    </div>
                  )}

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIDispatchCompiler;
