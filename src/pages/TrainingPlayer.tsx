import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckIcon from '@mui/icons-material/Check';
import { useTrainingStore } from '../stores/trainingStore';
import { usePlayerStore } from '../stores/playerStore';
import { useHeartRateStore } from '../stores/heartRateStore';
import { useProfileStore } from '../stores/profileStore';
import { useSpotifyStore } from '../stores/spotifyStore';
import { useSessionStore, aggregateSession } from '../stores/sessionStore';
import { ZONE_CONFIGS, getTargetBpmRange, getEffortGuidance } from '../utils/zones';
import V3ECG from '../components/v3/V3ECG';
import Telem from '../components/v3/Telem';
import ZoneTag from '../components/v3/ZoneTag';
import Summary from './Summary';

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
}

function fmtTimeShort(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export default function TrainingPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const training = useTrainingStore((s) => s.trainings.find((t) => t.id === id));
  const player = usePlayerStore();
  const { bpm, isConnected, resetHistory } = useHeartRateStore();
  const maxHR = useProfileStore((s) => s.getMaxHR());
  const spotify = useSpotifyStore();
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const recordedSessionRef = useRef<string | null>(null);

  const currentSegment = player.training?.segments[player.currentSegmentIndex];
  const targetZone = currentSegment?.targetZone ?? 1;
  const targetConfig = ZONE_CONFIGS[targetZone - 1];

  useEffect(() => {
    if (player.status !== 'playing') return;
    lastTickRef.current = performance.now();
    const loop = () => {
      const now = performance.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      usePlayerStore.getState().tick(delta);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [player.status]);

  useEffect(() => {
    if (player.status !== 'finished') return;
    if (spotify.isConnected) spotify.pause();

    // Record the session exactly once per finish. The trainingId guards
    // against re-firing during navigation/remounts within Summary.
    const liveTraining = player.training;
    if (
      liveTraining &&
      liveTraining.id === training?.id &&
      recordedSessionRef.current !== liveTraining.id
    ) {
      const hrState = useHeartRateStore.getState();
      const elapsed = usePlayerStore.getState().elapsedMs;
      useSessionStore.getState().addSession(
        aggregateSession(
          liveTraining,
          hrState.history,
          maxHR,
          elapsed,
          hrState.calories
        )
      );
      recordedSessionRef.current = liveTraining.id;
    }
    // spotify is a stable Zustand store object; pause() reads the latest state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.status, spotify.isConnected]);

  if (!training || !id) {
    return (
      <div className="v3-shell v3-bg" style={{ padding: 24, color: '#fff' }}>
        <div>Training not found</div>
        <button type="button" onClick={() => navigate('/library')} className="v3-btn v3-btn-ghost">
          Back
        </button>
      </div>
    );
  }

  const totalDuration = training.segments.reduce((s, seg) => s + seg.durationSeconds, 0);

  const handleStart = () => {
    resetHistory();
    recordedSessionRef.current = null;
    player.startTraining(training);
    if (spotify.isConnected) spotify.resume();
  };

  const handlePauseResume = () => {
    if (player.status === 'playing') {
      player.pause();
      if (spotify.isConnected) spotify.pause();
    } else {
      player.play();
      if (spotify.isConnected) spotify.resume();
    }
  };

  const handleStop = () => {
    player.stop();
    if (spotify.isConnected) spotify.pause();
    navigate(`/library`);
  };

  // ---------- Idle / preview ----------
  if (player.status === 'idle' || player.training?.id !== id) {
    return (
      <div
        className="v3-shell v3-bg"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100%',
          color: '#fff',
        }}
      >
        <div
          style={{
            padding: '0 20px',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 32px)',
            paddingBottom: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.16)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
          </button>

          <div>
            <div className="v3-eyebrow" style={{ color: 'var(--xg-accent-400)' }}>
              READY
            </div>
            <h1
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                color: '#fff',
                marginTop: 6,
              }}
            >
              {training.name}
            </h1>
          </div>

          {/* Segment strip */}
          {training.segments.length > 0 && (
            <div style={{ display: 'flex', height: 36 }}>
              {training.segments.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    flex: s.durationSeconds,
                    background: `var(--hr-z${s.targetZone}-solid)`,
                    opacity: 0.85,
                    borderRight: i < training.segments.length - 1 ? '1px solid #0A0B0F' : 'none',
                  }}
                />
              ))}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              background: 'rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
              <Telem label="DURATION" value={fmtTimeShort(totalDuration)} size={24} />
            </div>
            <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
              <Telem label="SEGMENTS" value={training.segments.length} size={24} />
            </div>
          </div>

          <div
            className="v3-mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              color: isConnected ? 'var(--xg-success-300)' : 'rgba(255,255,255,0.5)',
              textAlign: 'center',
            }}
          >
            {isConnected ? '● HR LINKED' : '○ HR NOT LINKED — TAP CONNECT IN PROFILE'}
          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={training.segments.length === 0}
            className="v3-btn v3-btn-primary"
            style={{ marginTop: 'auto' }}
          >
            <PlayArrowIcon sx={{ fontSize: 18 }} /> START
          </button>
        </div>
      </div>
    );
  }

  // ---------- Finished → Summary ----------
  if (player.status === 'finished') {
    return <Summary training={training} onClose={handleStop} />;
  }

  // ---------- Live session ----------
  const segDurationMs = currentSegment ? currentSegment.durationSeconds * 1000 : 1;
  const segmentElapsedSec = Math.floor(player.segmentElapsedMs / 1000);
  const remainingSec = Math.max(0, (currentSegment?.durationSeconds ?? 0) - segmentElapsedSec);
  const next = training.segments[player.currentSegmentIndex + 1];

  const [targetLo, targetHi] = getTargetBpmRange(targetZone, maxHR);
  const targetMid = Math.round((targetLo + targetHi) / 2);
  const guidance = getEffortGuidance(bpm, targetZone, maxHR);

  let status: { label: string; hint: string; color: string; bg: string; border: string; icon: 'up' | 'down' | 'ok' };
  if (guidance === 'push') {
    const delta = targetLo - bpm;
    status = {
      label: 'PUSH HARDER',
      hint: bpm > 0 ? `+${delta} BPM TO REACH ZONE` : 'WAITING FOR HR SIGNAL',
      color: 'var(--xg-accent-400)',
      bg: 'rgba(255,85,31,0.14)',
      border: 'rgba(255,85,31,0.45)',
      icon: 'up',
    };
  } else if (guidance === 'ease') {
    const delta = bpm - targetHi;
    status = {
      label: 'EASE OFF',
      hint: `−${delta} BPM TO STAY IN ZONE`,
      color: '#FF6F6F',
      bg: 'rgba(216,32,32,0.18)',
      border: 'rgba(216,32,32,0.45)',
      icon: 'down',
    };
  } else if (guidance === 'in_zone') {
    status = {
      label: 'ON RANGE',
      hint: `HOLD STEADY · ±${Math.abs(bpm - targetMid)} FROM MID`,
      color: '#5BD25B',
      bg: 'rgba(57,194,57,0.14)',
      border: 'rgba(57,194,57,0.45)',
      icon: 'ok',
    };
  } else {
    status = {
      label: 'NO SIGNAL',
      hint: 'CONNECT YOUR HRM',
      color: 'rgba(255,255,255,0.5)',
      bg: 'rgba(255,255,255,0.04)',
      border: 'rgba(255,255,255,0.12)',
      icon: 'ok',
    };
  }

  // Target-range bar math
  const bandLo = Math.min(targetLo - 12, bpm - 8);
  const bandHi = Math.max(targetHi + 12, bpm + 8);
  const span = Math.max(1, bandHi - bandLo);
  const pctLo = ((targetLo - bandLo) / span) * 100;
  const pctHi = ((targetHi - bandLo) / span) * 100;
  const pctBpm = ((bpm - bandLo) / span) * 100;

  return (
    <div
      className="v3-shell"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100%',
        color: '#fff',
        background: `radial-gradient(800px 600px at 50% 0%, var(--hr-z${targetZone}-solid) -20%, transparent 60%), #0A0B0F`,
      }}
    >
      {/* Top */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          left: 0,
          right: 0,
          zIndex: 4,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(255,255,255,0.06)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
        </button>
        <div
          className="v3-mono"
          style={{
            marginLeft: 12,
            fontSize: 10,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {training.name.toUpperCase()} · LIVE
        </div>
        <span
          style={{
            marginLeft: 'auto',
            width: 8,
            height: 8,
            borderRadius: 4,
            background: 'var(--xg-accent-400)',
            boxShadow: '0 0 8px var(--xg-accent-400)',
            animation: 'v3-blink 1.6s ease-in-out infinite',
          }}
        />
        <style>{`@keyframes v3-blink { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>
      </div>

      <div
        style={{
          padding: 'calc(env(safe-area-inset-top, 0px) + 70px) 20px calc(env(safe-area-inset-bottom, 0px) + 120px)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
        }}
      >
        {/* Segment label */}
        <div
          className="v3-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.24em',
            color: `var(--hr-z${targetZone}-solid)`,
            marginBottom: 4,
          }}
        >
          ZONE {targetZone} · {targetConfig.label.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#fff',
            lineHeight: 1,
          }}
        >
          {currentSegment?.label || `Segment ${player.currentSegmentIndex + 1}`}
        </div>

        {/* Big BPM */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '10px 0',
          }}
        >
          <V3ECG height={56} color={status.color} />
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div
              className="v3-num"
              style={{
                fontSize: 160,
                color: '#fff',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {bpm > 0 ? bpm : '--'}
            </div>
            <div
              className="v3-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.24em',
                color: 'rgba(255,255,255,0.5)',
                marginTop: -8,
              }}
            >
              BPM
            </div>
          </div>

          {/* Coaching pill */}
          <div
            style={{
              marginTop: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              background: status.bg,
              border: `1px solid ${status.border}`,
              borderRadius: 999,
            }}
          >
            {status.icon === 'up' && <ArrowUpwardIcon sx={{ fontSize: 16, color: status.color }} />}
            {status.icon === 'down' && <ArrowDownwardIcon sx={{ fontSize: 16, color: status.color }} />}
            {status.icon === 'ok' && <CheckIcon sx={{ fontSize: 16, color: status.color }} />}
            <span
              className="v3-mono"
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: status.color,
              }}
            >
              {status.label}
            </span>
          </div>
          <div
            className="v3-mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'rgba(255,255,255,0.5)',
              marginTop: 8,
            }}
          >
            {status.hint}
          </div>

          {/* Target range bar */}
          <div style={{ width: '100%', marginTop: 14 }}>
            <div
              style={{
                position: 'relative',
                height: 8,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${pctLo}%`,
                  width: `${pctHi - pctLo}%`,
                  background: `var(--hr-z${targetZone}-solid)`,
                  opacity: 0.5,
                  borderRadius: 4,
                }}
              />
              {bpm > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: -4,
                    bottom: -4,
                    left: `calc(${pctBpm}% - 2px)`,
                    width: 4,
                    background: status.color,
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${status.color}`,
                  }}
                />
              )}
            </div>
            <div
              className="v3-mono"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 6,
                fontSize: 9,
                letterSpacing: '0.14em',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              <span>TARGET</span>
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                {targetLo} — {targetHi} BPM
              </span>
            </div>
          </div>
        </div>

        {/* Segment progress dots */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {training.segments.map((s, i) => (
            <div
              key={s.id}
              style={{
                flex: s.durationSeconds,
                height: 6,
                borderRadius: 1,
                background:
                  i < player.currentSegmentIndex
                    ? `var(--hr-z${s.targetZone}-solid)`
                    : i === player.currentSegmentIndex
                    ? 'rgba(255,255,255,0.35)'
                    : 'rgba(255,255,255,0.08)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {i === player.currentSegmentIndex && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${Math.min(100, (player.segmentElapsedMs / segDurationMs) * 100)}%`,
                    background: `var(--hr-z${targetZone}-solid)`,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Telemetry strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            background: 'rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ background: '#0A0B0F', padding: '10px 12px' }}>
            <Telem label="REMAINING" value={fmtTimeShort(remainingSec)} size={22} color={`var(--hr-z${targetZone}-solid)`} />
          </div>
          <div style={{ background: '#0A0B0F', padding: '10px 12px' }}>
            <Telem label="ELAPSED" value={fmtTime(player.elapsedMs)} size={22} />
          </div>
          <div style={{ background: '#0A0B0F', padding: '10px 12px' }}>
            {next ? (
              <Telem
                label="UP NEXT"
                value={<ZoneTag zone={next.targetZone} />}
                size={22}
                color={`var(--hr-z${next.targetZone}-solid)`}
              />
            ) : (
              <Telem label="UP NEXT" value="—" size={22} />
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)',
          display: 'flex',
          gap: 10,
          zIndex: 4,
        }}
      >
        <button
          type="button"
          onClick={() => {
            // restart this segment
            usePlayerStore.setState({ segmentElapsedMs: 0 });
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(255,255,255,0.04)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <SkipPreviousIcon sx={{ fontSize: 22 }} />
        </button>
        <button type="button" onClick={handlePauseResume} className="v3-btn v3-btn-light" style={{ flex: 1 }}>
          {player.status === 'playing' ? (
            <>
              <PauseIcon sx={{ fontSize: 18 }} /> PAUSE
            </>
          ) : (
            <>
              <PlayArrowIcon sx={{ fontSize: 18 }} /> RESUME
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleStop}
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            border: 0,
            background: 'var(--xg-error-500)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <StopIcon sx={{ fontSize: 22 }} />
        </button>
      </div>
    </div>
  );
}
