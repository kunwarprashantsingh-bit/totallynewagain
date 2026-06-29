import React, { useState, useEffect } from 'react';
import { 
  Lock, FileText, Download, BarChart2, ShieldCheck, UserCheck, 
  Wallet, Landmark, FolderHeart, ExternalLink, Trash2, Calendar, Radio, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface WorkspaceItem {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  savedType: string;
  savedAt: string;
}

const ClientPortal: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [savedItems, setSavedItems] = useState<WorkspaceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkspaceItem | null>(null);

  // Load saved workspace reports
  const loadWorkspace = () => {
    try {
      const saved = localStorage.getItem('ai_studio_workspace');
      if (saved) {
        setSavedItems(JSON.parse(saved));
      } else {
        setSavedItems([]);
      }
    } catch (e) {
      setSavedItems([]);
    }
  };

  useEffect(() => {
    loadWorkspace();
    // Listen for workspace updates from other tools
    const handleUpdate = () => loadWorkspace();
    window.addEventListener('ai_studio_add_workspace', handleUpdate);
    return () => window.removeEventListener('ai_studio_add_workspace', handleUpdate);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      setIsLoggedIn(true);
      loadWorkspace();
    }
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = savedItems.filter(item => item.id !== id);
      localStorage.setItem('ai_studio_workspace', JSON.stringify(updated));
      setSavedItems(updated);
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      // Notify App.tsx of deletion
      window.dispatchEvent(new CustomEvent('ai_studio_add_workspace_deleted'));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section id="client-portal" className="py-32 px-6 bg-[#040608] relative overflow-hidden border-t border-white/5">
      {/* Absolute Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            // Form Login State
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-20 items-center"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-6">
                  <Lock className="w-3 h-3 animate-pulse" />
                  Secure Sovereign Access
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Executive Client Portal</h2>
                <p className="text-white/40 text-lg leading-relaxed mb-10">
                  Access your encrypted strategic dossiers, cross-border carbon tariff models, and real-time private reserve allocations under a unified, ultra-secure terminal.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { icon: FileText, title: "Sovereign Briefings", desc: "Interact with saved physical assets, SAR intelligence, and compliance audits." },
                    { icon: Wallet, title: "Capital Placement", desc: "Review multi-billion private reserve balances and drawdowns." },
                    { icon: BarChart2, title: "Strategic Alpha", desc: "Monitor sovereign portfolios against inflation and currency risk." },
                    { icon: ShieldCheck, title: "Advanced Safeguards", desc: "Industry-grade encryption protecting high-net-worth sovereign actions." }
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <feature.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{feature.title}</h4>
                        <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login block card */}
              <div className="p-8 lg:p-12 bg-white/[0.02] border border-white/10 rounded-[40px] relative group">
                <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Member Login</h3>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Authorized Sovereign Access Only</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Work Email</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-brand-light border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-accent transition-all text-sm"
                        placeholder="analyst@sovereign.gov"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-brand-light border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-accent transition-all text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                    <button type="submit" className="w-full bg-accent text-brand font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase text-xs tracking-widest">
                      Access Terminal
                    </button>
                  </form>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/20">Demo Mode: Any Credentials Pass</span>
                    <a href="#" className="text-accent underline">Request Credentials</a>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // Logged-in State: Dynamic Boardroom Terminal
            <motion.div 
              key="portal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Header Profile Dashboard */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center">
                    <UserCheck className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Sovereign Executive Hub</h2>
                    <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">
                      Welcome back, <span className="text-accent font-bold">{email}</span>
                    </p>
                  </div>
                </div>

                {/* Capital Placement Summaries */}
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-center min-w-[150px]">
                    <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Total Assets (PE)</div>
                    <div className="text-lg font-black text-white">$2.45 Billion</div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-center min-w-[150px]">
                    <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Portfolio Alpha</div>
                    <div className="text-lg font-black text-emerald-400">+4.85% (G10 Benchmark)</div>
                  </div>
                  <button 
                    onClick={() => setIsLoggedIn(false)}
                    className="px-5 py-3.5 bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-white/60 hover:text-red-400 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Exit Terminal
                  </button>
                </div>
              </div>

              {/* Working Strategic Workspace Archive Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side List: Saved Briefings */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-brand/20 border border-white/5 rounded-3xl p-6 h-[540px] flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <FolderHeart className="w-5 h-5 text-accent" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Archived Strategic Dossiers</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-hide">
                      {savedItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                          <Radio className="w-8 h-8 text-white/20 animate-pulse" />
                          <div>
                            <p className="text-xs font-bold text-white/60">No Archived Briefings</p>
                            <p className="text-[10px] text-white/30 leading-relaxed mt-1">
                              Select a tool in the Client Intelligence Suite and click "Save to Workspace" to populate this interactive sovereign desk.
                            </p>
                          </div>
                        </div>
                      ) : (
                        savedItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={cn(
                              "p-4 bg-white/5 border rounded-2xl cursor-pointer hover:border-accent/40 transition-all flex justify-between items-start",
                              selectedItem?.id === item.id ? "border-accent bg-accent/5" : "border-white/5"
                            )}
                          >
                            <div className="space-y-1 flex-1 pr-4">
                              <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                              <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">{item.summary}</p>
                              
                              <div className="flex items-center gap-3 text-[8px] font-mono text-white/30 uppercase tracking-widest pt-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {new Date(item.savedAt).toLocaleDateString()}
                                </span>
                                <span className="text-accent">{item.savedType || 'Research'}</span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => handleDeleteItem(item.id, e)}
                              className="p-1.5 rounded-lg border border-transparent hover:border-red-500/20 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side Detail: Report Contents */}
                <div className="lg:col-span-7">
                  <div className="bg-brand/20 border border-white/5 rounded-3xl p-6 h-[540px] flex flex-col">
                    {selectedItem ? (
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                          <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">{selectedItem.title}</h4>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Archived under sovereign classification code</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-[8px] font-mono font-black text-accent bg-accent/10 rounded-full border border-accent/20 uppercase tracking-widest">
                              SECURE MEMO
                            </span>
                          </div>
                        </div>

                        {/* File Text Area */}
                        <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-5 overflow-y-auto font-mono text-[11px] text-white/80 leading-relaxed space-y-4 whitespace-pre-line scrollbar-hide">
                          {selectedItem.fullContent}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                        <FileText className="w-12 h-12 text-white/10" />
                        <div>
                          <p className="text-xs font-bold text-white/50">Dossier Workspace Active</p>
                          <p className="text-[10px] text-white/30 leading-relaxed max-w-sm mt-1">
                            Click on any archived dossier in your list to unpack the raw intelligence data, compliance guidelines, and simulation coefficients.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ClientPortal;
