import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import BluetoothSearchingIcon from '@mui/icons-material/BluetoothSearching';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';
import { scanAndConnectHRM, disconnectHRM } from '../services/bluetooth';
import { useHeartRateStore } from '../stores/heartRateStore';
import { useProfileStore } from '../stores/profileStore';
import { usePlayerStore } from '../stores/playerStore';
import HeartRateDisplay from '../components/HeartRateDisplay';

export default function Connect() {
  const { isConnected, deviceName, setBpm, setConnected } = useHeartRateStore();
  const maxHR = useProfileStore((s) => s.getMaxHR());
  const age = useProfileStore((s) => s.age);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setScanning(true);
    setError(null);
    try {
      const name = await scanAndConnectHRM((hr) => {
        const elapsed = usePlayerStore.getState().elapsedMs;
        setBpm(hr, elapsed);
      });
      setConnected(true, name);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect');
    } finally {
      setScanning(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectHRM();
    setConnected(false);
    setBpm(0, 0);
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Heart Rate Monitor
      </Typography>

      <Alert severity="info">
        Max HR: <strong>{maxHR} BPM</strong>
        {age ? ` (220 − ${age})` : ' — set your age in Profile for a personal value'}
      </Alert>

      {error && <Alert severity="error">{error}</Alert>}

      {isConnected ? (
        <>
          <Alert severity="success" icon={<BluetoothConnectedIcon />}>
            Connected to {deviceName ?? 'HRM'}
          </Alert>
          <HeartRateDisplay />
          <Button variant="outlined" color="error" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          size="large"
          startIcon={<BluetoothSearchingIcon />}
          onClick={handleConnect}
          disabled={scanning}
          sx={{ py: 2 }}
        >
          {scanning ? 'Scanning...' : 'Connect HRM Belt'}
        </Button>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Supports any Bluetooth heart rate monitor using the standard Heart Rate Service (GATT 0x180D),
          including Decathlon Kalenji HRM belts.
        </Typography>
      </Box>
    </Box>
  );
}
