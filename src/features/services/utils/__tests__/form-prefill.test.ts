import { describe, expect, it } from "vitest";
import {
  mapBusinessProfileToFormDefaults,
  mergeFormInitialValues,
} from "../form-prefill";

describe("form-prefill", () => {
  it("maps business profile fields to form defaults", () => {
    const defaults = mapBusinessProfileToFormDefaults(
      { name: "Asha Kumar", email: "asha@example.com", phone: "9876543210" },
      {
        businessName: "Asha Traders",
        businessType: "Private Limited Company",
        industry: "Retail & E-commerce",
        state: "Maharashtra",
        employeeCount: "1-9 employees",
        annualTurnover: "10L - 40L",
      },
    );

    expect(defaults.applicantName).toBe("Asha Kumar");
    expect(defaults.tradeName).toBe("Asha Traders");
    expect(defaults.constitutionType).toBe("PVT_LTD");
    expect(defaults.registeredAddress).toBe("Maharashtra, India");
  });

  it("merges profile defaults without overwriting saved application values", () => {
    const merged = mergeFormInitialValues(
      { applicantName: "Saved Name", tradeName: "Saved Co" },
      { applicantName: "Profile Name", tradeName: "Profile Co", mobileNumber: "9999999999" },
    );

    expect(merged.applicantName).toBe("Saved Name");
    expect(merged.tradeName).toBe("Saved Co");
    expect(merged.mobileNumber).toBe("9999999999");
  });
});

