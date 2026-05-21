import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ShareIcon from '@mui/icons-material/Share';
import V3StatusBar from '../components/v3/V3StatusBar';
import V3ECG from '../components/v3/V3ECG';
import Telem from '../components/v3/Telem';
import { useHeartRateStore } from '../stores/heartRateStore';
import { usePlayerStore } from '../stores/playerStore';
import { useProfileStore } from '../stores/profileStore';
import { ZONE_CONFIGS, getZoneForHR } from '../utils/zones';
import type { Training, Zone } from '../types';

function fmtClockTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
}

function fmtDate(d: Date) {
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${month} ${day} · ${hh}:${mm}`;
}

interface Props {
  training: Training;
  onClose: () => void;
}

export default function Summary({ training, onClose }: Props) {
  const navigate = useNavigate();
  const history = useHeartRateStore((s) => s.history);
  const maxBpm = useHeartRateStore((s) => s.maxBpm);
  const calories = useHeartRateStore((s) => s.calories);
  const elapsedMs = usePlayerStore((s) => s.elapsedMs);
  const maxHR = useProfileStore((s) => s.getMaxHR());

  // Aggregate avg HR + time-in-zones from heart-rate history.
  const { avgHr, peakZone, dist } = useMemo(() => {
    const buckets: Record<Zone, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    let count = 0;
    let peak: Zone = 1;
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];
      const dt = (curr.timeMs - prev.timeMs) / 1000;
      if (dt <= 0 || dt > 30) continue; // skip pauses / gaps
      const z = getZoneForHR(curr.bpm, maxHR);
      buckets[z] += dt;
      if (z > peak) peak = z;
      sum += curr.bpm * dt;
      count += dt;
    }
    return {
      avgHr: count > 0 ? Math.round(sum / count) : 0,
      peakZone: peak,
      dist: (Object.entries(buckets) as [string, number][])
        .map(([z, sec]) => ({ z: Number(z) as Zone, sec }))
        .filter((d) => d.sec > 0),
    };
  }, [history, maxHR]);

  const maxBucketSec = dist.length ? Math.max(...dist.map((d) => d.sec)) : 0;
  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - elapsedMs);
  const dateRange = `${fmtDate(startedAt)} — ${String(endedAt.getHours()).padStart(2, '0')}:${String(endedAt.getMinutes()).padStart(2, '0')}`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: training.name,
          text: `${training.name} — ${fmtClockTime(elapsedMs)} · ${Math.round(calories)} kcal`,
        });
      } catch {
        /* user dismissed */
      }
    }
  };

  return (
    <div
      className="v3-shell v3-bg"
      style={{ position: 'relative', width: '100%', minHeight: '100%', color: '#fff' }}
    >
      <V3StatusBar title="SESSION · COMPLETE" onBack={onClose} />

      <div
        style={{
          padding: '0 20px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 100px)',
          paddingBottom: 120,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div>
          <div className="v3-eyebrow" style={{ color: 'var(--xg-accent-400)' }}>
            {dateRange}
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
            {training.name} ·{' '}
            <span style={{ color: `var(--hr-z${peakZone}-solid)` }}>done.</span>
          </h1>
        </div>

        {/* Big duration */}
        <div className="v3-card-strong">
          <div className="v3-eyebrow">DURATION</div>
          <div className="v3-num" style={{ fontSize: 72, color: '#fff', lineHeight: 1, marginTop: 4 }}>
            {fmtClockTime(elapsedMs)}
          </div>
          <V3ECG height={28} color="rgba(255,255,255,0.3)" glow={false} />
        </div>

        {/* Telemetry */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            background: 'rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
            <Telem
              label="AVG HR"
              value={avgHr || '—'}
              unit="BPM"
              size={32}
              color={avgHr ? `var(--hr-z${getZoneForHR(avgHr, maxHR)}-solid)` : '#fff'}
            />
          </div>
          <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
            <Telem
              label="MAX HR"
              value={maxBpm || '—'}
              unit="BPM"
              size={32}
              color={maxBpm ? `var(--hr-z${getZoneForHR(maxBpm, maxHR)}-solid)` : '#fff'}
            />
          </div>
          <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
            <Telem
              label="CALORIES"
              value={calories > 0 ? Math.round(calories) : '—'}
              unit="KCAL"
              size={32}
            />
          </div>
          <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
            <Telem label="LOAD" value="—" unit="TSS" size={32} color="var(--xg-accent-400)" />
          </div>
        </div>

        {/* Time in zones */}
        <div className="v3-card-strong" style={{ padding: 16 }}>
          <div className="v3-eyebrow" style={{ marginBottom: 10 }}>
            TIME IN ZONES
          </div>
          {dist.length === 0 ? (
            <div
              className="v3-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                padding: '24px 0',
              }}
            >
              NO HR SIGNAL DURING SESSION
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
              {ZONE_CONFIGS.map((z) => {
                const sec = dist.find((d) => d.z === z.zone)?.sec ?? 0;
                const h = maxBucketSec > 0 ? (sec / maxBucketSec) * 100 : 0;
                return (
                  <div
                    key={z.zone}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <div className="v3-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                      {sec > 0 ? `${Math.round(sec / 60)}m` : '—'}
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: `${h}%`,
                        background: `var(--hr-z${z.zone}-solid)`,
                        borderRadius: 2,
                        minHeight: sec > 0 ? 4 : 0,
                      }}
                    />
                    <div
                      className="v3-mono"
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#fff',
                        letterSpacing: 0.08,
                      }}
                    >
                      Z{z.zone}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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
          onClick={handleShare}
          className="v3-btn v3-btn-ghost"
          style={{ width: 56, flex: 'none', padding: 0 }}
        >
          <ShareIcon sx={{ fontSize: 18 }} />
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/');
          }}
          className="v3-btn v3-btn-primary"
        >
          SAVE &amp; CLOSE
        </button>
      </div>
    </div>
  );
}
