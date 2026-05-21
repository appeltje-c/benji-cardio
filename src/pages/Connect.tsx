import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import RadarIcon from '@mui/icons-material/Radar';
import { scanAndConnectHRM, disconnectHRM } from '../services/bluetooth';
import { useHeartRateStore } from '../stores/heartRateStore';
import { usePlayerStore } from '../stores/playerStore';
import { useSpotifyStore } from '../stores/spotifyStore';
import V3StatusBar from '../components/v3/V3StatusBar';

export default function Connect() {
  const navigate = useNavigate();
  const { isConnected, deviceName, setBpm, setConnected } = useHeartRateStore();
  const spotify = useSpotifyStore();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    spotify.initListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div
      className="v3-shell v3-bg"
      style={{ position: 'relative', width: '100%', minHeight: '100%' }}
    >
      <V3StatusBar title="DEVICES / SCAN" onBack={() => navigate(-1)} />

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
        {/* Radar */}
        <div style={{ display: 'grid', placeItems: 'center', padding: '16px 0', position: 'relative' }}>
          <div style={{ position: 'relative', width: 200, height: 200 }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '1px dashed rgba(255,255,255,0.12)',
                  transform: `scale(${i / 4})`,
                }}
              />
            ))}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, transparent 0deg, var(--xg-accent-400) 60deg, transparent 90deg)',
                opacity: scanning ? 0.55 : 0.25,
                animation: scanning ? 'v3-radar-sweep 1.6s linear infinite' : undefined,
              }}
            />
            <style>{`@keyframes v3-radar-sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 36,
                height: 36,
                borderRadius: 18,
                background: 'var(--xg-accent-400)',
                display: 'grid',
                placeItems: 'center',
                color: '#0A0B0F',
                boxShadow: '0 0 24px var(--xg-accent-400)',
              }}
            >
              <RadarIcon sx={{ fontSize: 20 }} />
            </div>
            {isConnected && (
              <div
                style={{
                  position: 'absolute',
                  left: '65%',
                  top: '30%',
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: 'var(--xg-success-300)',
                  boxShadow: '0 0 12px var(--xg-success-300)',
                }}
              />
            )}
          </div>
        </div>

        <div
          className="v3-mono"
          style={{
            textAlign: 'center',
            fontSize: 10,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {scanning ? 'SCANNING · TAP A DEVICE IN THE OS DIALOG' : isConnected ? '1 DEVICE LINKED' : 'TAP SCAN BELOW TO START'}
        </div>

        {/* Device list — currently only the connected device + a scan CTA, because
            BleClient.requestDevice() routes through the OS picker, not an in-app list. */}
        <div className="v3-card-strong" style={{ padding: 0 }}>
          {isConnected ? (
            <div
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderLeft: '3px solid var(--xg-success-400)',
              }}
            >
              <FavoriteIcon sx={{ fontSize: 22, color: 'var(--xg-accent-400)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                  {deviceName ?? 'Heart-rate monitor'}
                </div>
                <div
                  className="v3-mono"
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.14em',
                    marginTop: 2,
                  }}
                >
                  HR SERVICE · 0x180D
                </div>
              </div>
              <button
                type="button"
                onClick={handleDisconnect}
                className="v3-mono"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.16)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  padding: '6px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'var(--xg-font-mono)',
                }}
              >
                UNLINK
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={scanning}
              style={{
                padding: '18px 16px',
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: scanning ? 'wait' : 'pointer',
                opacity: scanning ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              <FavoriteIcon sx={{ fontSize: 22, color: 'rgba(255,255,255,0.5)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {scanning ? 'Scanning…' : 'Scan for HRM belt'}
                </div>
                <div
                  className="v3-mono"
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.14em',
                    marginTop: 2,
                  }}
                >
                  ANY BLE DEVICE · GATT 0x180D
                </div>
              </div>
            </button>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              border: '1px solid rgba(216,32,32,0.45)',
              background: 'rgba(216,32,32,0.12)',
              borderRadius: 8,
              color: '#FF6F6F',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Spotify */}
        <div className="v3-eyebrow" style={{ marginTop: 16 }}>SPOTIFY</div>
        <div className="v3-card-strong" style={{ padding: 0 }}>
          {spotify.isConnected ? (
            <>
              <div
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderLeft: '3px solid #1DB954',
                }}
              >
                <MusicNoteIcon sx={{ fontSize: 22, color: '#1DB954' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                    {spotify.displayName ?? 'Spotify'}
                  </div>
                  {spotify.currentTrack && (
                    <div
                      className="v3-mono"
                      style={{
                        fontSize: 9,
                        color: 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.12em',
                        marginTop: 2,
                      }}
                    >
                      {spotify.currentTrack.name} · {spotify.currentTrack.artist}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={spotify.disconnect}
                  className="v3-mono"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.16)',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    padding: '6px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'var(--xg-font-mono)',
                  }}
                >
                  UNLINK
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={spotify.connect}
              style={{
                padding: '18px 16px',
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <MusicNoteIcon sx={{ fontSize: 22, color: '#1DB954' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Connect Spotify</div>
                <div
                  className="v3-mono"
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.14em',
                    marginTop: 2,
                  }}
                >
                  PREMIUM · APP REMOTE
                </div>
              </div>
            </button>
          )}
        </div>

        {spotify.error && (
          <div
            style={{
              padding: '10px 14px',
              border: '1px solid rgba(216,32,32,0.45)',
              background: 'rgba(216,32,32,0.12)',
              borderRadius: 8,
              color: '#FF6F6F',
              fontSize: 13,
            }}
          >
            {spotify.error}
          </div>
        )}
      </div>
    </div>
  );
}
