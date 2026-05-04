import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useHeartRateStore } from '../stores/heartRateStore';
import { useProfileStore } from '../stores/profileStore';
import { ZONE_CONFIGS } from '../utils/zones';

interface Props {
  totalDurationMs: number;
  height?: number;
}

export default function HeartRateChart({ totalDurationMs, height = 80 }: Props) {
  const history = useHeartRateStore((s) => s.history);
  const minBpm = useHeartRateStore((s) => s.minBpm);
  const maxBpmRecorded = useHeartRateStore((s) => s.maxBpm);
  const maxHR = useProfileStore((s) => s.getMaxHR());

  if (history.length < 2 || totalDurationMs <= 0) return null;

  const minDisplay = Math.round(maxHR * 0.4);
  const maxDisplay = maxHR;
  const range = maxDisplay - minDisplay;

  const svgWidth = 300;
  const points = history.map((p) => {
    const x = (p.timeMs / totalDurationMs) * svgWidth;
    const y = height - ((Math.min(p.bpm, maxDisplay) - minDisplay) / range) * height;
    return `${Math.min(svgWidth, Math.max(0, x))},${Math.max(0, Math.min(height, y))}`;
  });
  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L${points[points.length - 1].split(',')[0]},${height} L${points[0].split(',')[0]},${height} Z`;

  // Zone threshold lines
  const zoneLines = ZONE_CONFIGS.slice(0, -1).map((z) => {
    const bpm = Math.round((z.maxPct / 100) * maxHR);
    const y = height - ((bpm - minDisplay) / range) * height;
    return { y: Math.max(0, Math.min(height, y)), color: z.color };
  });

  return (
    <Box>
      <Box sx={{ width: '100%', height, position: 'relative', borderRadius: 1, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.03)' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${svgWidth} ${height}`} preserveAspectRatio="none">
          {zoneLines.map((line, i) => (
            <line
              key={i}
              x1={0}
              y1={line.y}
              x2={svgWidth}
              y2={line.y}
              stroke={line.color}
              strokeWidth="0.5"
              strokeDasharray="4 3"
              opacity={0.4}
            />
          ))}
          <path d={areaPath} fill="url(#hrGradient)" opacity={0.3} />
          <path d={linePath} fill="none" stroke="#F44336" strokeWidth="1.5" />
          <defs>
            <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F44336" />
              <stop offset="100%" stopColor="#F44336" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
      {minBpm > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Low: {minBpm} BPM
          </Typography>
          <Typography variant="caption" color="text.secondary">
            High: {maxBpmRecorded} BPM
          </Typography>
        </Box>
      )}
    </Box>
  );
}
