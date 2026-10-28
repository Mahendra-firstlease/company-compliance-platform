import { BusinessProfileFormValues } from "@/schemas/profile.schema";

const CONSTITUTION_MAP: Record<string, string> = {
  "Sole Proprietorship": "PROPRIETORSHIP",
  "Partnership Firm": "PARTNERSHIP",
  "Private Limited Company": "PVT_LTD",
  LLP: "LLP",
  "One Person Company (OPC)": "PVT_LTD",
  "Public Limited Company": "PVT_LTD",
};

type ProfileUser = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

/** Map saved business profile + user account into common form field ids. */
export function mapBusinessProfileToFormDefaults(
  user: ProfileUser,
  businessProfile: BusinessProfileFormValues | null | undefined,
): Record<string, string> {
  const defaults: Record<string, string> = {};

  if (user.name) {
    defaults.applicantName = user.name;
    defaults.fullName = user.name;
  }
  if (user.phone) defaults.mobileNumber = user.phone;
  if (user.email) defaults.emailAddress = user.email;

  if (!businessProfile) return defaults;

  if (businessProfile.businessName) {
    defaults.tradeName = businessProfile.businessName;
    if (!defaults.applicantName) defaults.applicantName = businessProfile.businessName;
  }
  if (businessProfile.businessType && CONSTITUTION_MAP[businessProfile.businessType]) {
    defaults.constitutionType = CONSTITUTION_MAP[businessProfile.businessType];
  }
  if (businessProfile.state) {
    defaults.registeredAddress = `${businessProfile.state}, India`;
  }

  return defaults;
}

/** Profile defaults fill only empty keys on the application record. */
export function mergeFormInitialValues(
  applicationValues: Record<string, unknown>,
  profileDefaults: Record<string, string>,
): Record<string, unknown> {
  const merged = { ...profileDefaults, ...applicationValues };

  for (const [key, value] of Object.entries(profileDefaults)) {
    const existing = applicationValues[key];
    if (existing === undefined || existing === null || existing === "") {
      merged[key] = value;
    }
  }

  return merged;
}

