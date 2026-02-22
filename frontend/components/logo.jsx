export function Logo({ className = "h-8", ...props }) {
  return (
    <svg
      viewBox="0 0 220 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="geoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <clipPath id="textClip">
          <text x="4" y="36" fontFamily="Georgia, 'Times New Roman', serif" fontSize="34" fontWeight="bold" letterSpacing="-0.5">Ian Ronk</text>
        </clipPath>
      </defs>

      {/* Grid lines through text - geo/topo feel */}
      <g clipPath="url(#textClip)">
        <rect width="220" height="48" fill="currentColor" />
        {/* Latitude lines */}
        <line x1="0" y1="10" x2="220" y2="10" stroke="url(#geoGradient)" strokeWidth="1.2" opacity="0.5" />
        <line x1="0" y1="20" x2="220" y2="20" stroke="url(#geoGradient)" strokeWidth="1.2" opacity="0.5" />
        <line x1="0" y1="30" x2="220" y2="30" stroke="url(#geoGradient)" strokeWidth="1.2" opacity="0.5" />
        <line x1="0" y1="40" x2="220" y2="40" stroke="url(#geoGradient)" strokeWidth="1.2" opacity="0.5" />
        {/* Longitude / meridian lines */}
        <line x1="30" y1="0" x2="30" y2="48" stroke="url(#geoGradient)" strokeWidth="0.8" opacity="0.3" />
        <line x1="60" y1="0" x2="60" y2="48" stroke="url(#geoGradient)" strokeWidth="0.8" opacity="0.3" />
        <line x1="90" y1="0" x2="90" y2="48" stroke="url(#geoGradient)" strokeWidth="0.8" opacity="0.3" />
        <line x1="120" y1="0" x2="120" y2="48" stroke="url(#geoGradient)" strokeWidth="0.8" opacity="0.3" />
        <line x1="150" y1="0" x2="150" y2="48" stroke="url(#geoGradient)" strokeWidth="0.8" opacity="0.3" />
        <line x1="180" y1="0" x2="180" y2="48" stroke="url(#geoGradient)" strokeWidth="0.8" opacity="0.3" />
        {/* Contour/topo curves */}
        <path d="M0 25 Q55 15 110 22 Q165 29 220 20" stroke="url(#geoGradient)" strokeWidth="1" opacity="0.4" fill="none" />
        <path d="M0 35 Q55 28 110 34 Q165 40 220 32" stroke="url(#geoGradient)" strokeWidth="0.8" opacity="0.3" fill="none" />
      </g>

      {/* Data point markers on text */}
      <circle cx="18" cy="12" r="2.5" fill="url(#geoGradient)" opacity="0.8" />
      <circle cx="75" cy="14" r="2" fill="url(#geoGradient)" opacity="0.6" />
      <circle cx="130" cy="12" r="2.5" fill="url(#geoGradient)" opacity="0.8" />
      <circle cx="185" cy="14" r="2" fill="url(#geoGradient)" opacity="0.6" />
      <circle cx="210" cy="16" r="1.5" fill="url(#geoGradient)" opacity="0.5" />

      {/* Connection lines between data points */}
      <line x1="18" y1="12" x2="75" y2="14" stroke="url(#geoGradient)" strokeWidth="0.8" opacity="0.25" strokeDasharray="3,3" />
      <line x1="75" y1="14" x2="130" y2="12" stroke="url(#geoGradient)" strokeWidth="0.8" opacity="0.25" strokeDasharray="3,3" />
      <line x1="130" y1="12" x2="185" y2="14" stroke="url(#geoGradient)" strokeWidth="0.8" opacity="0.25" strokeDasharray="3,3" />
    </svg>
  );
}
