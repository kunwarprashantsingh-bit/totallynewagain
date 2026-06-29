import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Eye, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

interface TacticalVideoFeedProps {
  lat: number;
  lng: number;
  name: string;
  status: string;
}

type SpectrumMode = 'standard' | 'flir' | 'nightvision';

export const TacticalVideoFeed: React.FC<TacticalVideoFeedProps> = ({ lat, lng, name, status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spectrum, setSpectrum] = useState<SpectrumMode>('flir');
  const [isGlitching, setIsGlitching] = useState(false);
  const [signalStrength, setSignalStrength] = useState(98);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);

  // Ship targets simulation data
  const targetsRef = useRef<Array<{ x: number; y: number; size: number; speed: number; id: string; type: string }>>([]);

  // Initialize simulated targets near selected coordinates
  useEffect(() => {
    const types = ['CARGO', 'TANKER', 'BULKER', 'ESCORT'];
    targetsRef.current = Array.from({ length: 5 }).map((_, idx) => ({
      x: 50 + Math.random() * 200,
      y: 40 + Math.random() * 100,
      size: 4 + Math.random() * 8,
      speed: 0.1 + Math.random() * 0.3,
      id: `TGT-${100 + idx}`,
      type: types[idx % types.length]
    }));

    // Trigger glitch on target swap
    setIsGlitching(true);
    const t = setTimeout(() => setIsGlitching(false), 350);
    return () => clearTimeout(t);
  }, [name]);

  // Handle signal strength jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setSignalStrength(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(85, Math.min(100, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update system alerts based on status
  useEffect(() => {
    if (status === 'critical') {
      setSystemAlert('CRITICAL LOGISTICS CONGESTION / BLOCKAGE DECAL');
    } else if (status === 'congested') {
      setSystemAlert('HEAVY MARITIME TRAFFIC WARNING');
    } else {
      setSystemAlert(null);
    }
  }, [status]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;
    let sweepAngle = 0;

    const render = () => {
      frame++;
      sweepAngle = (sweepAngle + 0.015) % (Math.PI * 2);

      // Canvas dimensions
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Spectrum Base Colors
      if (spectrum === 'flir') {
        // High contrast thermal palette (black/blue base, orange/white hotspots)
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, width, height);
      } else if (spectrum === 'nightvision') {
        // Classic phosphorous green
        ctx.fillStyle = '#051307';
        ctx.fillRect(0, 0, width, height);
      } else {
        // Standard high-tech grey/monochrome
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw Simulated Terrain Lines (Sovereign Coastline Outline)
      ctx.beginPath();
      ctx.lineWidth = 1;
      if (spectrum === 'flir') {
        ctx.strokeStyle = 'rgba(197, 160, 89, 0.12)';
      } else if (spectrum === 'nightvision') {
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      }
      // Coast waves
      for (let x = 0; x < width; x += 10) {
        const yOffset = Math.sin((x / 50) + (frame / 40)) * 12 + (height / 2);
        if (x === 0) ctx.moveTo(x, yOffset);
        else ctx.lineTo(x, yOffset);
      }
      ctx.stroke();

      // 3. Draw Radar/Sonar Sweep (Visual cone of telemetry tracking)
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const radius = Math.max(width, height);
      const sweepWidth = 0.3; // radian width
      ctx.arc(0, 0, radius, sweepAngle - sweepWidth, sweepAngle);
      ctx.closePath();

      // Gradient for sweep
      const sweepGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
      if (spectrum === 'flir') {
        sweepGradient.addColorStop(0, 'rgba(197, 160, 89, 0.08)');
        sweepGradient.addColorStop(1, 'rgba(197, 160, 89, 0.0)');
      } else if (spectrum === 'nightvision') {
        sweepGradient.addColorStop(0, 'rgba(34, 197, 94, 0.12)');
        sweepGradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');
      } else {
        sweepGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        sweepGradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      }
      ctx.fillStyle = sweepGradient;
      ctx.fill();
      ctx.restore();

      // 4. Update and Draw Ship Targets
      targetsRef.current.forEach((tgt) => {
        // Slowly drift targets
        tgt.x += tgt.speed;
        if (tgt.x > width + 20) tgt.x = -20;

        // Draw thermal heat signature/visual box
        ctx.save();
        ctx.translate(tgt.x, tgt.y);

        // Core hotspot color
        if (spectrum === 'flir') {
          // Heat glow (orange to white)
          const radGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, tgt.size);
          radGrad.addColorStop(0, '#ffffff');
          radGrad.addColorStop(0.3, '#f97316');
          radGrad.addColorStop(0.7, '#ea580c');
          radGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(0, 0, tgt.size, 0, Math.PI * 2);
          ctx.fill();

          // Vector box
          ctx.strokeStyle = 'rgba(251, 146, 60, 0.6)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(-tgt.size - 2, -tgt.size / 2 - 2, tgt.size * 2 + 4, tgt.size + 4);
        } else if (spectrum === 'nightvision') {
          // Phosphorous glowing tracking dots
          ctx.fillStyle = 'rgba(74, 222, 128, 0.9)';
          ctx.beginPath();
          ctx.arc(0, 0, tgt.size / 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(74, 222, 128, 0.7)';
          ctx.lineWidth = 1;
          ctx.strokeRect(-tgt.size - 1, -tgt.size / 2 - 1, tgt.size * 2 + 2, tgt.size + 2);
        } else {
          // Vector tracking
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(-tgt.size, -tgt.size / 2, tgt.size * 2, tgt.size);
        }

        // Draw Tracking Bracket Labels & Telemetry near active ship
        if (frame % 300 > 50) {
          ctx.fillStyle = spectrum === 'nightvision' ? '#4ade80' : spectrum === 'flir' ? '#fb923c' : '#ffffff';
          ctx.font = '7px monospace';
          ctx.fillText(`${tgt.id}:${tgt.type}`, tgt.size + 4, -2);
          ctx.fillText(`SPD:${(tgt.speed * 42).toFixed(1)}KT`, tgt.size + 4, 6);
        }
        ctx.restore();
      });

      // 5. Centered UAV Tracking Crosshairs / Target Locking Bounds
      const cx = width / 2;
      const cy = height / 2;
      ctx.strokeStyle = spectrum === 'nightvision' ? 'rgba(74, 222, 128, 0.5)' : spectrum === 'flir' ? 'rgba(197, 160, 89, 0.5)' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;

      // Draw crosshair reticle
      ctx.beginPath();
      // Outer brackets
      ctx.moveTo(cx - 30, cy - 15); ctx.lineTo(cx - 30, cy - 30); ctx.lineTo(cx - 15, cy - 30);
      ctx.moveTo(cx + 15, cy - 30); ctx.lineTo(cx + 30, cy - 30); ctx.lineTo(cx + 30, cy - 15);
      ctx.moveTo(cx + 30, cy + 15); ctx.lineTo(cx + 30, cy + 30); ctx.lineTo(cx + 15, cy + 30);
      ctx.moveTo(cx - 15, cy + 30); ctx.lineTo(cx - 30, cy + 30); ctx.lineTo(cx - 30, cy + 15);
      
      // Center dot
      ctx.moveTo(cx - 4, cy); ctx.lineTo(cx + 4, cy);
      ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 4);
      ctx.stroke();

      // Rotating target lock bounds ring
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.setLineDash([4, 16]);
      ctx.strokeStyle = spectrum === 'nightvision' ? 'rgba(74, 222, 128, 0.3)' : spectrum === 'flir' ? 'rgba(197, 160, 89, 0.3)' : 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // 6. Draw Glitch Distortion (random scan lines or pixel shifting)
      if (isGlitching || (frame % 180 === 0 && Math.random() > 0.4)) {
        const sliceY = Math.floor(Math.random() * height);
        const sliceH = 8 + Math.floor(Math.random() * 20);
        const shiftX = (Math.random() > 0.5 ? 5 : -5) * (Math.random() * 3 + 1);
        
        ctx.drawImage(canvas, 0, sliceY, width, sliceH, shiftX, sliceY, width, sliceH);
        
        // Horizontal warning bar
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(0, sliceY, width, 2);
      }

      // 7. Horizontal Scanline Mesh overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
      }

      // 8. Visual HUD Text Overlay (Highly realistic intelligence metadata)
      ctx.fillStyle = spectrum === 'nightvision' ? '#4ade80' : spectrum === 'flir' ? '#c5a059' : '#ffffff';
      ctx.font = '8px monospace';

      // Top Left info
      ctx.fillText(`UAV SECURE TELEMETRY FEED // COMPOSITE`, 12, 18);
      ctx.fillText(`TARGET NODE: ${name.toUpperCase()}`, 12, 28);
      
      // Red dot "REC" blinker
      if (frame % 60 < 30) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(12, 40, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = spectrum === 'nightvision' ? '#4ade80' : spectrum === 'flir' ? '#c5a059' : '#ffffff';
        ctx.fillText("LIVE STREAM", 20, 43);
      } else {
        ctx.fillText("LIVE STREAM", 20, 43);
      }

      // Top Right info
      ctx.textAlign = 'right';
      ctx.fillText(`LAT: ${lat.toFixed(4)}°N`, width - 12, 18);
      ctx.fillText(`LNG: ${lng.toFixed(4)}°E`, width - 12, 28);
      ctx.fillText(`SIG STRENGTH: ${signalStrength}%`, width - 12, 38);

      // Bottom HUD info
      ctx.textAlign = 'left';
      ctx.fillText(`AZ: ${(180 + Math.sin(frame/100)*25).toFixed(1)}°  EL: ${(32 + Math.cos(frame/100)*4).toFixed(1)}°`, 12, height - 12);
      
      ctx.textAlign = 'right';
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      ctx.fillText(`UTC: ${timestamp}`, width - 12, height - 12);

      // Warning Indicator (If any)
      if (systemAlert) {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.font = 'bold 8px monospace';
        
        // Highlight background for warning label
        const alertW = ctx.measureText(systemAlert).width + 16;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect((width / 2) - (alertW / 2), height - 35, alertW, 14);
        ctx.strokeStyle = '#ef4444';
        ctx.strokeRect((width / 2) - (alertW / 2), height - 35, alertW, 14);

        ctx.fillStyle = '#ef4444';
        if (frame % 30 < 20) {
          ctx.fillText(systemAlert, width / 2, height - 25);
        }
      }

      ctx.textAlign = 'left'; // reset text align
      animationId = requestAnimationFrame(render);
    };

    // Trigger initial render
    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [spectrum, lat, lng, name, systemAlert, isGlitching]);

  const triggerReset = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 500);
  };

  return (
    <div className="w-full bg-black/60 border border-white/10 rounded-2xl overflow-hidden p-4 space-y-3 relative shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90">
            Satellite Reconnaissance / UAV-04
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] font-bold font-mono text-emerald-400 uppercase tracking-wider">
            Active Link
          </span>
        </div>
      </div>

      {/* Main Canvas Monitor */}
      <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border border-white/5">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={225} 
          className="w-full h-full object-cover transition-all duration-300"
        />
        
        {/* Absolute Scanning Overlay Line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-full h-0.5 bg-accent/20 shadow-[0_0_8px_rgba(197,160,89,0.5)] animate-scanline absolute left-0" />
        </div>
      </div>

      {/* HUD Telemetry Details and Interactive Mode Selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/5">
          {(['standard', 'flir', 'nightvision'] as SpectrumMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setSpectrum(mode);
                triggerReset();
              }}
              className={cn(
                "px-2 py-1 rounded text-[8px] font-extrabold uppercase tracking-widest transition-all",
                spectrum === mode 
                  ? "bg-accent text-brand shadow-sm" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {mode === 'standard' ? 'VIS' : mode === 'flir' ? 'FLIR' : 'IR'}
            </button>
          ))}
        </div>

        <button
          onClick={triggerReset}
          className="flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-widest text-white/40 hover:text-white transition-colors bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg"
        >
          <RefreshCw className={cn("w-3 h-3", isGlitching && "animate-spin")} />
          <span>Sync Signal</span>
        </button>
      </div>
    </div>
  );
};
