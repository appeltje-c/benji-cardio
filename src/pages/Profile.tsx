import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useProfileStore } from '../stores/profileStore';

export default function Profile() {
  const { age, weight, height, setAge, setWeight, setHeight, getMaxHR } = useProfileStore();
  const maxHR = getMaxHR();

  const parseNum = (v: string) => {
    const n = Number(v);
    return v === '' ? null : isNaN(n) ? null : n;
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Profile
      </Typography>

      <Card>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Age"
            type="number"
            value={age ?? ''}
            onChange={(e) => setAge(parseNum(e.target.value))}
            helperText="Used to calculate max heart rate (220 − age)"
            slotProps={{ htmlInput: { min: 10, max: 100 } }}
          />
          <TextField
            label="Weight (kg)"
            type="number"
            value={weight ?? ''}
            onChange={(e) => setWeight(parseNum(e.target.value))}
            slotProps={{ htmlInput: { min: 20, max: 300, step: 0.1 } }}
          />
          <TextField
            label="Height (cm)"
            type="number"
            value={height ?? ''}
            onChange={(e) => setHeight(parseNum(e.target.value))}
            slotProps={{ htmlInput: { min: 100, max: 250 } }}
          />
        </CardContent>
      </Card>

      <Alert icon={<FavoriteIcon />} severity="info">
        Max heart rate: <strong>{maxHR} BPM</strong>
        {age ? ` (220 − ${age})` : ' (default — set your age for a personal value)'}
      </Alert>
    </Box>
  );
}
