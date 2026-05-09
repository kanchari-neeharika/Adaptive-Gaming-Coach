const CATEGORY_COLORS = {
  break:    '#ff2d55',
  health:   '#00d4ff',
  gameplay: '#7c3aed',
  mental:   '#00ff88',
};

const CATEGORY_LABELS = {
  break:    'REST',
  health:   'HEALTH',
  gameplay: 'GAMEPLAY',
  mental:   'MENTAL',
};

function TipCard({ tip, index }) {
  const color = CATEGORY_COLORS[tip.category] || '#00d4ff';
  
  return (
    <div
      className="animate-in rounded-lg p-4 mb-3 transition-all duration-200 hover:brightness-110 cursor-default"
      style={{
        background: '#12121a',
        border: '1px solid #1e1e2e',
        borderLeft: `3px solid ${color}`,
        animationDelay: `${index * 150}ms`,
        animationFillMode: 'both',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{tip.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-orbitron font-bold px-1.5 py-0.5 rounded"
              style={{
                color,
                background: color + '22',
                border: `1px solid ${color}44`,
                fontSize: '9px',
                letterSpacing: '0.1em',
              }}
            >
              {CATEGORY_LABELS[tip.category] || tip.category.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-[#e2e8f0] leading-relaxed">{tip.text}</p>
        </div>
      </div>
    </div>
  );
}

export default function CoachingPanel({ data }) {
  const tips = data?.coaching_tips || [];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-orbitron text-xs tracking-widest flex items-center gap-2"
          style={{ color: '#00d4ff', textShadow: '0 0 8px #00d4ff88' }}>
          <span>🧠</span>
          COACHING RECOMMENDATIONS
        </h3>
        {data && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(data, null, 2));
            }}
            className="text-xs text-[#64748b] hover:text-[#00d4ff] transition-colors px-2 py-1 rounded border border-[#1e1e2e] hover:border-[#00d4ff44]"
            title="Copy results as JSON"
          >
            COPY JSON
          </button>
        )}
      </div>
      
      {tips.length > 0 ? (
        <div>
          {tips.map((tip, i) => (
            <TipCard key={i} tip={tip} index={i} />
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-4">🎮</div>
          <p className="font-orbitron text-sm text-[#64748b] tracking-widest">AWAITING ANALYSIS</p>
          <p className="text-xs text-[#64748b] mt-2 max-w-48">
            Enter your gaming profile on the left and click ANALYZE PLAYER
          </p>
        </div>
      )}
    </div>
  );
}
