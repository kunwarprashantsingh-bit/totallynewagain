import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, TrendingUp, TrendingDown } from 'lucide-react';
import { SECTORS } from '../constants';

const PRIME_ALERTS_MOCK = [
  { id: 1, type: 'critical', text: 'Unusual Volume Detected in Defense & Aerospace sector.', trend: 'up' },
  { id: 2, type: 'warning', text: 'Iron Ore spot prices fluctuating ±4% in Asian markets.', trend: 'down' },
  { id: 3, type: 'info', text: 'New ESG Compliance mandate released for EU Building Materials.', trend: 'up' }
];

export const PrimeAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Simulate real-time prime alerts appearing
    const timer = setTimeout(() => {
      setAlerts([PRIME_ALERTS_MOCK[0]]);
    }, 3000);
    
    const timer2 = setTimeout(() => {
      setAlerts(prev => [...prev, PRIME_ALERTS_MOCK[1]]);
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`w-80 rounded-xl p-4 shadow-xl border relative overflow-hidden backdrop-blur-md flex gap-3
              ${alert.type === 'critical' ? 'bg-red-900/40 border-red-500/50' : 
                alert.type === 'warning' ? 'bg-orange-900/40 border-orange-500/50' : 
                'bg-brand-light/80 border-accent/30'}`}
          >
            <div className={`mt-0.5
              ${alert.type === 'critical' ? 'text-red-400' : 
                alert.type === 'warning' ? 'text-orange-400' : 
                'text-accent'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider
                  ${alert.type === 'critical' ? 'text-red-300' : 
                    alert.type === 'warning' ? 'text-orange-300' : 
                    'text-accent'}`}>
                  Prime Alert
                </span>
                <button onClick={() => dismissAlert(alert.id)} className="text-text/50 hover:text-text">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm text-text/90 leading-tight">{alert.text}</p>
              
              <div className="mt-2 flex items-center gap-1">
                {alert.trend === 'up' ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                <span className="text-[10px] text-text/50 uppercase tracking-widest">Real-Time Data Node</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
