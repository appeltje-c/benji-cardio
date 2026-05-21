import type { ReactNode } from 'react';
import V3TabBar from './v3/V3TabBar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      className="v3-shell v3-bg"
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'auto', paddingBottom: 'calc(78px + env(safe-area-inset-bottom, 0px))' }}>
        {children}
      </div>
      <V3TabBar />
    </div>
  );
}
