import Box from '@mui/material/Box';
import type { TrainingSegment } from '../types';
import { getZoneColor } from '../utils/zones';

interface Props {
  segments: TrainingSegment[];
  currentIndex?: number;
  height?: number;
}

export default function ZoneCurvePreview({ segments, currentIndex, height = 80 }: Props) {
  const totalDuration = segments.reduce((sum, s) => sum + s.durationSeconds, 0);
  if (totalDuration === 0) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', height, gap: '1px', width: '100%' }}>
      {segments.map((seg, i) => {
        const widthPct = (seg.durationSeconds / totalDuration) * 100;
        const heightPct = (seg.targetZone / 5) * 100;
        const isActive = currentIndex === i;

        return (
          <Box
            key={seg.id}
            sx={{
              width: `${widthPct}%`,
              height: `${heightPct}%`,
              bgcolor: getZoneColor(seg.targetZone),
              opacity: isActive ? 1 : currentIndex !== undefined ? 0.4 : 0.8,
              borderRadius: '4px 4px 0 0',
              transition: 'opacity 0.3s',
              border: isActive ? '2px solid #fff' : 'none',
              minWidth: 4,
            }}
          />
        );
      })}
    </Box>
  );
}
