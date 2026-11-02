import type { JourneyIconName } from "@/components/journey/JourneyIcon";
import type { Interest, Ownership, PropertyType, RoofOrientation, RoofType, Timing } from "@/lib/domain/types";

export type Option<T extends string> = { value: T; label: string; hint?: string; icon: JourneyIconName };

export const propertyOptions: Option<PropertyType>[] = [
  { value: "detached", label: "Detached house", icon: "detached" },
  { value: "semi-detached", label: "Semi-detached house", icon: "semi-detached" },
  { value: "terraced", label: "Terraced house", icon: "terraced" },
  { value: "bungalow", label: "Bungalow", icon: "bungalow" },
  { value: "flat", label: "Flat", hint: "Usually needs freeholder consent", icon: "flat" },
  { value: "other", label: "Something else", icon: "other" },
];

export const roofTypeOptions: Option<RoofType>[] = [
  { value: "pitched", label: "Pitched", hint: "Sloped, the most common type", icon: "pitched" },
  { value: "flat", label: "Flat", hint: "Panels sit on tilted frames", icon: "flat-roof" },
  { value: "unsure", label: "Not sure", hint: "The installer will check", icon: "unsure" },
];

export const orientationOptions: Option<RoofOrientation>[] = [
  { value: "south", label: "South", hint: "Ideal", icon: "south" },
  { value: "south-east", label: "South-east", icon: "south-east" },
  { value: "south-west", label: "South-west", icon: "south-west" },
  { value: "east", label: "East", icon: "east" },
  { value: "west", label: "West", icon: "west" },
  { value: "north", label: "North", hint: "Less output", icon: "north" },
  { value: "unsure", label: "Not sure", icon: "unsure" },
];

export const currentOptions: { key: "solar" | "battery" | "ev" | "evCharger" | "heatPump"; label: string; icon: JourneyIconName }[] = [
  { key: "solar", label: "Solar panels", icon: "solar" },
  { key: "battery", label: "A home battery", icon: "battery" },
  { key: "ev", label: "An electric vehicle", icon: "ev" },
  { key: "evCharger", label: "An EV charger", icon: "ev-charger" },
  { key: "heatPump", label: "A heat pump", icon: "heat-pump" },
];

export const interestOptions: Option<Interest>[] = [
  { value: "solar", label: "Solar panels", icon: "solar" },
  { value: "solar-battery", label: "Solar and battery", hint: "Most popular", icon: "solar-battery" },
  { value: "battery", label: "Battery only", icon: "battery" },
  { value: "ev-charger", label: "EV charger", icon: "ev-charger" },
  { value: "heat-pump", label: "Heat pump", icon: "heat-pump" },
  { value: "whole-home", label: "Complete home energy system", icon: "whole-home" },
  { value: "unsure", label: "Not sure yet", hint: "Installers can advise", icon: "unsure" },
];

export const ownershipOptions: Option<Ownership>[] = [
  { value: "homeowner", label: "I own my home", icon: "homeowner" },
  { value: "landlord", label: "I'm a landlord", icon: "landlord" },
  { value: "other", label: "Something else", hint: "e.g. renting, buying soon", icon: "person" },
];

export const timingOptions: Option<Timing>[] = [
  { value: "asap", label: "As soon as possible", icon: "asap" },
  { value: "1-3-months", label: "Within 1–3 months", icon: "1-3" },
  { value: "3-6-months", label: "Within 3–6 months", icon: "3-6" },
  { value: "researching", label: "Just researching", hint: "That's fine too", icon: "research" },
];

export const PRIVACY_VERSION = "2026-11";
