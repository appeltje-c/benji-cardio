import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useHeartRateStore } from '../stores/heartRateStore';
import { getZoneColor, getZoneConfig } from '../utils/zones';

export default function HeartRateDisplay() {
  const { bpm, zone } = useHeartRateStore();
  const zoneConfig = getZoneConfig(zone);
  const color = getZoneColor(zone);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        p: 3,
        borderRadius: 3,
        bgcolor: `${color}22`,
        border: `2px solid ${color}`,
      }}
    >
      <FavoriteIcon sx={{ fontSize: 48, color, animation: bpm > 0 ? 'pulse 1s infinite' : 'none', '@keyframes pulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' } } }} />
      <Typography variant="h1" sx={{ fontWeight: 700, color, fontSize: 72, lineHeight: 1 }}>
        {bpm || '--'}
      </Typography>
      <Typography variant="body1" sx={{ color, fontWeight: 600 }}>
        BPM
      </Typography>
      <Box
        sx={{
          mt: 1,
          px: 3,
          py: 0.5,
          borderRadius: 2,
          bgcolor: color,
          color: '#fff',
          fontWeight: 700,
        }}
      >
        Zone {zone} — {zoneConfig.label}
      </Box>
    </Box>
  );
}
