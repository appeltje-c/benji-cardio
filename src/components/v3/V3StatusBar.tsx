import type { ReactNode } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

interface Props {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
}

export default function V3StatusBar({ title, onBack, action }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        left: 0,
        right: 0,
        zIndex: 4,
        height: 52,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,11,15,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 20 }} />
        </button>
      )}
      <div
        className="v3-mono"
        style={{
          flex: 1,
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          paddingLeft: 4,
        }}
      >
        {title}
      </div>
      {action}
    </div>
  );
}
