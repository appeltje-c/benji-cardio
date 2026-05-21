import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTrainingStore } from '../stores/trainingStore';
import { ZONE_CONFIGS } from '../utils/zones';
import V3StatusBar from '../components/v3/V3StatusBar';
import Telem from '../components/v3/Telem';
import ZoneTag from '../components/v3/ZoneTag';
import type { Zone } from '../types';

function fmtTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function fmtDur(seconds: number) {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} MIN`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}H ${r}M` : `${h}H`;
}

interface SegmentDraft {
  id: string | null;
  minutes: number;
  seconds: number;
  zone: Zone;
  label: string;
}

const EMPTY_DRAFT: SegmentDraft = { id: null, minutes: 1, seconds: 0, zone: 3, label: '' };

export default function TrainingEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useTrainingStore();
  const training = store.trainings.find((t) => t.id === id);

  const [draft, setDraft] = useState<SegmentDraft | null>(null);
  const [nameEditing, setNameEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  if (!training || !id) {
    return (
      <div className="v3-shell v3-bg" style={{ padding: 24, color: '#fff' }}>
        <div>Training not found</div>
        <Button onClick={() => navigate('/library')}>Back</Button>
      </div>
    );
  }

  const totalSeconds = training.segments.reduce((sum, s) => sum + s.durationSeconds, 0);
  const avgZone = training.segments.length
    ? Math.round(
        training.segments.reduce((a, s) => a + s.targetZone * s.durationSeconds, 0) /
          Math.max(1, totalSeconds)
      )
    : 0;

  const openAdd = () => setDraft({ ...EMPTY_DRAFT });
  const openEdit = (segId: string) => {
    const seg = training.segments.find((s) => s.id === segId);
    if (!seg) return;
    setDraft({
      id: seg.id,
      minutes: Math.floor(seg.durationSeconds / 60),
      seconds: seg.durationSeconds % 60,
      zone: seg.targetZone,
      label: seg.label ?? '',
    });
  };

  const saveDraft = () => {
    if (!draft) return;
    const total = draft.minutes * 60 + draft.seconds;
    if (total <= 0) {
      setDraft(null);
      return;
    }
    if (draft.id) {
      store.updateSegment(id, draft.id, {
        durationSeconds: total,
        targetZone: draft.zone,
        label: draft.label || undefined,
      });
    } else {
      store.addSegment(id, total, draft.zone);
      // After add, attach label if provided by editing the new segment.
      if (draft.label) {
        const latest = useTrainingStore.getState().trainings.find((t) => t.id === id);
        const newSeg = latest?.segments[latest.segments.length - 1];
        if (newSeg) {
          store.updateSegment(id, newSeg.id, { label: draft.label });
        }
      }
    }
    setDraft(null);
  };

  const deleteDraft = () => {
    if (draft?.id) store.removeSegment(id, draft.id);
    setDraft(null);
  };

  return (
    <div
      className="v3-shell v3-bg"
      style={{ position: 'relative', width: '100%', minHeight: '100%' }}
    >
      <V3StatusBar
        title="BUILDER"
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
            WORKOUT · {training.segments.length > 0 && training.segments.some((s) => s.targetZone >= 4)
              ? 'INTERVAL'
              : 'ENDURANCE'}
          </div>
          <button
            type="button"
            onClick={() => {
              setNameDraft(training.name);
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
            {training.name}
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
            <Telem label="TOTAL" value={totalSeconds > 0 ? fmtDur(totalSeconds) : '—'} size={20} />
          </div>
          <div style={{ background: '#0A0B0F', padding: '12px 14px' }}>
            <Telem label="SEGMENTS" value={training.segments.length} size={20} />
          </div>
          <div style={{ background: '#0A0B0F', padding: '12px 14px' }}>
            <Telem
              label="AVG ZONE"
              value={avgZone ? `Z${avgZone}` : '—'}
              size={20}
              color={avgZone ? `var(--hr-z${avgZone}-solid)` : '#fff'}
            />
          </div>
        </div>

        <div className="v3-eyebrow">SEGMENTS</div>

        {/* Vertical rail timeline */}
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          <div
            style={{
              position: 'absolute',
              left: 11,
              top: 6,
              bottom: 6,
              width: 1,
              background: 'rgba(255,255,255,0.12)',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {training.segments.map((s, i) => {
              const zoneConfig = ZONE_CONFIGS[s.targetZone - 1];
              return (
                <div
                  key={s.id}
                  style={{ position: 'relative', display: 'flex', alignItems: 'stretch', gap: 12 }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: -19,
                      top: 18,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      background: '#0A0B0F',
                      border: `2px solid var(--hr-z${s.targetZone}-solid)`,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => openEdit(s.id)}
                    className="v3-card"
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      color: 'inherit',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        alignSelf: 'stretch',
                        borderRadius: 2,
                        background: `var(--hr-z${s.targetZone}-solid)`,
                      }}
                    />
                    <ZoneTag zone={s.targetZone} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                        {s.label || `Segment ${i + 1}`}
                      </div>
                      <div
                        className="v3-mono"
                        style={{
                          fontSize: 9,
                          color: 'rgba(255,255,255,0.4)',
                          letterSpacing: '0.12em',
                          marginTop: 1,
                        }}
                      >
                        {zoneConfig.label.toUpperCase()}
                      </div>
                    </div>
                    <div className="v3-num" style={{ fontSize: 18, color: '#fff' }}>
                      {fmtTime(s.durationSeconds)}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 8 }}>
            <button type="button" onClick={openAdd} className="v3-btn v3-btn-ghost" style={{ height: 40, fontSize: 11 }}>
              <AddIcon sx={{ fontSize: 14 }} /> ADD SEGMENT
            </button>
          </div>
        </div>
      </div>

      {/* Segment editor dialog */}
      <Dialog open={draft != null} onClose={() => setDraft(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 12 }}>
          {draft?.id ? 'Edit segment' : 'New segment'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Label"
            value={draft?.label ?? ''}
            onChange={(e) => draft && setDraft({ ...draft, label: e.target.value })}
            placeholder="Warm-up, Hard 1, Cool-down…"
            fullWidth
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <TextField
              label="Min"
              type="number"
              value={draft?.minutes ?? 0}
              onChange={(e) => draft && setDraft({ ...draft, minutes: Math.max(0, Number(e.target.value)) })}
              fullWidth
            />
            <TextField
              label="Sec"
              type="number"
              value={draft?.seconds ?? 0}
              onChange={(e) => draft && setDraft({ ...draft, seconds: Math.max(0, Math.min(59, Number(e.target.value))) })}
              fullWidth
            />
          </div>
          <FormControl fullWidth>
            <InputLabel>Target zone</InputLabel>
            <Select
              value={draft?.zone ?? 3}
              label="Target zone"
              onChange={(e) => draft && setDraft({ ...draft, zone: Number(e.target.value) as Zone })}
            >
              {ZONE_CONFIGS.map((z) => (
                <MenuItem key={z.zone} value={z.zone}>
                  Z{z.zone} — {z.label} ({z.minPct}-{z.maxPct}%)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          {draft?.id ? (
            <IconButton onClick={deleteDraft} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          ) : (
            <span />
          )}
          <div>
            <Button onClick={() => setDraft(null)}>Cancel</Button>
            <Button variant="contained" onClick={saveDraft}>Save</Button>
          </div>
        </DialogActions>
      </Dialog>

      {/* Name editor */}
      <Dialog open={nameEditing} onClose={() => setNameEditing(false)} fullWidth maxWidth="xs">
        <DialogTitle>Training name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                store.updateTrainingName(id, nameDraft.trim() || training.name);
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
              store.updateTrainingName(id, nameDraft.trim() || training.name);
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
