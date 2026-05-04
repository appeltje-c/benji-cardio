import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import Connect from './pages/Connect';
import Profile from './pages/Profile';
import TrainingEditor from './pages/TrainingEditor';
import TrainingPlayer from './pages/TrainingPlayer';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/connect"
            element={
              <Layout>
                <Connect />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
          <Route path="/training/:id/edit" element={<TrainingEditor />} />
          <Route path="/player/:id" element={<TrainingPlayer />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
