import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { useStretchStore } from '../stores/stretchStore';
import { BODY_REGIONS, getStretch, stretchesByRegion } from '../data/stretchLibrary';
import type { BodyRegion, StretchExercise } from '../types';
import V3StatusBar from '../components/v3/V3StatusBar';
import Telem from '../components/v3/Telem';

export default function StretchEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useStretchStore();
  const routine = store.routines.find((r) => r.id === id);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [region, setRegion] = useState<BodyRegion>('Neck');
  const [detail, setDetail] = useState<StretchExercise | null>(null);
  const [editSegId, setEditSegId] = useState<string | null>(null);
  const [nameEditing, setNameEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  if (!routine || !id) {
    return (
      <div className="v3-shell v3-bg" style={{ padding: 24, color: '#fff' }}>
        <div>Routine not found</div>
        <Button onClick={() => navigate('/library')}>Back</Button>
      </div>
    );
  }

  const totalReps = routine.segments.reduce((sum, s) => sum + s.reps, 0);
  const regionsUsed = new Set(
    routine.segments.map((s) => getStretch(s.exerciseId)?.region).filter(Boolean)
  ).size;

  const editingSeg = routine.segments.find((s) => s.id === editSegId) ?? null;
  const editingEx = editingSeg ? getStretch(editingSeg.exerciseId) : null;

  return (
    <div className="v3-shell v3-bg" style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
      <V3StatusBar
        title="STRETCH BUILDER"
        onBack={() => navigate(-1)}
        action={
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="v3-mono"
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 6,
              border: 0,
              background: 'var(--xg-accent-400)',
              color: '#0A0B0F',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              cursor: 'pointer',
              fontFamily: 'var(--xg-font-mono)',
            }}
          >
            SAVE
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
          gap: 16,
          color: '#fff',
        }}
      >
        <div>
          <div className="v3-eyebrow" style={{ color: 'var(--xg-accent-400)' }}>
            STRETCH ROUTINE
          </div>
          <button
            type="button"
            onClick={() => {
              setNameDraft(routine.name);
              setNameEditing(true);
            }}
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: '#fff',
              marginTop: 6,
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              width: '100%',
            }}
          >
            {routine.name}
          </button>
        </div>

        {/* Summary ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 1,
            background: 'rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ background: '#0A0B0F', padding: '12px 14px' }}>
            <Telem label="EXERCISES" value={routine.segments.length} size={20} />
          </div>
          <div style={{ background: '#0A0B0F', padding: '12px 14px' }}>
            <Telem label="TOTAL REPS" value={totalReps || '—'} size={20} />
          </div>
          <div style={{ background: '#0A0B0F', padding: '12px 14px' }}>
            <Telem label="REGIONS" value={regionsUsed || '—'} size={20} />
          </div>
        </div>

        <div className="v3-eyebrow">EXERCISES</div>

        {/* Segment list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {routine.segments.map((s, i) => {
            const ex = getStretch(s.exerciseId);
            if (!ex) return null;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setEditSegId(s.id)}
                className="v3-card"
                style={{
                  padding: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  color: 'inherit',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <span
                  className="v3-mono"
                  style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', width: 18 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <img
                  src={ex.images[0]}
                  alt=""
                  style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 6, background: '#111' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{ex.name}</div>
                  <div
                    className="v3-mono"
                    style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginTop: 1 }}
                  >
                    {ex.region.toUpperCase()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="v3-num" style={{ fontSize: 18, color: '#fff' }}>
                    ×{s.reps}
                  </div>
                  <div
                    className="v3-mono"
                    style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em' }}
                  >
                    {ex.perSide ? 'EACH SIDE' : 'TIMES'}
                  </div>
                </div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="v3-btn v3-btn-ghost"
            style={{ height: 40, fontSize: 11 }}
          >
            <AddIcon sx={{ fontSize: 14 }} /> ADD EXERCISE
          </button>
        </div>
      </div>

      {/* ---- Library picker (full screen) ---- */}
      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} fullScreen>
        <div className="v3-shell v3-bg" style={{ minHeight: '100%', color: '#fff' }}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 5,
              background: 'rgba(10,11,15,0.92)',
              backdropFilter: 'blur(12px)',
              padding: '14px 16px 10px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <IconButton onClick={() => setPickerOpen(false)} size="small" sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
              <div
                className="v3-mono"
                style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.8)' }}
              >
                STRETCH LIBRARY
              </div>
            </div>
            {/* Region tabs */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
              {BODY_REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  className="v3-mono"
                  style={{
                    flex: '0 0 auto',
                    padding: '6px 12px',
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: r === region ? 'var(--xg-accent-400)' : 'rgba(255,255,255,0.14)',
                    background: r === region ? 'rgba(255,85,31,0.14)' : 'transparent',
                    color: r === region ? 'var(--xg-accent-400)' : 'rgba(255,255,255,0.6)',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stretchesByRegion(region).map((ex) => {
              const count = routine.segments.filter((s) => s.exerciseId === ex.id).length;
              return (
                <div key={ex.id} className="v3-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setDetail(ex)}
                    style={{
                      display: 'flex',
                      gap: 0,
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <img
                      src={ex.images[0]}
                      alt=""
                      style={{ width: 96, height: 84, objectFit: 'cover', background: '#111' }}
                    />
                    <div style={{ padding: '10px 12px', flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{ex.name}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.55)',
                          marginTop: 4,
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {ex.benefits}
                      </div>
                    </div>
                  </button>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span
                      className="v3-mono"
                      style={{ fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)' }}
                    >
                      {count > 0 ? `ADDED ×${count}` : `SUGGESTED ×${ex.defaultReps}${ex.perSide ? ' / SIDE' : ''}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => store.addSegment(id, ex.id)}
                      className="v3-mono"
                      style={{
                        marginLeft: 'auto',
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid var(--xg-accent-400)',
                        background: 'rgba(255,85,31,0.12)',
                        color: 'var(--xg-accent-400)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <AddIcon sx={{ fontSize: 14 }} /> ADD
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Dialog>

      {/* ---- Exercise detail ---- */}
      <Dialog open={detail != null} onClose={() => setDetail(null)} fullWidth maxWidth="xs">
        {detail && (
          <div style={{ background: '#0A0B0F', color: '#fff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(255,255,255,0.08)' }}>
              {detail.images.map((src, i) => (
                <div key={i} style={{ position: 'relative', background: '#111' }}>
                  <img src={src} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
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
            <div style={{ padding: 18 }}>
              <div className="v3-eyebrow" style={{ color: 'var(--xg-accent-400)' }}>
                {detail.region.toUpperCase()}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 4 }}>
                {detail.name}
              </div>

              <div className="v3-eyebrow" style={{ marginTop: 16 }}>
                HOW TO DO IT
              </div>
              <ol style={{ margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {detail.howTo.map((step, i) => (
                  <li key={i} style={{ fontSize: 13, lineHeight: 1.45, color: 'rgba(255,255,255,0.85)' }}>
                    {step}
                  </li>
                ))}
              </ol>

              <div className="v3-eyebrow" style={{ marginTop: 16 }}>
                GOOD FOR
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
                {detail.benefits}
              </p>
            </div>
            <DialogActions sx={{ px: 2, pb: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button onClick={() => setDetail(null)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  store.addSegment(id, detail.id);
                  setDetail(null);
                }}
              >
                Add to routine
              </Button>
            </DialogActions>
          </div>
        )}
      </Dialog>

      {/* ---- Segment rep editor ---- */}
      <Dialog open={editingSeg != null} onClose={() => setEditSegId(null)} fullWidth maxWidth="xs">
        {editingSeg && editingEx && (
          <>
            <DialogTitle sx={{ textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 12 }}>
              {editingEx.name}
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <div
                className="v3-mono"
                style={{ fontSize: 10, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}
              >
                {editingEx.perSide ? 'NUMBER OF TIMES (EACH SIDE)' : 'NUMBER OF TIMES'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
                <IconButton
                  onClick={() =>
                    store.updateSegment(id, editingSeg.id, { reps: Math.max(1, editingSeg.reps - 1) })
                  }
                  sx={{ border: '1px solid rgba(255,255,255,0.18)', color: '#fff' }}
                >
                  <RemoveIcon />
                </IconButton>
                <div className="v3-num" style={{ fontSize: 48, minWidth: 70, textAlign: 'center', color: '#fff' }}>
                  {editingSeg.reps}
                </div>
                <IconButton
                  onClick={() => store.updateSegment(id, editingSeg.id, { reps: editingSeg.reps + 1 })}
                  sx={{ border: '1px solid rgba(255,255,255,0.18)', color: '#fff' }}
                >
                  <AddIcon />
                </IconButton>
              </div>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
              <IconButton
                onClick={() => {
                  store.removeSegment(id, editingSeg.id);
                  setEditSegId(null);
                }}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
              <Button variant="contained" startIcon={<CheckIcon />} onClick={() => setEditSegId(null)}>
                Done
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ---- Name editor ---- */}
      <Dialog open={nameEditing} onClose={() => setNameEditing(false)} fullWidth maxWidth="xs">
        <DialogTitle>Routine name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                store.updateRoutineName(id, nameDraft.trim() || routine.name);
                setNameEditing(false);
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNameEditing(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              store.updateRoutineName(id, nameDraft.trim() || routine.name);
              setNameEditing(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
