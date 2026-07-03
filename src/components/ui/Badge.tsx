import type { StatusInfo } from '../../data/phases';

export function StatusBadge({ info }: { info: StatusInfo }) {
  return (
    <span className={`badge badge-${info.variant}`}>
      <span className="dot" />
      {info.label}
    </span>
  );
}
