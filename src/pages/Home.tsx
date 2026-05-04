import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTrainingStore } from '../stores/trainingStore';
import { formatTime } from '../utils/zones';
import ZoneCurvePreview from '../components/ZoneCurvePreview';

export default function Home() {
  const { trainings, addTraining, deleteTraining } = useTrainingStore();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTrainingId, setMenuTrainingId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = addTraining(newName.trim());
    setNewName('');
    setDialogOpen(false);
    navigate(`/training/${id}/edit`);
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuTrainingId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuTrainingId(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Trainings
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New
        </Button>
      </Box>

      {trainings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="h6">No trainings yet</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Create your first training to get started
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {trainings.map((t) => {
            const totalSeconds = t.segments.reduce((sum, s) => sum + s.durationSeconds, 0);
            const canPlay = t.segments.length > 0;
            return (
              <Box
                key={t.id}
                sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden', p: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <IconButton
                    onClick={() => navigate(`/player/${t.id}`)}
                    disabled={!canPlay}
                    sx={{
                      bgcolor: canPlay ? 'primary.main' : 'action.disabledBackground',
                      color: '#fff',
                      width: 52,
                      height: 52,
                      flexShrink: 0,
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&.Mui-disabled': { color: 'action.disabled' },
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: 32 }} />
                  </IconButton>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }} noWrap>
                      {t.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.segments.length} segments · {formatTime(totalSeconds)}
                    </Typography>
                  </Box>
                  <IconButton onClick={(e) => handleMenuOpen(e, t.id)} edge="end">
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                {t.segments.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <ZoneCurvePreview segments={t.segments} height={40} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Dot menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); if (menuTrainingId) navigate(`/training/${menuTrainingId}/edit`); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); if (menuTrainingId) deleteTraining(menuTrainingId); }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Training</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Training name"
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
    </Box>
  );
}
