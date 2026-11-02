/** Lenient UK postcode validation (format only, not an address lookup). */
const UK_POSTCODE = /^([A-Z]{1,2}\d[A-Z\d]?|GIR) ?\d[A-Z]{2}$/i;

export function normalisePostcode(input: string) {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (raw.length < 5) return raw;
  return `${raw.slice(0, -3)} ${raw.slice(-3)}`;
}

export function isValidUkPostcode(input: string) {
  return UK_POSTCODE.test(input.trim());
}

/** Outward code (e.g. "SW1A") used for coarse coverage matching. */
export function outwardCode(postcode: string) {
  return normalisePostcode(postcode).split(" ")[0] ?? "";
}

/** Postcode area letters (e.g. "SW") used for coarse coverage matching. */
export function postcodeArea(postcode: string) {
  return outwardCode(postcode).replace(/\d.*$/, "");
}
