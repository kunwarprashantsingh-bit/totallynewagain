import React from 'react';
import { motion } from 'motion/react';
import { X, Compass, ArrowRight } from 'lucide-react';

export const MethodologyModal = ({ methodology, onClose, isOpen }: { methodology: any, onClose: () => void, isOpen?: boolean }) => {
  if (!isOpen || !methodology) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-brand-light border border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <Compass className="w-3 h-3" />
            Flight Deck Methodology
          </div>
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight">{methodology.title}</h3>
        </div>

        <div className="space-y-8">
          <p className="text-white/60 text-lg leading-relaxed">
            {methodology.content}
          </p>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent">Strategic Outcomes</h4>
            <div className="grid gap-3">
              {methodology.outcomes.map((outcome: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <span className="text-sm text-white/80">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Status</div>
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Deployment
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Proprietary ID</div>
              <div className="text-white font-mono text-sm">S-OP-{methodology.title.substring(0, 3).toUpperCase()}-2026</div>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-10 bg-white text-brand font-bold py-4 rounded-xl hover:bg-accent hover:text-brand transition-all"
        >
          Close Methodology
        </button>
      </motion.div>
    </div>
  );
};

export const FeatureCard = ({ icon: Icon, title, description, index, onOpenMethodology }: { icon: any, title: string, description: string, index: number, onOpenMethodology: (title: string) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={() => onOpenMethodology(title)}
    className="group p-8 bg-brand-light/30 border border-white/5 rounded-2xl hover:bg-brand-light/50 hover:border-accent/30 transition-all duration-500 flex flex-col h-full cursor-pointer"
  >
    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-brand transition-all duration-500">
      <Icon className="w-6 h-6 text-accent group-hover:text-brand" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-white/50 text-sm leading-relaxed mb-6 flex-grow">{description}</p>
    
    <div className="inline-flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest group/btn">
      View Methodology
      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
    </div>
  </motion.div>
);
