import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useProfileStore } from '../stores/profileStore';
import { ZONE_CONFIGS } from '../utils/zones';
import V3StatusBar from '../components/v3/V3StatusBar';
import V3ECG from '../components/v3/V3ECG';
import Telem from '../components/v3/Telem';

type EditField = 'name' | 'age' | 'weight' | 'height' | 'restingHr';

export default function Profile() {
  const {
    name,
    age,
    weight,
    height,
    restingHr,
    setName,
    setAge,
    setWeight,
    setHeight,
    setRestingHr,
    getMaxHR,
  } = useProfileStore();
  const maxHR = getMaxHR();
  const [editing, setEditing] = useState<EditField | null>(null);
  const [draft, setDraft] = useState('');

  const initial = (name?.trim()?.[0] ?? 'V').toUpperCase();
  const displayName = name?.trim() || 'You';

  const startEdit = (field: EditField, current: number | string | null) => {
    setDraft(current == null ? '' : String(current));
    setEditing(field);
  };

  const saveEdit = () => {
    if (!editing) return;
    if (editing === 'name') {
      setName(draft.trim() || null);
    } else {
      const n = Number(draft);
      if (!Number.isFinite(n)) {
        setEditing(null);
        return;
      }
      if (editing === 'age')        setAge(n);
      if (editing === 'weight')     setWeight(n);
      if (editing === 'height')     setHeight(n);
      if (editing === 'restingHr')  setRestingHr(draft === '' ? null : n);
    }
    setEditing(null);
  };

  return (
    <div
      className="v3-shell v3-bg"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100%',
      }}
    >
      <V3StatusBar title="PROFILE / 01" />

      <div
        style={{
          padding: '0 20px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 110px)',
          paddingBottom: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          color: '#fff',
        }}
      >
        {/* Identity */}
        <button
          type="button"
          onClick={() => startEdit('name', name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            textAlign: 'left',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'inherit',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--xg-brand-400), var(--xg-accent-400))',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            {initial}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              {displayName.toUpperCase()}
            </div>
            <div
              className="v3-mono"
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.16em',
                marginTop: 2,
              }}
            >
              ATHLETE
            </div>
          </div>
        </button>

        {/* Big max HR display */}
        <div className="v3-card-strong" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
          <V3ECG height={44} color="var(--xg-accent-400)" />
          <div className="v3-eyebrow" style={{ marginTop: 8 }}>
            MAX HEART RATE
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: -4 }}>
            <span className="v3-num" style={{ fontSize: 96, color: '#fff', lineHeight: 1 }}>
              {maxHR}
            </span>
            <span
              className="v3-mono"
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                paddingBottom: 14,
                letterSpacing: '0.16em',
              }}
            >
              BPM
            </span>
          </div>
          <div
            className="v3-mono"
            style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}
          >
            220 − {age ?? '—'}
          </div>
        </div>

        {/* Body metrics row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 1,
            background: 'rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ background: '#0A0B0F', padding: 14, cursor: 'pointer' }} onClick={() => startEdit('age', age)}>
            <Telem label="AGE" value={age ?? '—'} unit="YR" size={26} />
          </div>
          <div style={{ background: '#0A0B0F', padding: 14, cursor: 'pointer' }} onClick={() => startEdit('weight', weight)}>
            <Telem label="WEIGHT" value={weight ?? '—'} unit="KG" size={26} />
          </div>
          <div style={{ background: '#0A0B0F', padding: 14, cursor: 'pointer' }} onClick={() => startEdit('height', height)}>
            <Telem label="HEIGHT" value={height ?? '—'} unit="CM" size={26} />
          </div>
        </div>

        {/* Resting HR row */}
        <div className="v3-card-strong" style={{ padding: 0 }}>
          <button
            type="button"
            onClick={() => startEdit('restingHr', restingHr)}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '14px 16px',
              background: 'transparent',
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
              }}
            >
              RESTING HR
            </div>
            <span className="v3-num" style={{ fontSize: 22, color: restingHr ? '#fff' : 'rgba(255,255,255,0.35)', flex: 1 }}>
              {restingHr ?? '—'}
            </span>
            <span
              className="v3-mono"
              style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}
            >
              BPM
            </span>
          </button>
        </div>

        {/* Zones grid */}
        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>
            HR ZONES · 5
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            {ZONE_CONFIGS.map((z) => {
              const bpmLo = Math.round(maxHR * (z.minPct / 100));
              const bpmHi = Math.round(maxHR * (z.maxPct / 100));
              return (
                <div
                  key={z.zone}
                  style={{
                    background: '#0A0B0F',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderLeft: `3px solid var(--hr-z${z.zone}-solid)`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: `var(--hr-z${z.zone}-solid)`,
                      width: 28,
                      letterSpacing: '-0.04em',
                    }}
                  >
                    Z{z.zone}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#fff',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {z.label}
                    </div>
                    <div
                      className="v3-mono"
                      style={{
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.45)',
                        letterSpacing: '0.08em',
                        marginTop: 1,
                      }}
                    >
                      {z.hint}
                    </div>
                  </div>
                  <div className="v3-num" style={{ fontSize: 14, color: '#fff' }}>
                    {bpmLo}–{bpmHi}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={editing != null} onClose={() => setEditing(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 12 }}>
          {editing}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type={editing === 'name' ? 'text' : 'number'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
