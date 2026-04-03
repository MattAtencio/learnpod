"use client";

interface RingProps {
  pct: number;
  color: string;
  size?: number;
  stroke?: number;
}

export function Ring({ pct, color, size = 52, stroke = 5 }: RingProps) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

interface RingWithLabelProps extends RingProps {
  label?: string;
}

export function RingWithLabel({ pct, color, size = 52, stroke = 5, label }: RingWithLabelProps) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <Ring pct={pct} color={color} size={size} stroke={stroke} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-fraunces), Fraunces, serif", fontSize: size * 0.24, fontWeight: 600, color, lineHeight: 1 }}>
          {label || `${Math.round(pct * 100)}%`}
        </span>
      </div>
    </div>
  );
}
