/** Consistent 48x48 line icons for the comparison journey. */
export type JourneyIconName =
  | "detached" | "semi-detached" | "terraced" | "bungalow" | "flat" | "other"
  | "pitched" | "flat-roof" | "unsure"
  | "south" | "south-east" | "south-west" | "east" | "west" | "north"
  | "solar" | "battery" | "ev" | "ev-charger" | "heat-pump" | "solar-battery" | "whole-home"
  | "homeowner" | "landlord" | "person"
  | "asap" | "1-3" | "3-6" | "research";

export function JourneyIcon({ name, className }: { name: JourneyIconName; className?: string }) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {name === "detached" && (<g {...s}><path d="M8 22 L24 9 L40 22" /><path d="M12 20v18h24V20" /><rect x="20" y="27" width="8" height="11" /><rect x="30" y="16" width="4" height="6" fill="currentColor" stroke="none" /></g>)}
      {name === "semi-detached" && (<g {...s}><path d="M4 22 L16 11 L28 22" /><path d="M28 22 L34 16 L44 22" /><path d="M7 20v18h34V20" /><line x1="28" y1="20" x2="28" y2="38" /><rect x="12" y="29" width="6" height="9" /><rect x="34" y="29" width="6" height="9" /></g>)}
      {name === "terraced" && (<g {...s}><path d="M3 20 L10 13 L17 20 L24 13 L31 20 L38 13 L45 20" /><path d="M5 19v19h38V19" /><line x1="17" y1="19" x2="17" y2="38" /><line x1="31" y1="19" x2="31" y2="38" /><rect x="9" y="29" width="4" height="9" /><rect x="22" y="29" width="4" height="9" /><rect x="35" y="29" width="4" height="9" /></g>)}
      {name === "bungalow" && (<g {...s}><path d="M5 26 L24 14 L43 26" /><path d="M9 24v14h30V24" /><rect x="20" y="30" width="8" height="8" /><rect x="12" y="28" width="5" height="5" /><rect x="31" y="28" width="5" height="5" /></g>)}
      {name === "flat" && (<g {...s}><rect x="12" y="8" width="24" height="32" /><rect x="17" y="13" width="4" height="4" /><rect x="27" y="13" width="4" height="4" /><rect x="17" y="21" width="4" height="4" /><rect x="27" y="21" width="4" height="4" /><rect x="17" y="29" width="4" height="4" /><rect x="27" y="29" width="4" height="4" /><path d="M8 40h32" /></g>)}
      {name === "other" && (<g {...s}><circle cx="24" cy="24" r="15" /><path d="M24 18v6" /><circle cx="24" cy="30" r="1" fill="currentColor" /></g>)}
      {name === "pitched" && (<g {...s}><path d="M6 30 L24 12 L42 30" /><path d="M14 22 L18 22 L18 26" /><path d="M20 30h8" /></g>)}
      {name === "flat-roof" && (<g {...s}><rect x="8" y="18" width="32" height="18" /><path d="M6 18h36" /><path d="M14 18v-4h20v4" /></g>)}
      {name === "unsure" && (<g {...s}><path d="M18 19a6 6 0 1 1 8 5.6c-1.5.7-2 1.7-2 3.4" /><circle cx="24" cy="34" r="1.2" fill="currentColor" /><circle cx="24" cy="24" r="17" /></g>)}
      {(name === "south" || name === "north" || name === "east" || name === "west" || name === "south-east" || name === "south-west") && (
        <g {...s}>
          <circle cx="24" cy="24" r="16" />
          <g transform={`rotate(${{ north: 0, "south-east": 135, south: 180, "south-west": 225, east: 90, west: 270 }[name]} 24 24)`}>
            <path d="M24 11 L29 25 L24 22 L19 25 Z" fill="currentColor" />
          </g>
        </g>
      )}
      {name === "solar" && (<g {...s}><path d="M8 32 L14 16 H40 L34 32 Z" /><path d="M21 16 L18 32 M30 16 L27 32 M11 24h26" /><path d="M24 32v8M18 40h12" /></g>)}
      {name === "battery" && (<g {...s}><rect x="14" y="10" width="20" height="30" rx="3" /><path d="M20 7h8" /><path d="M19 32h10M19 26h10M19 20h10" /></g>)}
      {(name === "ev" || name === "ev-charger") && (<g {...s}><path d="M8 30h26v6H8z" /><path d="M11 30l4-8h14l4 8" /><circle cx="14" cy="38" r="2.5" /><circle cx="28" cy="38" r="2.5" /><path d="M36 20h6v10h-6z" /><path d="M39 20v-6" /><path d="M34 33h2" /></g>)}
      {name === "heat-pump" && (<g {...s}><rect x="8" y="14" width="32" height="20" rx="3" /><circle cx="19" cy="24" r="6" /><path d="M19 18v12M13 24h12" /><path d="M31 20h5M31 24h5M31 28h5" /></g>)}
      {name === "solar-battery" && (<g {...s}><path d="M6 26 L10 14 H28 L24 26 Z" /><path d="M17 14l-2 12M9 20h17" /><rect x="31" y="18" width="11" height="18" rx="2" /><path d="M34 15h5" /><path d="M34 31h5M34 26h5" /></g>)}
      {name === "whole-home" && (<g {...s}><path d="M8 22 L24 9 L40 22" /><path d="M12 20v18h24V20" /><path d="M17 20l1.5-4h11l1.5 4z" /><rect x="29" y="28" width="5" height="8" rx="1" /><path d="M14 36h6l1-3h-4z" /><circle cx="24" cy="31" r="2" /></g>)}
      {name === "homeowner" && (<g {...s}><path d="M8 22 L24 9 L40 22" /><path d="M12 20v18h24V20" /><circle cx="24" cy="26" r="3" /><path d="M18 36c0-3.3 2.7-6 6-6s6 2.7 6 6" /></g>)}
      {name === "landlord" && (<g {...s}><rect x="8" y="12" width="32" height="26" /><path d="M8 20h32M20 20v18M32 20v18" /><circle cx="14" cy="16" r="1.4" fill="currentColor" /></g>)}
      {name === "person" && (<g {...s}><circle cx="24" cy="17" r="6" /><path d="M12 39c0-6.6 5.4-12 12-12s12 5.4 12 12" /></g>)}
      {name === "asap" && (<g {...s}><path d="M26 6 L14 26h10l-2 16 12-20H24z" /></g>)}
      {name === "1-3" && (<g {...s}><rect x="8" y="12" width="32" height="28" rx="3" /><path d="M8 20h32M16 8v8M32 8v8" /><path d="M16 28h4M22 28h4" /></g>)}
      {name === "3-6" && (<g {...s}><rect x="8" y="12" width="32" height="28" rx="3" /><path d="M8 20h32M16 8v8M32 8v8" /><path d="M16 28h4M22 28h4M28 28h4M16 34h4M22 34h4" /></g>)}
      {name === "research" && (<g {...s}><circle cx="21" cy="21" r="11" /><path d="M29 29l10 10" /><path d="M16 21h10M21 16v10" /></g>)}
    </svg>
  );
}
