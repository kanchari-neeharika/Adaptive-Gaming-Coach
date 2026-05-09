import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

const AXIS_LABELS = {
  stress_level:      'STRESS',
  anxiety_score:     'ANXIETY',
  loneliness_score:  'ISOLATION',
  gaming_intensity:  'GAMING',
  sleep_deprivation: 'SLEEP RISK',
  social_score:      'SOCIAL',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded px-3 py-2 text-xs shadow-2xl backdrop-blur-md">
        <p className="text-[#00ff88] font-orbitron font-bold tracking-wider">
          {payload[0].payload.axis}: {payload[0].value.toFixed(1)}/10
        </p>
      </div>
    );
  }
  return null;
};

const CustomDot = (props) => {
  const { cx, cy } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#00ff88" opacity="0.4" />
      <circle cx={cx} cy={cy} r={3} fill="#fff" stroke="#00ff88" strokeWidth={1.5}
        style={{ filter: 'drop-shadow(0 0 5px #00ff88)' }} />
    </g>
  );
};

export default function StatsRadar({ data }) {
  const radarData = data?.input_summary ? Object.entries(data.input_summary).map(([key, val]) => ({
    axis: AXIS_LABELS[key] || key.replace('_', ' ').toUpperCase(),
    value: Math.min(10, Math.max(0, val)),
    fullMark: 10,
  })) : [
    { axis: 'STRESS',     value: 0, fullMark: 10 },
    { axis: 'ANXIETY',    value: 0, fullMark: 10 },
    { axis: 'ISOLATION',  value: 0, fullMark: 10 },
    { axis: 'GAMING',     value: 0, fullMark: 10 },
    { axis: 'SLEEP RISK', value: 0, fullMark: 10 },
    { axis: 'SOCIAL',     value: 0, fullMark: 10 },
  ];

  return (
    <div className="card relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      
      <h3 className="font-orbitron text-xs tracking-[0.2em] text-[#64748b] mb-6 flex items-center gap-2">
        <span className="w-1 h-3 bg-[#00ff88] rounded-full" />
        BEHAVIORAL PROFILE
      </h3>
      
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Orbitron', fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Profile"
            dataKey="value"
            stroke="#00ff88"
            strokeWidth={3}
            fill="#00ff88"
            fillOpacity={0.15}
            dot={<CustomDot />}
            isAnimationActive={true}
            animationDuration={1500}
            animationBegin={100}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {!data && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-500 opacity-100">
           <p className="text-center text-[10px] font-orbitron tracking-widest text-[#64748b] uppercase animate-pulse">
            Awaiting Neural Mapping...
          </p>
        </div>
      )}
    </div>
  );
}

