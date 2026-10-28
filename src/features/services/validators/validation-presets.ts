/** Named validation presets — use via `validation: { preset: "pan" }` on any text field. */
export const VALIDATION_PRESETS = {
  pan: {
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    message: "Enter a valid 10-character PAN (e.g. ABCDE1234F)",
  },
  gstin: {
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    message: "Enter a valid 15-character GSTIN",
  },
  cin: {
    pattern: /^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/,
    message: "Enter a valid CIN (e.g. U12345MH2020PTC123456)",
  },
  llpin: {
    pattern: /^[A-Z]{3}-\d{4}$/,
    message: "Enter a valid LLPIN (e.g. AAA-1234)",
  },
  aadhaar: {
    pattern: /^\d{12}$/,
    message: "Aadhaar must be exactly 12 digits",
  },
  "mobile-in": {
    pattern: /^(\+91[\s-]?)?[6-9]\d{9}$/,
    message: "Enter a valid 10-digit Indian mobile number",
  },
  "pincode-in": {
    pattern: /^[1-9]\d{5}$/,
    message: "Enter a valid 6-digit PIN code",
  },
  ifsc: {
    pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    message: "Enter a valid IFSC code (e.g. HDFC0001234)",
  },
} as const;

export type ValidationPreset = keyof typeof VALIDATION_PRESETS;

