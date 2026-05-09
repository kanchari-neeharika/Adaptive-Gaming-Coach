import { useEffect, useState } from 'react';

// ─── Animated counter hook ───
function useCountUp(target, duration = 1200) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCurrent(target); clearInterval(timer); }
      else setCurrent(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return current;
}

// ─── SVG Semicircular Gauge ───
function SemiGauge({ probability, riskLevel }) {
  const [animProgress, setAnimProgress] = useState(0);
  
  useEffect(() => {
    let frame;
    let start = null;
    const duration = 1500; // Slower, smoother animation
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // Quart ease-out
      setAnimProgress(eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [probability]);

  const percent = probability * 100;
  const displayPercent = useCountUp(percent);
  const animatedProb = animProgress * probability;

  // SVG arc math - Refined for better fit
  const cx = 120, cy = 110, r = 85;
  const totalAngle = 180;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const polarToCart = (cx, cy, r, deg) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  // Start is always left (-180deg)
  const bgStart = polarToCart(cx, cy, r, -180);
  const bgEnd   = polarToCart(cx, cy, r, 0);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  // Foreground arc
  const fgAngle = -180 + (animatedProb * totalAngle);
  const fgEnd = polarToCart(cx, cy, r, fgAngle);
  
  // CRITICAL FIX: for a 180-degree gauge, the large-arc flag must ALWAYS be 0
  // because the arc is never > 180 degrees.
  const largeArc = 0; 
  
  const fgPath = animatedProb > 0
    ? `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArc} 1 ${fgEnd.x} ${fgEnd.y}`
    : '';

  // Color based on risk
  const gaugeColor = riskLevel === 'LOW' ? '#00ff88'
                   : riskLevel === 'MEDIUM' ? '#fbbf24'
                   : '#ff2d55';

  const blinkColors = { LOW: 'bg-[#00ff88]', MEDIUM: 'bg-[#fbbf24]', HIGH: 'bg-[#ff2d55]' };

  return (
    <div className="card flex flex-col items-center">
      <h3 className="font-orbitron text-xs tracking-widest text-[#64748b] mb-4">RAGE-QUIT RISK</h3>
      
      <svg width="240" height="140" viewBox="0 0 240 140" className="overflow-visible">
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ff2d55" />
          </linearGradient>
        </defs>
        
        {/* Background track */}
        <path d={bgPath} fill="none" stroke="#1e1e2e" strokeWidth="14" strokeLinecap="round" />
        
        {/* Subtle gradient guide */}
        <path d={bgPath} fill="none" stroke="url(#gauge-gradient)" strokeWidth="14"
          strokeLinecap="round" opacity="0.1" />
        
        {/* Active colored arc */}
        {fgPath && (
          <path d={fgPath} fill="none" stroke={gaugeColor} strokeWidth="14"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${gaugeColor})` }}
            className="transition-all duration-300"
          />
        )}

        {/* Indicator dot at the end of the arc */}
        {fgPath && (
          <circle 
            cx={fgEnd.x} cy={fgEnd.y} r="5" 
            fill="#fff" 
            style={{ filter: `drop-shadow(0 0 10px ${gaugeColor})` }}
          />
        )}
        
        {/* Center Text */}
        <text x={cx} y={cy - 5} textAnchor="middle"
          fill={gaugeColor} fontSize="38" fontWeight="900" fontFamily="JetBrains Mono"
          style={{ filter: `drop-shadow(0 0 12px ${gaugeColor}aa)` }}>
          {Math.round(displayPercent)}%
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle"
          fill="#64748b" fontSize="11" fontFamily="Orbitron" letterSpacing="4" opacity="0.6">
          RAGE RISK
        </text>
        
        {/* Scale labels - Positioned carefully relative to start/end points */}
        <text x="30" y="132" textAnchor="middle" fill="#475569" fontSize="10" fontFamily="Orbitron" fontWeight="bold">0%</text>
        <text x="210" y="132" textAnchor="middle" fill="#475569" fontSize="10" fontFamily="Orbitron" fontWeight="bold">100%</text>
      </svg>
      
      {/* Dynamic Status Pill */}
      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#1e1e2e] border border-white/5 mt-1 shadow-lg backdrop-blur-sm">
        <span className={`w-2.5 h-2.5 rounded-full ${blinkColors[riskLevel]} animate-pulse`} 
          style={{ boxShadow: `0 0 12px ${gaugeColor}` }}/>
        <span className="font-orbitron text-[11px] font-black tracking-widest"
          style={{ color: gaugeColor, textShadow: `0 0 10px ${gaugeColor}44` }}>
          {riskLevel} RISK
        </span>
      </div>
    </div>
  );
}


export default function RiskGauge({ data }) {
  if (!data) return (
    <div className="card flex flex-col items-center justify-center h-48 text-[#64748b] bg-[#1a1a24]/50 border-dashed border-2 border-white/5">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20 mb-3" />
      <span className="font-orbitron text-[10px] tracking-widest uppercase">Awaiting Neural Analysis...</span>
    </div>
  );
  return (
    <SemiGauge
      probability={data.rage_probability}
      riskLevel={data.rage_risk_level}
    />
  );
}

