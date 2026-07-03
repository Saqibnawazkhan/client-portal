interface LogoProps {
  size?: number;
  /** render the small satellite dot (defaults on) */
  satellite?: boolean;
  color?: string;
  satelliteColor?: string;
}

export function OrbitMark({
  size = 34,
  satellite = true,
  color = '#F26522',
  satelliteColor = '#16181D',
}: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flex: 'none' }} aria-hidden>
      <ellipse
        cx="20"
        cy="20"
        rx="16"
        ry="6.5"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        transform="rotate(28 20 20)"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="16"
        ry="6.5"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        transform="rotate(-28 20 20)"
        opacity="0.55"
      />
      <circle cx="20" cy="20" r="4.6" fill={color} />
      {satellite && <circle cx="33.2" cy="13.6" r="2.6" fill={satelliteColor} />}
    </svg>
  );
}

export function OrbitLogo({ onClick, subtitle = 'Client Portal' }: { onClick?: () => void; subtitle?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        background: 'none',
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        padding: 0,
      }}
    >
      <OrbitMark size={34} />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05, textAlign: 'left' }}>
        <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          Orbit
        </span>
        <span style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 500 }}>{subtitle}</span>
      </span>
    </button>
  );
}
