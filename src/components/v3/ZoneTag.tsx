import type { Zone } from '../../types';

interface Props {
  zone: Zone;
  prefix?: string;
}

export default function ZoneTag({ zone, prefix }: Props) {
  return (
    <span className={`v3-zone-tag zone-${zone}`}>
      {prefix ? `${prefix} ` : ''}Z{zone}
    </span>
  );
}
