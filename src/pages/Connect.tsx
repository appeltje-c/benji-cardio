import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import BluetoothSearchingIcon from '@mui/icons-material/BluetoothSearching';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { scanAndConnectHRM, disconnectHRM } from '../services/bluetooth';
import { useHeartRateStore } from '../stores/heartRateStore';
import { useProfileStore } from '../stores/profileStore';
import { usePlayerStore } from '../stores/playerStore';
import { useSpotifyStore } from '../stores/spotifyStore';
import HeartRateDisplay from '../components/HeartRateDisplay';

export default function Connect() {
  const { isConnected, deviceName, setBpm, setConnected } = useHeartRateStore();
  const maxHR = useProfileStore((s) => s.getMaxHR());
  const age = useProfileStore((s) => s.age);
  const spotify = useSpotifyStore();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    spotify.initListeners();
  }, []);

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
      {/* Heart Rate Monitor Section */}
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

      <Typography variant="body2" color="text.secondary">
        Supports any Bluetooth heart rate monitor using the standard Heart Rate Service (GATT 0x180D),
        including Decathlon Kalenji HRM belts.
      </Typography>

      <Divider />

      {/* Spotify Section */}
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Spotify
      </Typography>

      {spotify.error && <Alert severity="error">{spotify.error}</Alert>}

      {spotify.isConnected ? (
        <>
          <Alert severity="success" icon={<MusicNoteIcon />}>
            Connected as {spotify.displayName}
          </Alert>
          {spotify.currentTrack && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(30, 215, 96, 0.1)',
                border: '1px solid rgba(30, 215, 96, 0.3)',
              }}
            >
              <MusicNoteIcon sx={{ color: '#1DB954' }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }} noWrap>
                  {spotify.currentTrack.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {spotify.currentTrack.artist}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: spotify.isPaused ? 'text.secondary' : '#1DB954' }}>
                {spotify.isPaused ? 'Paused' : 'Playing'}
              </Typography>
            </Box>
          )}
          <Button variant="outlined" color="error" onClick={spotify.disconnect}>
            Disconnect Spotify
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          size="large"
          onClick={spotify.connect}
          startIcon={<MusicNoteIcon />}
          sx={{
            py: 2,
            bgcolor: '#1DB954',
            '&:hover': { bgcolor: '#1aa34a' },
          }}
        >
          Connect Spotify
        </Button>
      )}

      <Typography variant="body2" color="text.secondary">
        Connect Spotify to auto-sync playback with your training. Requires Spotify Premium and the Spotify app installed.
      </Typography>
    </Box>
  );
}
