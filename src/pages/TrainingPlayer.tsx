import { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import FavoriteIcon from '@mui/icons-material/Favorite';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useTrainingStore } from '../stores/trainingStore';
import { usePlayerStore } from '../stores/playerStore';
import { useHeartRateStore } from '../stores/heartRateStore';
import { useProfileStore } from '../stores/profileStore';
import { useSpotifyStore } from '../stores/spotifyStore';
import { getZoneColor, getZoneConfig, formatTimeMs, formatTime, getEffortGuidance, getTargetBpmRange } from '../utils/zones';
import ZoneCurvePreview from '../components/ZoneCurvePreview';
import HeartRateChart from '../components/HeartRateChart';

export default function TrainingPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const training = useTrainingStore((s) => s.trainings.find((t) => t.id === id));
  const player = usePlayerStore();
  const { bpm, zone: hrZone, isConnected, resetHistory, calories } = useHeartRateStore();
  const maxHR = useProfileStore((s) => s.getMaxHR());
  const spotify = useSpotifyStore();
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const prevSegmentIndexRef = useRef<number>(-1);

  const currentSegment = player.training?.segments[player.currentSegmentIndex];
  const targetZone = currentSegment?.targetZone ?? 1;
  const targetColor = getZoneColor(targetZone);
  const targetConfig = getZoneConfig(targetZone);

  // Game loop
  const tick = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTickRef.current;
    lastTickRef.current = now;
    usePlayerStore.getState().tick(delta);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Start/stop game loop
  useEffect(() => {
    if (player.status === 'playing') {
      lastTickRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [player.status, tick]);

  // Track segment changes
  useEffect(() => {
    if (player.status !== 'playing' || !player.training) return;
    prevSegmentIndexRef.current = player.currentSegmentIndex;
  }, [player.currentSegmentIndex, player.status, player.training]);

  // Pause Spotify when training finishes
  useEffect(() => {
    if (player.status === 'finished' && spotify.isConnected) {
      spotify.pause();
    }
  }, [player.status, spotify.isConnected]);

  if (!training || !id) {
    return (
      <Box sx={{ p: 3, pt: 'calc(env(safe-area-inset-top) + 24px)' }}>
        <Typography>Training not found</Typography>
        <Button onClick={() => navigate('/')}>Go back</Button>
      </Box>
    );
  }

  const handleStart = () => {
    prevSegmentIndexRef.current = -1;
    resetHistory();
    player.startTraining(training);
    if (spotify.isConnected) spotify.resume();
  };

  const handlePause = () => {
    player.pause();
    if (spotify.isConnected) spotify.pause();
  };

  const handleResume = () => {
    player.play();
    if (spotify.isConnected) spotify.resume();
  };

  const handleStop = () => {
    player.stop();
    prevSegmentIndexRef.current = -1;
    if (spotify.isConnected) spotify.pause();
  };

  const segmentDurationMs = currentSegment ? currentSegment.durationSeconds * 1000 : 1;
  const segmentProgress = (player.segmentElapsedMs / segmentDurationMs) * 100;
  const totalDuration = training.segments.reduce((s, seg) => s + seg.durationSeconds, 0);
  const hrColor = bpm > 0 ? getZoneColor(hrZone) : '#666';

  // Idle state — not started yet
  if (player.status === 'idle' || player.training?.id !== id) {
    return (
      <Box sx={{ p: 3, pt: 'calc(env(safe-area-inset-top) + 24px)', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {training.name}
          </Typography>
        </Box>
        <ZoneCurvePreview segments={training.segments} height={80} />
        <Typography color="text.secondary">
          {training.segments.length} segments · {formatTime(totalDuration)} ·{' '}
          {isConnected ? 'HRM connected' : 'HRM not connected'}
        </Typography>
        <Button variant="contained" size="large" startIcon={<PlayArrowIcon />} onClick={handleStart} sx={{ py: 2 }}>
          Start Training
        </Button>
      </Box>
    );
  }

  // Finished state
  if (player.status === 'finished') {
    return (
      <Box sx={{ p: 3, pt: 'calc(env(safe-area-inset-top) + 24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Training Complete!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Total time: {formatTimeMs(player.elapsedMs)}
        </Typography>
        {calories > 0 && (
          <Typography variant="h6" sx={{ color: '#FF9800' }}>
            {Math.round(calories)} kcal burned
          </Typography>
        )}
        <Button variant="contained" onClick={handleStop}>
          Done
        </Button>
      </Box>
    );
  }

  // Playing / Paused state
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: `${targetColor}11`,
        transition: 'background-color 0.5s',
      }}
    >
      {/* Top bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, pt: 'calc(env(safe-area-inset-top) + 12px)', gap: 1 }}>
        <IconButton size="small" onClick={handleStop}>
          <StopIcon />
        </IconButton>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>
          {training.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatTimeMs(player.elapsedMs)}
        </Typography>
        {calories > 0 && (
          <Typography variant="body2" sx={{ color: '#FF9800', fontWeight: 600 }}>
            {Math.round(calories)} kcal
          </Typography>
        )}
      </Box>

      {/* Zone curve with current position */}
      <Box sx={{ px: 2 }}>
        <ZoneCurvePreview
          segments={training.segments}
          currentIndex={player.currentSegmentIndex}
          height={50}
        />
      </Box>

      {/* HR history chart */}
      <Box sx={{ px: 2, mt: 1 }}>
        <HeartRateChart totalDurationMs={totalDuration * 1000} height={60} />
      </Box>

      {/* Main HR display */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        {/* Live HR */}
        <FavoriteIcon
          sx={{
            fontSize: 40,
            color: hrColor,
            animation: bpm > 0 ? 'pulse 0.8s infinite' : 'none',
            '@keyframes pulse': {
              '0%,100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.2)' },
            },
          }}
        />
        <Typography
          variant="h1"
          sx={{
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1,
            color: hrColor,
          }}
        >
          {bpm || '--'}
        </Typography>
        <Typography sx={{ color: hrColor, fontWeight: 600, fontSize: 18 }}>
          {bpm > 0 ? `Zone ${hrZone} — ${getZoneConfig(hrZone).label}` : 'No HR signal'}
        </Typography>

        {/* Effort guidance */}
        {(() => {
          const guidance = getEffortGuidance(bpm, targetZone, maxHR);
          const [minBpm, maxBpm] = getTargetBpmRange(targetZone, maxHR);

          if (guidance === 'push') {
            return (
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  animation: 'bounce 1s infinite',
                  '@keyframes bounce': {
                    '0%,100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                  },
                }}
              >
                <KeyboardArrowUpIcon sx={{ fontSize: 48, color: targetColor }} />
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: targetColor, letterSpacing: 2 }}>
                  PUSH HARDER
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Target: {minBpm}–{maxBpm} BPM ({bpm > 0 ? `+${minBpm - bpm}` : '—'})
                </Typography>
              </Box>
            );
          }

          if (guidance === 'ease') {
            return (
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  animation: 'sway 1.5s ease-in-out infinite',
                  '@keyframes sway': {
                    '0%,100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(6px)' },
                  },
                }}
              >
                <KeyboardArrowDownIcon sx={{ fontSize: 48, color: '#64B5F6' }} />
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#64B5F6', letterSpacing: 2 }}>
                  EASE UP
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Target: {minBpm}–{maxBpm} BPM (−{bpm - maxBpm})
                </Typography>
              </Box>
            );
          }

          if (guidance === 'in_zone') {
            return (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 44, color: '#4CAF50' }} />
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#4CAF50', letterSpacing: 2 }}>
                  IN THE ZONE
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {minBpm}–{maxBpm} BPM
                </Typography>
              </Box>
            );
          }

          return null;
        })()}

        {/* Target zone */}
        <Box
          sx={{
            mt: 1,
            px: 4,
            py: 1,
            borderRadius: 3,
            bgcolor: targetColor,
            color: '#fff',
          }}
        >
          <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>
            TARGET: Zone {targetZone} — {targetConfig.label}
          </Typography>
        </Box>
      </Box>

      {/* Segment progress */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Segment {player.currentSegmentIndex + 1}/{training.segments.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTimeMs(player.segmentElapsedMs)} / {formatTime(currentSegment?.durationSeconds ?? 0)}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(segmentProgress, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': { bgcolor: targetColor, borderRadius: 4 },
          }}
        />
      </Box>

      {/* Spotify current track */}
      {spotify.isConnected && spotify.currentTrack && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.5 }}>
          <MusicNoteIcon sx={{ fontSize: 16, color: '#1DB954' }} />
          <Typography variant="caption" noWrap sx={{ color: '#1DB954', flex: 1 }}>
            {spotify.currentTrack.name} — {spotify.currentTrack.artist}
          </Typography>
        </Box>
      )}

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, p: 2, pb: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
        {player.status === 'playing' ? (
          <Button variant="contained" size="large" startIcon={<PauseIcon />} onClick={handlePause}>
            Pause
          </Button>
        ) : (
          <Button variant="contained" size="large" startIcon={<PlayArrowIcon />} onClick={handleResume}>
            Resume
          </Button>
        )}
        <Button variant="outlined" size="large" startIcon={<StopIcon />} onClick={handleStop} color="error">
          Stop
        </Button>
      </Box>
    </Box>
  );
}
