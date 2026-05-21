import { useNavigate } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import V3StatusBar from '../components/v3/V3StatusBar';
import ZoneTag from '../components/v3/ZoneTag';
import { useSessionStore } from '../stores/sessionStore';

function fmtDuration(ms: number) {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m < 60) return `${m}:${s.toString().padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `${h}h ${r.toString().padStart(2, '0')}m`;
}

function fmtRelativeDay(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfThat.getTime()) / 86_400_000);
  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'YESTERDAY';
  if (diffDays < 7) return `${diffDays}D AGO`;
  return d
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    .toUpperCase();
}

function fmtTime(ts: number) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Activity() {
  const sessions = useSessionStore((s) => s.sessions);
  const deleteSession = useSessionStore((s) => s.deleteSession);
  const navigate = useNavigate();

  return (
    <div
      className="v3-shell v3-bg"
      style={{ position: 'relative', width: '100%', minHeight: '100%' }}
    >
      <V3StatusBar title={`ACTIVITY · ${String(sessions.length).padStart(2, '0')}`} />

      <div
        style={{
          padding: '0 20px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 110px)',
          paddingBottom: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          color: '#fff',
        }}
      >
        {sessions.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 0',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            <div
              className="v3-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 14,
              }}
            >
              NO COMPLETED SESSIONS
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: '#fff',
              }}
            >
              Finish a training to
              <br />
              see it here.
            </h1>
            <button
              type="button"
              onClick={() => navigate('/library')}
              className="v3-btn v3-btn-primary"
              style={{ maxWidth: 260, margin: '24px auto 0' }}
            >
              Open library
            </button>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                color: '#fff',
                marginTop: 4,
              }}
            >
              Every session,
              <br />
              <span style={{ color: 'var(--xg-accent-400)' }}>logged.</span>
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.map((s) => (
                <div key={s.id} className="v3-card-strong" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      className="v3-mono"
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {fmtRelativeDay(s.endedAt)} · {fmtTime(s.endedAt)}
                    </span>
                    <ZoneTag zone={s.peakZone} prefix="PEAK" />
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          typeof window !== 'undefined' &&
                          window.confirm(`Delete session "${s.trainingName}"?`)
                        ) {
                          deleteSession(s.id);
                        }
                      }}
                      className="v3-mono"
                      style={{
                        marginLeft: 'auto',
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        color: 'rgba(255,255,255,0.35)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--xg-font-mono)',
                      }}
                      aria-label="Delete session"
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ padding: '6px 14px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        color: '#fff',
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.trainingName}
                    </div>
                    <ChevronRightIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.3)' }} />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1,
                      background: 'rgba(255,255,255,0.06)',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ background: '#14161D', padding: '8px 12px' }}>
                      <div className="v3-eyebrow" style={{ fontSize: 9 }}>DURATION</div>
                      <div className="v3-num" style={{ fontSize: 16, color: '#fff', marginTop: 2 }}>
                        {fmtDuration(s.durationMs)}
                      </div>
                    </div>
                    <div style={{ background: '#14161D', padding: '8px 12px' }}>
                      <div className="v3-eyebrow" style={{ fontSize: 9 }}>AVG HR</div>
                      <div
                        className="v3-num"
                        style={{
                          fontSize: 16,
                          color: s.avgHr ? '#fff' : 'rgba(255,255,255,0.4)',
                          marginTop: 2,
                        }}
                      >
                        {s.avgHr || '—'}
                      </div>
                    </div>
                    <div style={{ background: '#14161D', padding: '8px 12px' }}>
                      <div className="v3-eyebrow" style={{ fontSize: 9 }}>KCAL</div>
                      <div
                        className="v3-num"
                        style={{
                          fontSize: 16,
                          color: s.calories > 0 ? '#fff' : 'rgba(255,255,255,0.4)',
                          marginTop: 2,
                        }}
                      >
                        {s.calories > 0 ? Math.round(s.calories) : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Segment strip */}
                  {s.segments.length > 0 && (
                    <div style={{ display: 'flex', height: 6 }}>
                      {s.segments.map((seg, i) => (
                        <div
                          key={seg.id}
                          style={{
                            flex: seg.durationSeconds,
                            background: `var(--hr-z${seg.targetZone}-solid)`,
                            opacity: 0.7,
                            borderRight:
                              i < s.segments.length - 1 ? '1px solid #0A0B0F' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
