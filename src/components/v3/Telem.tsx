import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
  unit?: string;
  color?: string;
  size?: number;
}

export default function Telem({ label, value, unit, color = '#fff', size = 32 }: Props) {
  return (
    <div>
      <div className="v3-eyebrow">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
        <span className="v3-num" style={{ fontSize: size, color, lineHeight: 1 }}>
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'var(--xg-font-mono)',
              fontWeight: 600,
              letterSpacing: 0.08,
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
