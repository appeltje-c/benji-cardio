import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useProfileStore } from '../stores/profileStore';

type Field = 'age' | 'weight' | 'height' | 'restingHr';

const ROWS: { key: Field; label: string; unit: string; min: number; max: number; placeholder: string }[] = [
  { key: 'age',       label: 'AGE',        unit: 'YEARS', min: 10,  max: 100, placeholder: '34'  },
  { key: 'weight',    label: 'WEIGHT',     unit: 'KG',    min: 30,  max: 250, placeholder: '78'  },
  { key: 'height',    label: 'HEIGHT',     unit: 'CM',    min: 100, max: 230, placeholder: '184' },
  { key: 'restingHr', label: 'RESTING HR', unit: 'BPM',   min: 30,  max: 110, placeholder: '56'  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const setAge = useProfileStore((s) => s.setAge);
  const setWeight = useProfileStore((s) => s.setWeight);
  const setHeight = useProfileStore((s) => s.setHeight);
  const setRestingHr = useProfileStore((s) => s.setRestingHr);

  const [values, setValues] = useState<Record<Field, string>>({
    age: '',
    weight: '',
    height: '',
    restingHr: '',
  });
  const [active, setActive] = useState<Field | null>('age');

  const canSubmit = values.age && values.weight && values.height;

  const handleSubmit = () => {
    const age = Number(values.age);
    const weight = Number(values.weight);
    const height = Number(values.height);
    const restingHr = values.restingHr ? Number(values.restingHr) : null;
    if (!age || !weight || !height) return;
    setAge(age);
    setWeight(weight);
    setHeight(height);
    setRestingHr(restingHr);
    navigate('/', { replace: true });
  };

  return (
    <div
      className="v3-shell v3-bg"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)',
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {/* Step pill */}
      <div
        className="v3-mono"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <span>VITAL / SETUP</span>
        <span>01 / 01</span>
      </div>

      <div>
        <div className="v3-eyebrow" style={{ color: 'var(--xg-accent-400)' }}>
          Calibration
        </div>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            margin: '8px 0 0',
            color: '#fff',
          }}
        >
          Tell us
          <br />
          about
          <br />
          <span style={{ color: 'var(--xg-accent-400)' }}>your body.</span>
        </h1>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 14, lineHeight: 1.5 }}>
          We use age, weight &amp; height to compute
          <br />
          your heart-rate zones from{' '}
          <span style={{ fontFamily: 'var(--xg-font-mono)', color: 'rgba(255,255,255,0.85)' }}>
            HR<sub>max</sub> = 220 − age
          </span>
          .
        </div>
      </div>

      <div className="v3-card-strong" style={{ padding: 0, marginTop: 8 }}>
        {ROWS.map((row, i) => {
          const isActive = active === row.key;
          const v = values[row.key];
          return (
            <button
              key={row.key}
              type="button"
              onClick={() => setActive(row.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '16px 16px',
                borderBottom: i < ROWS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                border: 'none',
                color: 'inherit',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <div
                className="v3-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  color: 'rgba(255,255,255,0.5)',
                  width: 110,
                  flexShrink: 0,
                }}
              >
                {row.label}
              </div>
              {isActive ? (
                <input
                  autoFocus
                  type="number"
                  inputMode="numeric"
                  value={v}
                  min={row.min}
                  max={row.max}
                  placeholder={row.placeholder}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [row.key]: e.target.value }))
                  }
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    fontFamily: 'var(--xg-font-sans)',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    fontSize: 28,
                    padding: 0,
                    width: 0,
                  }}
                />
              ) : (
                <span
                  className="v3-num"
                  style={{
                    fontSize: 28,
                    color: v ? '#fff' : 'rgba(255,255,255,0.25)',
                    flex: 1,
                  }}
                >
                  {v || row.placeholder}
                </span>
              )}
              <span
                className="v3-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.4)',
                  marginLeft: 6,
                  alignSelf: 'flex-end',
                  paddingBottom: 6,
                }}
              >
                {row.unit}
              </span>
              <ChevronRightIcon
                sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="v3-btn v3-btn-primary"
        style={{ marginTop: 'auto' }}
      >
        Generate zones →
      </button>
    </div>
  );
}
