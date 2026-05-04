import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useHeartRateStore } from '../stores/heartRateStore';
import { getZoneColor } from '../utils/zones';

const navItems = [
  { label: 'Trainings', icon: <FitnessCenterIcon />, path: '/' },
  { label: 'Connect', icon: <BluetoothIcon />, path: '/connect' },
  { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { bpm, zone, isConnected } = useHeartRateStore();

  const currentTab = navItems.findIndex((item) => item.path === location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 'env(safe-area-inset-top)' }}>
      {isConnected && bpm > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 0.5,
            bgcolor: getZoneColor(zone),
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <FavoriteIcon sx={{ fontSize: 16 }} />
          {bpm} BPM — Zone {zone}
        </Box>
      )}
      <Box sx={{ flex: 1, overflow: 'auto' }}>{children}</Box>
      <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <BottomNavigation
          value={currentTab === -1 ? false : currentTab}
          onChange={(_, idx) => navigate(navItems[idx].path)}
          sx={{ bgcolor: 'transparent' }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
        <Box sx={{ height: 'env(safe-area-inset-bottom)', bgcolor: 'background.paper' }} />
      </Box>
    </Box>
  );
}
