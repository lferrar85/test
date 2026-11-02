import { z } from "zod";
import { isValidUkPostcode } from "@/lib/utils/postcode";

const postcode = z
  .string()
  .trim()
  .min(5, "Enter your postcode")
  .refine((v) => isValidUkPostcode(v), "Enter a valid UK postcode");

const ukPhone = z
  .string()
  .trim()
  .min(10, "Enter a valid phone number")
  .regex(/^[+0-9 ()-]{10,16}$/, "Enter a valid phone number");

export const enquiryInputSchema = z.object({
  postcode,
  propertyType: z.enum(["detached", "semi-detached", "terraced", "bungalow", "flat", "other"]),
  roof: z.object({
    type: z.enum(["pitched", "flat", "unsure"]),
    orientation: z.enum(["south", "south-east", "south-west", "east", "west", "north", "unsure"]),
  }),
  current: z.object({
    solar: z.boolean(),
    battery: z.boolean(),
    ev: z.boolean(),
    evCharger: z.boolean(),
    heatPump: z.boolean(),
  }),
  interests: z.array(z.enum(["solar", "solar-battery", "battery", "ev-charger", "heat-pump", "whole-home", "unsure"])).min(1, "Choose at least one option"),
  ownership: z.enum(["homeowner", "landlord", "other"]),
  timing: z.enum(["asap", "1-3-months", "3-6-months", "researching"]),
  contact: z.object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().email("Enter a valid email address"),
    phone: ukPhone,
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
  }),
  consent: z.object({
    shareWithInstallers: z.literal(true, { message: "We need your permission to share your details with matched installers" }),
    marketing: z.boolean(),
    privacyVersion: z.string(),
  }),
  website: z.string().max(0).optional(), // honeypot
});

export type EnquiryInput = z.infer<typeof enquiryInputSchema>;

const technology = z.enum(["solar", "battery", "ev-charger", "heat-pump"]);
const accreditationType = z.enum(["MCS", "TRUSTMARK", "RECC", "HIES", "NICEIC", "NAPIT", "ELECSA", "STROMA", "OTHER"]);

export const installerApplicationSchema = z.object({
  business: z.object({
    legalName: z.string().trim().min(2, "Enter the registered business name").max(120),
    tradingName: z.string().trim().min(2, "Enter the trading name").max(120),
    companiesHouseNumber: z.string().trim().regex(/^[A-Z0-9]{8}$/i, "Enter an 8-character Companies House number"),
    addressLine1: z.string().trim().min(2, "Enter the first line of the address"),
    addressLine2: z.string().trim().optional().or(z.literal("")),
    town: z.string().trim().min(2, "Enter the town or city"),
    postcode,
    website: z.string().trim().url("Enter a full website address including https://").optional().or(z.literal("")),
    yearsTrading: z.coerce.number().int().min(0).max(100),
    contactName: z.string().trim().min(2, "Enter the main contact's name"),
    contactRole: z.string().trim().optional().or(z.literal("")),
    phone: ukPhone,
    email: z.string().trim().email("Enter a valid email address"),
  }),
  technologies: z.array(technology).min(1, "Select at least one technology you install"),
  accreditations: z
    .array(
      z.object({
        type: accreditationType,
        name: z.string().trim().optional().or(z.literal("")),
        reference: z.string().trim().optional().or(z.literal("")),
        scope: z.array(technology).min(1, "Select which technologies this covers"),
        expiresAt: z.string().optional().or(z.literal("")),
      }),
    )
    .default([]),
  protection: z.object({
    publicLiabilityInsurer: z.string().trim().min(1, "Enter your public liability insurer"),
    publicLiabilityCover: z.coerce.number().min(0),
    publicLiabilityExpiry: z.string().min(1, "Enter the expiry date"),
    employersLiabilityApplicable: z.boolean(),
    employersLiabilityInsurer: z.string().trim().optional().or(z.literal("")),
    employersLiabilityExpiry: z.string().optional().or(z.literal("")),
    workmanshipYears: z.coerce.number().int().min(0).max(50),
    insuranceBacked: z.boolean(),
    insuranceBackedProvider: z.string().trim().optional().or(z.literal("")),
    productWarrantySummary: z.string().trim().max(600).optional().or(z.literal("")),
  }),
  performance: z.object({
    installationsPerYear: z.coerce.number().int().min(0),
    coverageAreas: z.string().trim().min(1, "List the postcode areas or regions you cover"),
    installationTeams: z.coerce.number().int().min(1),
    panelBrands: z.string().trim().optional().or(z.literal("")),
    batteryBrands: z.string().trim().optional().or(z.literal("")),
    customerService: z.string().trim().max(600).optional().or(z.literal("")),
    aftercare: z.string().trim().max(600).optional().or(z.literal("")),
  }),
  references: z.object({
    testimonials: z.string().trim().max(2000).optional().or(z.literal("")),
    reviewProfiles: z.string().trim().max(1000).optional().or(z.literal("")),
    exampleInstallations: z.string().trim().max(2000).optional().or(z.literal("")),
    references: z.string().trim().max(1000).optional().or(z.literal("")),
  }),
  documents: z
    .array(z.object({ name: z.string(), size: z.number(), type: z.string(), category: z.string() }))
    .default([]),
  declarations: z.object({
    accurate: z.literal(true, { message: "Please confirm the information is accurate" }),
    terms: z.literal(true, { message: "Please accept the installer terms" }),
  }),
  website_hp: z.string().max(0).optional(),
});

export type InstallerApplicationInput = z.infer<typeof installerApplicationSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  topic: z.enum(["homeowner", "installer", "press", "other"]),
  message: z.string().trim().min(10, "Tell us a little more").max(2000),
  website: z.string().max(0).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;
export type InstallerApplicationFormInput = z.input<typeof installerApplicationSchema>;
