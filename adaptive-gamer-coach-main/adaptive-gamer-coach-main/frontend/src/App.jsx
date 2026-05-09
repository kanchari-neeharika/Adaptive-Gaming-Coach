import { useState, useEffect } from 'react';
import axios from 'axios';
import PlayerForm from './components/PlayerForm';
import RiskGauge from './components/RiskGauge';
import AddictionMeter from './components/AddictionMeter';
import StatsRadar from './components/StatsRadar';
import CoachingPanel from './components/CoachingPanel';
import { API_BASE_URL } from './constants';

// ─── Splash Screen ───
function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#0a0a0f', animation: 'fade-out 0.5s ease-in 2s both' }}>
      
      {/* Hex grid overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='104' viewBox='0 0 60 104'%3E%3Cpath d='M30 0 L60 17.3 L60 52 L30 69.3 L0 52 L0 17.3Z' fill='none' stroke='%2300ff88' stroke-width='0.5'/%3E%3C/svg%3E\")"
      }} />
      
      {/* Main title */}
      <div className="relative mb-4 text-center px-4">
        <h1
          className="glitch-text font-orbitron font-black text-center leading-none"
          data-text="ADAPTIVE GAMER"
          style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            color: '#00ff88',
            textShadow: '0 0 20px #00ff88, 0 0 60px #00ff8844',
            animation: 'glitch 2s infinite',
          }}
        >
          ADAPTIVE GAMER
        </h1>
        <h1
          className="glitch-text font-orbitron font-black text-center leading-none"
          data-text="COACH"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
            color: '#00d4ff',
            textShadow: '0 0 20px #00d4ff, 0 0 60px #00d4ff44',
            animation: 'glitch 2s infinite 0.1s',
          }}
        >
          COACH
        </h1>
      </div>

      {/* Subtitle */}
      <p className="font-rajdhani text-lg tracking-widest text-[#64748b] animate-pulse mt-4">
        BEHAVIORAL INTELLIGENCE SYSTEM v1.0
      </p>

      {/* Loading bar */}
      <div className="mt-12 w-64 h-0.5 bg-[#1e1e2e] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            boxShadow: '0 0 10px #00ff88',
            animation: 'load-bar 2.2s ease-out forwards',
          }}
        />
      </div>
      
      <style>{`
        @keyframes load-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes fade-out {
          to { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </div>
  );
}

// ─── Loading Overlay ───
const LOADING_TEXTS = [
  'Loading behavioral model...',
  'Analyzing patterns...',
  'Running predictions...',
  'Generating insights...',
];

function LoadingOverlay() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex(i => (i + 1) % LOADING_TEXTS.length);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center"
      style={{ background: 'rgba(10, 10, 15, 0.92)', backdropFilter: 'blur(4px)' }}>
      {/* Hexagonal loader */}
      <svg width="80" height="92" viewBox="0 0 80 92" className="mb-6">
        <polygon
          points="40,4 76,24 76,68 40,88 4,68 4,24"
          fill="none"
          stroke="#00ff88"
          strokeWidth="2"
          style={{
            filter: 'drop-shadow(0 0 8px #00ff88)',
            animation: 'hex-pulse 1s ease-in-out infinite',
          }}
        />
        <polygon
          points="40,18 62,30 62,62 40,74 18,62 18,30"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="1.5"
          style={{
            filter: 'drop-shadow(0 0 6px #00d4ff)',
            animation: 'hex-pulse 1s ease-in-out infinite 0.3s',
          }}
        />
        <polygon
          points="40,32 50,38 50,56 40,62 30,56 30,38"
          fill="#00ff8822"
          stroke="#7c3aed"
          strokeWidth="1"
          style={{
            animation: 'hex-pulse 1s ease-in-out infinite 0.6s',
          }}
        />
      </svg>
      <p className="font-orbitron text-sm tracking-widest"
        style={{ color: '#00d4ff', textShadow: '0 0 10px #00d4ff88' }}>
        {LOADING_TEXTS[textIndex]}
      </p>
    </div>
  );
}

// ─── Error Banner ───
function ErrorBanner({ message, onClose }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-lg max-w-lg w-[90%]"
      style={{
        background: '#ff2d5522',
        border: '1px solid #ff2d55',
        boxShadow: '0 0 20px #ff2d5544',
      }}>
      <span className="text-xl">🛑</span>
      <div className="flex-1">
        <p className="font-orbitron text-xs text-[#ff2d55] font-bold">API ERROR</p>
        <p className="text-xs text-[#e2e8f0] mt-0.5">{message}</p>
      </div>
      <button onClick={onClose}
        className="text-[#64748b] hover:text-[#e2e8f0] text-lg leading-none transition-colors">
        ×
      </button>
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (formValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, formValues, {
        timeout: 30000,
      });
      setPrediction(response.data);
    } catch (err) {
      let msg = 'Unknown error occurred.';
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        msg = 'Cannot reach the backend. Make sure FastAPI is running on localhost:8000.';
      } else if (err.response?.status === 503) {
        msg = 'Models not loaded. Run: cd ml && python train_models.py';
      } else if (err.response?.status === 422) {
        msg = 'Invalid input values. Check all fields are within expected ranges.';
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Splash screen */}
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      {/* Loading overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Error banner */}
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

      {/* ─── Main Layout ─── */}
      <div className="min-h-screen relative" style={{ zIndex: 1 }}>
        {/* Top bar */}
        <header className="border-b border-[#1e1e2e] px-6 py-3 flex items-center justify-between"
          style={{ background: '#12121a' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <span className="font-orbitron text-sm font-bold tracking-widest"
              style={{ color: '#00ff88', textShadow: '0 0 8px #00ff8888' }}>
              ADAPTIVE GAMER COACH
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#64748b] font-mono">ML v1.0</span>
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"
              title="Backend status" />
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-col lg:flex-row gap-0 lg:gap-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
          
          {/* ─── LEFT: Form ─── */}
          <aside className="lg:w-[38%] lg:sticky lg:top-6 lg:h-[calc(100vh-7rem)] card overflow-hidden">
            <PlayerForm onSubmit={handleAnalyze} isLoading={isLoading} />
          </aside>

          {/* ─── RIGHT: Results ─── */}
          <section className="lg:w-[62%] flex flex-col gap-4">
            
            {/* Row 1: RiskGauge + AddictionMeter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RiskGauge data={prediction} />
              <AddictionMeter data={prediction} />
            </div>

            {/* Row 2: StatsRadar */}
            <StatsRadar data={prediction} />

            {/* Row 3: CoachingPanel */}
            <CoachingPanel data={prediction} />

            {/* Footer note */}
            <div className="text-center py-4">
              <p className="text-xs text-[#64748b]">
                GRIET Department of Data Science · SRP/RTRP Project ·
                <span className="text-[#7c3aed]"> Behavioral ML Research</span>
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
