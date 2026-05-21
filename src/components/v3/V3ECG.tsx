interface Props {
  height?: number;
  color?: string;
  glow?: boolean;
}

export default function V3ECG({ height = 44, color = 'var(--xg-accent-400)', glow = true }: Props) {
  return (
    <svg viewBox="0 0 320 44" preserveAspectRatio="none" width="100%" height={height} style={{ overflow: 'visible' }}>
      <path
        d="M0 22 L40 22 L60 22 L72 12 L80 30 L88 4 L96 38 L104 22 L150 22 L180 22 L196 18 L202 28 L208 8 L216 36 L222 22 L260 22 L320 22"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={glow ? { filter: `drop-shadow(0 0 4px ${color})` } : undefined}
      />
    </svg>
  );
}
