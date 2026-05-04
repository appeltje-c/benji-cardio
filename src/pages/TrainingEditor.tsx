import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTrainingStore } from '../stores/trainingStore';
import { ZONE_CONFIGS, getZoneColor, formatTime } from '../utils/zones';
import ZoneCurvePreview from '../components/ZoneCurvePreview';
import type { Zone } from '../types';

export default function TrainingEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useTrainingStore();
  const training = store.trainings.find((t) => t.id === id);

  const [segMinutes, setSegMinutes] = useState(1);
  const [segSeconds, setSegSeconds] = useState(0);
  const [segZone, setSegZone] = useState<Zone>(3);

  if (!training || !id) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Training not found</Typography>
        <Button onClick={() => navigate('/')}>Go back</Button>
      </Box>
    );
  }

  const handleAddSegment = () => {
    const totalSec = segMinutes * 60 + segSeconds;
    if (totalSec <= 0) return;
    store.addSegment(id, totalSec, segZone);
  };

  const totalSeconds = training.segments.reduce((sum, s) => sum + s.durationSeconds, 0);

  return (
    <Box sx={{ pt: 'calc(env(safe-area-inset-top) + 16px)', px: 2, pb: 'calc(env(safe-area-inset-bottom) + 40px)', height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <TextField
          variant="standard"
          value={training.name}
          onChange={(e) => store.updateTrainingName(id, e.target.value)}
          sx={{ flex: 1 }}
          slotProps={{ input: { sx: { fontSize: 20, fontWeight: 700 } } }}
        />
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={() => navigate(`/player/${id}`)}
          disabled={training.segments.length === 0}
        >
          Play
        </Button>
      </Box>

      {/* Zone Curve Preview */}
      {training.segments.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Zone Curve — {formatTime(totalSeconds)} total
            </Typography>
            <Box sx={{ mt: 1 }}>
              <ZoneCurvePreview segments={training.segments} height={60} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Segments Section */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Training Segments
      </Typography>

      {training.segments.map((seg, idx) => (
        <Card key={seg.id} sx={{ mb: 1, borderLeft: `4px solid ${getZoneColor(seg.targetZone)}` }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography sx={{ fontWeight: 700, minWidth: 28 }}>
              {idx + 1}.
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.25,
                borderRadius: 1,
                bgcolor: getZoneColor(seg.targetZone),
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                whiteSpace: 'nowrap',
              }}
            >
              Z{seg.targetZone}
            </Box>
            <Typography sx={{ flex: 1 }}>
              {formatTime(seg.durationSeconds)}
            </Typography>
            <IconButton size="small" onClick={() => store.removeSegment(id, seg.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </CardContent>
        </Card>
      ))}

      {/* Add Segment Form */}
      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2">Add Segment</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              label="Min"
              type="number"
              value={segMinutes}
              onChange={(e) => setSegMinutes(Math.max(0, Number(e.target.value)))}
              slotProps={{ htmlInput: { min: 0, max: 120 } }}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Sec"
              type="number"
              value={segSeconds}
              onChange={(e) => setSegSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
              slotProps={{ htmlInput: { min: 0, max: 59 } }}
              sx={{ flex: 1 }}
            />
          </Box>
          <FormControl size="small" fullWidth>
            <InputLabel>Target Zone</InputLabel>
            <Select
              value={segZone}
              label="Target Zone"
              onChange={(e) => setSegZone(Number(e.target.value) as Zone)}
            >
              {ZONE_CONFIGS.map((z) => (
                <MenuItem key={z.zone} value={z.zone}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: z.color }} />
                    Zone {z.zone} — {z.label} ({z.minPct}-{z.maxPct}%)
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSegment}
            disabled={segMinutes * 60 + segSeconds <= 0}
          >
            Add Segment
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
