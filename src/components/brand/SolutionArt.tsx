import { cn } from "@/lib/utils/cn";

export type SolutionKey = "solar" | "solar-battery" | "battery" | "ev" | "heat-pump" | "whole-home";

/** Compact illustrated scenes for the six solutions, one consistent style. */
export function SolutionArt({ kind, className }: { kind: SolutionKey; className?: string }) {
  return (
    <svg viewBox="0 0 240 160" className={cn("h-full w-full", className)} aria-hidden="true">
      <defs>
        <linearGradient id={`sa-panel-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b3a5e" />
          <stop offset="100%" stopColor="#0b1d33" />
        </linearGradient>
      </defs>
      {kind === "solar" && (
        <g>
          <path d="M20 120 L120 40 L220 120Z" fill="#273a54" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3, 4].map((c) => {
              const y = 58 + r * 20;
              const span = ((y - 40) / 80) * 200;
              const x = 120 - span / 2 + 8 + c * (span - 16) / 5;
              return <rect key={`${r}${c}`} x={x} y={y} width={(span - 16) / 5 - 3} height="17" rx="1.5" fill={`url(#sa-panel-${kind})`} stroke="#5f8fc2" strokeOpacity="0.5" />;
            }),
          )}
          <circle cx="200" cy="34" r="16" fill="#ffc32b" />
          <rect x="20" y="120" width="200" height="20" fill="#f3ecdc" />
        </g>
      )}
      {kind === "solar-battery" && (
        <g>
          <path d="M20 100 L100 40 L180 100Z" fill="#273a54" />
          {[0, 1].map((r) =>
            [0, 1, 2, 3].map((c) => {
              const y = 60 + r * 20;
              const span = ((y - 40) / 60) * 160;
              const x = 100 - span / 2 + 8 + c * (span - 16) / 4;
              return <rect key={`${r}${c}`} x={x} y={y} width={(span - 16) / 4 - 3} height="17" rx="1.5" fill={`url(#sa-panel-${kind})`} stroke="#5f8fc2" strokeOpacity="0.5" />;
            }),
          )}
          <rect x="20" y="100" width="160" height="40" fill="#f3ecdc" />
          <rect x="190" y="70" width="34" height="70" rx="5" fill="#fff" stroke="#c9bfa8" />
          <rect x="197" y="80" width="20" height="8" rx="1.5" fill="#1f9d63" />
          <rect x="197" y="92" width="20" height="8" rx="1.5" fill="#1f9d63" />
          <rect x="197" y="104" width="20" height="8" rx="1.5" fill="#1f9d63" />
          <rect x="197" y="116" width="20" height="8" rx="1.5" fill="#e9e0cb" />
          <path d="M150 80 q30 -20 45 -5" fill="none" stroke="#ffc32b" strokeWidth="3" strokeDasharray="4 5" />
        </g>
      )}
      {kind === "battery" && (
        <g>
          <rect x="70" y="20" width="100" height="120" rx="12" fill="#fff" stroke="#c9bfa8" strokeWidth="2" />
          <rect x="86" y="36" width="68" height="16" rx="3" fill="#1f9d63" />
          <rect x="86" y="58" width="68" height="16" rx="3" fill="#1f9d63" />
          <rect x="86" y="80" width="68" height="16" rx="3" fill="#1f9d63" />
          <rect x="86" y="102" width="68" height="16" rx="3" fill="#e9e0cb" />
          <circle cx="120" cy="128" r="3" fill="#ffc32b" />
          <path d="M40 60 q-20 40 0 80" fill="none" stroke="#ffc32b" strokeWidth="3" strokeLinecap="round" />
          <path d="M200 60 q20 40 0 80" fill="none" stroke="#ffc32b" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {kind === "ev" && (
        <g>
          <rect x="20" y="90" width="150" height="38" rx="16" fill="#0b1d33" />
          <path d="M48 92 L72 68 L128 68 L148 92Z" fill="#0b1d33" />
          <path d="M56 90 L76 73 L124 73 L138 90Z" fill="#b7d4f2" />
          <circle cx="55" cy="130" r="13" fill="#0b1d33" stroke="#fbf7ee" strokeWidth="3" />
          <circle cx="135" cy="130" r="13" fill="#0b1d33" stroke="#fbf7ee" strokeWidth="3" />
          <rect x="190" y="40" width="34" height="56" rx="8" fill="#fff" stroke="#c9bfa8" strokeWidth="2" />
          <circle cx="207" cy="58" r="6" fill="#1f9d63" />
          <path d="M165 100 q25 -10 35 -4" fill="none" stroke="#0b1d33" strokeWidth="4" strokeLinecap="round" />
          <rect x="155" y="100" width="12" height="8" rx="2" fill="#ffc32b" />
        </g>
      )}
      {kind === "heat-pump" && (
        <g>
          <rect x="50" y="40" width="140" height="90" rx="12" fill="#fff" stroke="#c9bfa8" strokeWidth="2" />
          <circle cx="100" cy="85" r="30" fill="#f3ecdc" stroke="#c9bfa8" strokeWidth="2" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d="M100 85 L100 60" stroke="#0b1d33" strokeWidth="5" strokeLinecap="round" transform={`rotate(${i * 60} 100 85)`} />
          ))}
          <rect x="150" y="60" width="26" height="6" rx="3" fill="#e9e0cb" />
          <rect x="150" y="74" width="26" height="6" rx="3" fill="#e9e0cb" />
          <rect x="150" y="88" width="26" height="6" rx="3" fill="#e9e0cb" />
          <path d="M200 60 q10 10 0 20 q-10 10 0 20" fill="none" stroke="#ff6b4a" strokeWidth="3" strokeLinecap="round" />
          <path d="M215 60 q10 10 0 20 q-10 10 0 20" fill="none" stroke="#ff6b4a" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {kind === "whole-home" && (
        <g>
          <path d="M40 90 L120 30 L200 90Z" fill="#273a54" />
          <rect x="60" y="90" width="120" height="50" fill="#f3ecdc" />
          {[0, 1, 2].map((c) => (
            <rect key={c} x={80 + c * 28} y="60" width="24" height="18" rx="1.5" fill={`url(#sa-panel-${kind})`} stroke="#5f8fc2" strokeOpacity="0.5" />
          ))}
          <rect x="190" y="100" width="20" height="40" rx="4" fill="#fff" stroke="#c9bfa8" />
          <rect x="194" y="106" width="12" height="5" rx="1" fill="#1f9d63" />
          <rect x="194" y="114" width="12" height="5" rx="1" fill="#1f9d63" />
          <rect x="20" y="118" width="40" height="18" rx="8" fill="#0b1d33" />
          <circle cx="28" cy="138" r="5" fill="#0b1d33" stroke="#fbf7ee" strokeWidth="2" />
          <circle cx="52" cy="138" r="5" fill="#0b1d33" stroke="#fbf7ee" strokeWidth="2" />
          <circle cx="215" cy="30" r="14" fill="#ffc32b" />
          <path d="M120 78 L120 140" stroke="#ffc32b" strokeWidth="3" strokeDasharray="4 5" />
        </g>
      )}
    </svg>
  );
}
