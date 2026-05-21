import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTrainingStore } from '../stores/trainingStore';
import { formatTime } from '../utils/zones';
import V3StatusBar from '../components/v3/V3StatusBar';
import ZoneTag from '../components/v3/ZoneTag';

function fmtDur(seconds: number) {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} MIN`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}H ${r}M` : `${h}H`;
}

export default function Library() {
  const { trainings, addTraining } = useTrainingStore();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = addTraining(newName.trim());
    setNewName('');
    setDialogOpen(false);
    navigate(`/training/${id}/edit`);
  };

  return (
    <div
      className="v3-shell v3-bg"
      style={{ position: 'relative', width: '100%', minHeight: '100%' }}
    >
      <V3StatusBar
        title={`TRAININGS · ${String(trainings.length).padStart(2, '0')}`}
        action={
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: '1px solid var(--xg-accent-400)',
              background: 'rgba(255,85,31,0.12)',
              color: 'var(--xg-accent-400)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
          </button>
        }
      />

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
        <h1
          style={{
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            color: '#fff',
          }}
        >
          Pick your
          <br />
          <span style={{ color: 'var(--xg-accent-400)' }}>weapon.</span>
        </h1>

        <div
          className="v3-mono"
          style={{
            display: 'flex',
            gap: 14,
            fontSize: 11,
            letterSpacing: '0.16em',
            color: 'rgba(255,255,255,0.4)',
            paddingBottom: 4,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span
            style={{
              color: 'var(--xg-accent-400)',
              borderBottom: '2px solid var(--xg-accent-400)',
              paddingBottom: 8,
              marginBottom: -5,
            }}
          >
            ALL · {trainings.length}
          </span>
          <span style={{ opacity: 0.4 }}>FAVORITES</span>
          <span style={{ opacity: 0.4 }}>RECENT</span>
        </div>

        {trainings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 0',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <div
              className="v3-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.2em',
                marginBottom: 12,
              }}
            >
              NO TRAININGS YET
            </div>
            <button type="button" onClick={() => setDialogOpen(true)} className="v3-btn v3-btn-primary" style={{ maxWidth: 260, margin: '0 auto' }}>
              Create your first
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {trainings.map((t, idx) => {
              const total = t.segments.reduce((s, seg) => s + seg.durationSeconds, 0);
              const peak = t.segments.length
                ? (Math.max(...t.segments.map((s) => s.targetZone)) as 1 | 2 | 3 | 4 | 5)
                : 1;
              const canPlay = t.segments.length > 0;
              return (
                <div key={t.id} className="v3-card-strong" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      className="v3-mono"
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {t.segments.length > 0 && <ZoneTag zone={peak} prefix="PEAK" />}
                    <span
                      className="v3-mono"
                      style={{
                        marginLeft: 'auto',
                        fontSize: 10,
                        letterSpacing: '0.14em',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {total > 0 ? fmtDur(total) : formatTime(0)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(canPlay ? `/player/${t.id}` : `/training/${t.id}/edit`)}
                    style={{
                      padding: '6px 14px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        color: '#fff',
                        flex: 1,
                      }}
                    >
                      {t.name}
                    </div>
                    <PlayArrowIcon
                      sx={{ fontSize: 22, color: canPlay ? 'var(--xg-accent-400)' : 'rgba(255,255,255,0.25)' }}
                    />
                  </button>
                  {t.segments.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: 0,
                        height: 36,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {t.segments.map((s, i) => (
                        <div
                          key={s.id}
                          style={{
                            flex: s.durationSeconds,
                            background: `var(--hr-z${s.targetZone}-solid)`,
                            opacity: 0.85,
                            borderRight:
                              i < t.segments.length - 1 ? '1px solid #0A0B0F' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      gap: 0,
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/training/${t.id}/edit`)}
                      className="v3-mono"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.18em',
                        cursor: 'pointer',
                        fontFamily: 'var(--xg-font-mono)',
                        textAlign: 'left',
                      }}
                    >
                      EDIT
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New training</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
