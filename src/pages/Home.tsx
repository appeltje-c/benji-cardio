import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTrainingStore } from '../stores/trainingStore';
import { useProfileStore } from '../stores/profileStore';
import { useHeartRateStore } from '../stores/heartRateStore';
import { useSessionStore } from '../stores/sessionStore';
import Telem from '../components/v3/Telem';
import ZoneTag from '../components/v3/ZoneTag';

function fmtDur(seconds: number) {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}M`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}H ${r}M` : `${h}H`;
}

function fmtDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  return `${dd}.${mm}.${yyyy} / ${weekday}`;
}

function greeting(name: string | null) {
  const hr = new Date().getHours();
  const which = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  return { which, name: name?.trim() || 'athlete' };
}

export default function Home() {
  const navigate = useNavigate();
  const trainings = useTrainingStore((s) => s.trainings);
  const profileName = useProfileStore((s) => s.name);
  const restingHr = useProfileStore((s) => s.restingHr);
  const hrm = useHeartRateStore();
  const sessions = useSessionStore((s) => s.sessions);

  const today = trainings.find((t) => t.segments.length > 0) ?? trainings[0];
  const { which, name } = greeting(profileName);
  const lastSession = sessions[0]; // sessionStore keeps sessions[] sorted desc by endedAt

  const weekTotalMs = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return sessions
      .filter((s) => s.endedAt >= cutoff)
      .reduce((sum, s) => sum + s.durationMs, 0);
  }, [sessions]);

  const fmtHours = (ms: number) => {
    const totalMin = Math.round(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="v3-shell v3-bg"
      style={{ position: 'relative', width: '100%', minHeight: '100%' }}
    >
      <div
        style={{
          padding: '0 20px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
          paddingBottom: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          color: '#fff',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            className="v3-mono"
            style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}
          >
            {fmtDate(new Date())}
          </div>
          <button
            type="button"
            onClick={() => navigate('/connect')}
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: 'inherit',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: hrm.isConnected ? 'var(--xg-success-300)' : 'rgba(255,255,255,0.3)',
              }}
            />
            <span
              className="v3-mono"
              style={{
                fontSize: 9,
                letterSpacing: '0.16em',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {hrm.isConnected ? (hrm.deviceName ?? 'LINKED').toUpperCase() : 'NO DEVICE'}
            </span>
          </button>
        </div>

        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            color: '#fff',
          }}
        >
          {which},
          <br />
          <span style={{ color: 'var(--xg-accent-400)' }}>{name}.</span>
        </h1>

        {/* Today's planned training (or empty state) */}
        {today ? (
          <div
            style={{
              borderRadius: 14,
              overflow: 'hidden',
              background:
                'linear-gradient(135deg, rgba(255,85,31,0.18), rgba(6,51,249,0.18))',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ padding: '16px 16px 12px' }}>
              <div
                className="v3-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  color: 'var(--xg-accent-300)',
                }}
              >
                TODAY · PLANNED
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: '#fff',
                  marginTop: 4,
                }}
              >
                {today.name}
              </div>
              <div
                className="v3-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: 4,
                }}
              >
                {today.segments.length > 0
                  ? `${fmtDur(today.segments.reduce((a, s) => a + s.durationSeconds, 0))} · ${today.segments.length} SEGMENTS`
                  : 'NO SEGMENTS YET'}
              </div>
            </div>
            {today.segments.length > 0 && (
              <div style={{ display: 'flex', height: 28 }}>
                {today.segments.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      flex: s.durationSeconds,
                      background: `var(--hr-z${s.targetZone}-solid)`,
                    }}
                  />
                ))}
              </div>
            )}
            <div style={{ padding: 14 }}>
              <button
                type="button"
                onClick={() =>
                  navigate(today.segments.length > 0 ? `/player/${today.id}` : `/training/${today.id}/edit`)
                }
                className="v3-btn v3-btn-primary"
              >
                <PlayArrowIcon sx={{ fontSize: 18 }} />
                {today.segments.length > 0 ? 'START' : 'BUILD'}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              borderRadius: 14,
              overflow: 'hidden',
              background:
                'linear-gradient(135deg, rgba(255,85,31,0.12), rgba(6,51,249,0.12))',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: 16,
            }}
          >
            <div
              className="v3-mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.2em',
                color: 'var(--xg-accent-300)',
              }}
            >
              NO TRAININGS YET
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#fff',
                margin: '4px 0 12px',
              }}
            >
              Build your first.
            </div>
            <button type="button" onClick={() => navigate('/library')} className="v3-btn v3-btn-primary">
              Open library
            </button>
          </div>
        )}

        {/* Telemetry grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: 'rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
            <Telem
              label="THIS WEEK"
              value={weekTotalMs > 0 ? fmtHours(weekTotalMs) : '—'}
              unit="HRS"
              size={26}
            />
          </div>
          <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
            <Telem
              label="SESSIONS"
              value={sessions.length || '—'}
              unit="DONE"
              size={26}
              color={sessions.length ? 'var(--xg-accent-400)' : '#fff'}
            />
          </div>
          <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
            <Telem
              label="RESTING HR"
              value={restingHr ?? '—'}
              unit="BPM"
              size={26}
              color={restingHr ? 'var(--xg-success-300)' : '#fff'}
            />
          </div>
          <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
            <Telem label="LOAD" value="—" unit="TSS WK" size={26} />
          </div>
        </div>

        {/* Last session */}
        <div className="v3-eyebrow">
          LAST · {lastSession ? fmtLastDay(lastSession.endedAt) : '—'}
        </div>
        {lastSession ? (
          <button
            type="button"
            onClick={() => navigate('/activity')}
            className="v3-card"
            style={{
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'inherit',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <ZoneTag zone={lastSession.peakZone} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {lastSession.trainingName}
              </div>
              <div
                className="v3-mono"
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.12em',
                  marginTop: 2,
                }}
              >
                {fmtSessionLine(lastSession.durationMs, lastSession.avgHr)}
              </div>
            </div>
            <ChevronRightIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
          </button>
        ) : (
          <div
            className="v3-card"
            style={{
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              opacity: 0.6,
            }}
          >
            <ZoneTag zone={2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                No sessions yet
              </div>
              <div
                className="v3-mono"
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.12em',
                  marginTop: 2,
                }}
              >
                FINISH A TRAINING TO LOG IT
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function fmtLastDay(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(now) - start(d)) / 86_400_000);
  if (diff === 0) return 'TODAY';
  if (diff === 1) return 'YESTERDAY';
  if (diff < 7) return `${diff}D AGO`;
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
}

function fmtSessionLine(durationMs: number, avgHr: number) {
  const totalMin = Math.max(1, Math.round(durationMs / 60000));
  const dur = totalMin >= 60
    ? `${Math.floor(totalMin / 60)}H ${(totalMin % 60).toString().padStart(2, '0')}M`
    : `${totalMin}M`;
  return avgHr > 0 ? `${dur} · AVG ${avgHr} BPM` : dur;
}
