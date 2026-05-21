import { useLocation, useNavigate } from 'react-router-dom';

type TabId = 'home' | 'lib' | 'rec' | 'me';

const TABS: { id: TabId; label: string; path: string }[] = [
  { id: 'home', label: 'HOME', path: '/' },
  { id: 'lib',  label: 'LIB',  path: '/library' },
  { id: 'rec',  label: 'REC',  path: '/activity' },
  { id: 'me',   label: 'ME',   path: '/profile' },
];

export default function V3TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const activePath = location.pathname;
  const active: TabId | undefined = TABS.find((t) =>
    t.path === '/' ? activePath === '/' : activePath.startsWith(t.path)
  )?.id;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 5,
        height: 'calc(78px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'calc(18px + env(safe-area-inset-bottom, 0px))',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: '#0A0B0F',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'var(--xg-font-mono)',
      }}
    >
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => navigate(t.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: isActive ? 'var(--xg-accent-400)' : 'rgba(255,255,255,0.4)',
              position: 'relative',
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 16,
                  height: 2,
                  background: 'var(--xg-accent-400)',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
