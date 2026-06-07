import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import { useStretchStore } from '../stores/stretchStore';
import { getStretch } from '../data/stretchLibrary';
import Telem from '../components/v3/Telem';

export default function StretchPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routine = useStretchStore((s) => s.routines.find((r) => r.id === id));

  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!routine || !id) {
    return (
      <div className="v3-shell v3-bg" style={{ padding: 24, color: '#fff' }}>
        <div>Routine not found</div>
        <button type="button" onClick={() => navigate('/library')} className="v3-btn v3-btn-ghost">
          Back
        </button>
      </div>
    );
  }

  const totalReps = routine.segments.reduce((sum, s) => sum + s.reps, 0);

  const close = () => navigate('/library');
  const start = () => {
    setIndex(0);
    setFinished(false);
    setStarted(true);
  };
  const next = () => {
    if (index + 1 >= routine.segments.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  };
  const prev = () => setIndex((i) => Math.max(0, i - 1));

  // ---------- Idle / preview ----------
  if (!started) {
    return (
      <div className="v3-shell v3-bg" style={{ position: 'relative', width: '100%', minHeight: '100%', color: '#fff' }}>
        <div
          style={{
            padding: '0 20px',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 32px)',
            paddingBottom: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            minHeight: '100%',
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
              STRETCH · READY
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
              {routine.name}
            </h1>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              background: 'rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
              <Telem label="EXERCISES" value={routine.segments.length} size={24} />
            </div>
            <div style={{ background: '#0A0B0F', padding: '14px 16px' }}>
              <Telem label="TOTAL REPS" value={totalReps} size={24} />
            </div>
          </div>

          {/* Exercise preview list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {routine.segments.map((s, i) => {
              const ex = getStretch(s.exerciseId);
              if (!ex) return null;
              return (
                <div key={s.id} className="v3-card" style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    className="v3-mono"
                    style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', width: 18 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <img src={ex.images[0]} alt="" style={{ width: 44, height: 36, objectFit: 'cover', borderRadius: 5, background: '#111' }} />
                  <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600 }}>{ex.name}</div>
                  <div className="v3-num" style={{ fontSize: 16 }}>×{s.reps}</div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={start}
            disabled={routine.segments.length === 0}
            className="v3-btn v3-btn-primary"
            style={{ marginTop: 'auto' }}
          >
            <PlayArrowIcon sx={{ fontSize: 18 }} /> START
          </button>
        </div>
      </div>
    );
  }

  // ---------- Finished ----------
  if (finished) {
    return (
      <div
        className="v3-shell"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100%',
          color: '#fff',
          background: 'radial-gradient(800px 600px at 50% 0%, var(--xg-accent-400) -30%, transparent 55%), #0A0B0F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 64, color: 'var(--xg-success-300, #5BD25B)' }} />
        <div className="v3-eyebrow" style={{ marginTop: 16, color: 'var(--xg-accent-400)' }}>
          ROUTINE COMPLETE
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 8 }}>{routine.name}</h1>
        <div
          className="v3-mono"
          style={{ fontSize: 12, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.6)', marginTop: 10 }}
        >
          {routine.segments.length} EXERCISES · {totalReps} REPS
        </div>
        <button type="button" onClick={close} className="v3-btn v3-btn-primary" style={{ marginTop: 32, maxWidth: 260 }}>
          Done
        </button>
      </div>
    );
  }

  // ---------- Active ----------
  const seg = routine.segments[index];
  const ex = seg ? getStretch(seg.exerciseId) : undefined;
  if (!seg || !ex) {
    return (
      <div className="v3-shell v3-bg" style={{ padding: 24, color: '#fff' }}>
        <div>Exercise not found</div>
        <button type="button" onClick={close} className="v3-btn v3-btn-ghost">
          Back
        </button>
      </div>
    );
  }
  const isLast = index + 1 >= routine.segments.length;
  const nextEx = !isLast ? getStretch(routine.segments[index + 1].exerciseId) : undefined;

  return (
    <div className="v3-shell v3-bg" style={{ position: 'relative', width: '100%', minHeight: '100%', color: '#fff' }}>
      {/* Top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 4,
          padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(10,11,15,0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          type="button"
          onClick={close}
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
        <div
          className="v3-mono"
          style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)' }}
        >
          {routine.name.toUpperCase()} · {index + 1}/{routine.segments.length}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 4, padding: '0 16px', marginTop: 4 }}>
        {routine.segments.map((s, i) => (
          <div
            key={s.id}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 1,
              background:
                i < index
                  ? 'var(--xg-accent-400)'
                  : i === index
                  ? 'rgba(255,255,255,0.6)'
                  : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>

      <div style={{ padding: '16px 20px 160px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div className="v3-eyebrow" style={{ color: 'var(--xg-accent-400)' }}>
            {ex.region.toUpperCase()}
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 4 }}>
            {ex.name}
          </h1>
        </div>

        {/* Two-frame demonstration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {ex.images.map((src, i) => (
            <div key={i} style={{ position: 'relative', background: '#111', borderRadius: 8, overflow: 'hidden' }}>
              <img src={src} alt="" style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }} />
              <span
                className="v3-mono"
                style={{
                  position: 'absolute',
                  bottom: 6,
                  left: 6,
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(0,0,0,0.6)',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                {i === 0 ? 'START' : 'STRETCH'}
              </span>
            </div>
          ))}
        </div>

        {/* Rep callout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 12,
            padding: '16px 0',
            border: '1px solid rgba(255,85,31,0.35)',
            background: 'rgba(255,85,31,0.08)',
            borderRadius: 10,
          }}
        >
          <span className="v3-mono" style={{ fontSize: 12, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.6)' }}>
            DO THIS
          </span>
          <span className="v3-num" style={{ fontSize: 52, color: 'var(--xg-accent-400)', lineHeight: 1 }}>
            ×{seg.reps}
          </span>
          <span className="v3-mono" style={{ fontSize: 12, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.6)' }}>
            {ex.perSide ? 'EACH SIDE' : 'TIMES'}
          </span>
        </div>

        {/* How to */}
        <div>
          <div className="v3-eyebrow">HOW TO DO IT</div>
          <ol style={{ margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ex.howTo.map((step, i) => (
              <li key={i} style={{ fontSize: 13, lineHeight: 1.45, color: 'rgba(255,255,255,0.85)' }}>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Good for */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            padding: 12,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <SelfImprovementIcon sx={{ fontSize: 20, color: 'var(--xg-accent-400)', flexShrink: 0, mt: '2px' }} />
          <div>
            <div className="v3-eyebrow" style={{ marginBottom: 4 }}>
              GOOD FOR
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)' }}>{ex.benefits}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)',
          display: 'flex',
          gap: 10,
          zIndex: 5,
          background: 'linear-gradient(to top, #0A0B0F 60%, transparent)',
        }}
      >
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(255,255,255,0.04)',
            color: index === 0 ? 'rgba(255,255,255,0.25)' : '#fff',
            display: 'grid',
            placeItems: 'center',
            cursor: index === 0 ? 'default' : 'pointer',
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 22 }} />
        </button>
        <button type="button" onClick={next} className="v3-btn v3-btn-primary" style={{ flex: 1 }}>
          {isLast ? (
            <>
              FINISH <CheckCircleIcon sx={{ fontSize: 18 }} />
            </>
          ) : (
            <>
              NEXT{nextEx ? ` · ${nextEx.name}` : ''} <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
