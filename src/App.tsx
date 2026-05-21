import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import Library from './pages/Library';
import Activity from './pages/Activity';
import Connect from './pages/Connect';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import TrainingEditor from './pages/TrainingEditor';
import TrainingPlayer from './pages/TrainingPlayer';
import { useProfileStore } from './stores/profileStore';

function RequireProfile({ children }: { children: ReactNode }) {
  const age = useProfileStore((s) => s.age);
  if (age == null) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/"
            element={
              <RequireProfile>
                <Layout>
                  <Home />
                </Layout>
              </RequireProfile>
            }
          />
          <Route path="/library"  element={<Layout><Library /></Layout>} />
          <Route path="/activity" element={<Layout><Activity /></Layout>} />
          <Route path="/connect"  element={<Layout><Connect /></Layout>} />
          <Route path="/profile"  element={<Layout><Profile /></Layout>} />
          <Route path="/training/:id/edit" element={<TrainingEditor />} />
          <Route path="/player/:id" element={<TrainingPlayer />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
