import type { Interest, Ownership, PropertyType, RoofOrientation, RoofType, Timing } from "@/lib/domain/types";

export interface JourneyState {
  step: number;
  postcode: string;
  propertyType?: PropertyType;
  roofType?: RoofType;
  roofOrientation?: RoofOrientation;
  current: { solar: boolean; battery: boolean; ev: boolean; evCharger: boolean; heatPump: boolean };
  interests: Interest[];
  ownership?: Ownership;
  timing?: Timing;
  contact: { name: string; email: string; phone: string; notes: string };
  consent: { shareWithInstallers: boolean; marketing: boolean };
}

export const STEP_COUNT = 8; // questions before matching

export const initialJourney: JourneyState = {
  step: 1,
  postcode: "",
  current: { solar: false, battery: false, ev: false, evCharger: false, heatPump: false },
  interests: [],
  contact: { name: "", email: "", phone: "", notes: "" },
  consent: { shareWithInstallers: false, marketing: false },
};

export const STORAGE_KEY = "gsc.journey.v1";

export function loadJourney(): JourneyState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as JourneyState;
    // Never restore contact details or consent from storage.
    return { ...initialJourney, ...parsed, contact: initialJourney.contact, consent: initialJourney.consent };
  } catch {
    return null;
  }
}

export function saveJourney(s: JourneyState) {
  if (typeof window === "undefined") return;
  try {
    const { contact, consent, ...rest } = s;
    void contact; void consent;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    /* ignore */
  }
}

export function clearJourney() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
