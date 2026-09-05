/**
 * Cinematic auth scene: a hanging lamp that switches on and a small mascot
 * lit from above. Pure SVG + CSS (transform/opacity only) so it stays cheap
 * and respects prefers-reduced-motion via the classes in src/styles.css.
 */
export function AuthScene() {
  return (
    <div className="scene-stage" aria-hidden="true">
      <div className="scene-ambient" />
      <svg
        className="scene-art"
        viewBox="0 0 320 420"
        fill="none"
        role="presentation"
        focusable="false"
      >
        <defs>
          <radialGradient id="mizan-bloom" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.85" />
            <stop offset="55%" stopColor="var(--color-primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mizan-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mizan-shade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-secondary)" />
            <stop offset="100%" stopColor="var(--color-background)" />
          </linearGradient>
          <linearGradient id="mizan-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-card)" />
            <stop offset="100%" stopColor="var(--color-background)" />
          </linearGradient>
        </defs>

        {/* lamp: cord, shade, light */}
        <g className="scene-lamp">
          <line
            x1="160"
            y1="0"
            x2="160"
            y2="96"
            stroke="var(--color-border)"
            strokeWidth="2"
          />
          <path
            d="M124 132 L160 96 L196 132 Z"
            fill="url(#mizan-shade)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />
          <g className="scene-light">
            <path d="M126 134 L194 134 L246 330 L74 330 Z" fill="url(#mizan-cone)" />
            <circle cx="160" cy="146" r="72" fill="url(#mizan-bloom)" />
            <circle cx="160" cy="134" r="7" fill="var(--color-primary)" />
          </g>
        </g>

        {/* mascot */}
        <g className="scene-mascot">
          <ellipse cx="160" cy="352" rx="62" ry="12" fill="var(--color-background)" opacity="0.75" />
          <rect
            x="112"
            y="238"
            width="96"
            height="104"
            rx="30"
            fill="url(#mizan-body)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />
          <rect
            x="122"
            y="252"
            width="76"
            height="46"
            rx="18"
            fill="var(--color-background)"
            stroke="var(--color-primary)"
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />
          <circle className="scene-eye" cx="145" cy="275" r="7" fill="var(--color-primary)" />
          <circle className="scene-eye" cx="175" cy="275" r="7" fill="var(--color-primary)" />
          <rect x="140" y="312" width="40" height="6" rx="3" fill="var(--color-border)" />
          <rect x="96" y="262" width="14" height="44" rx="7" fill="var(--color-card)" stroke="var(--color-border)" />
          <rect x="210" y="262" width="14" height="44" rx="7" fill="var(--color-card)" stroke="var(--color-border)" />
          <rect x="152" y="222" width="16" height="18" rx="6" fill="var(--color-card)" stroke="var(--color-border)" />
        </g>
      </svg>
    </div>
  );
}
