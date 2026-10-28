import { describe, expect, it } from "vitest";
import { buildDynamicZodSchema } from "../dynamic-schema-builder";
import { panConfig } from "../../config/pan.config";
import { gstConfig } from "../../config/gst.config";
import { mcaConfig } from "../../config/mca.config";

describe("buildDynamicZodSchema", () => {
  it("accepts valid front-back uploads using front/back file objects", () => {
    const schema = buildDynamicZodSchema(panConfig);

    const result = schema.safeParse({
      fullName: "Asha Kumar",
      dateOfBirth: "1990-01-01",
      mobileNumber: "9876543210",
      email: "asha@example.com",
      aadhaarCard: {
        frontUrl: "/uploads/aadhaar-front.pdf",
        backUrl: "/uploads/aadhaar-back.pdf",
        front: { name: "front.pdf", url: "/uploads/aadhaar-front.pdf", size: 100, type: "pdf" },
        back: { name: "back.pdf", url: "/uploads/aadhaar-back.pdf", size: 100, type: "pdf" },
      },
      passportPhoto: {
        name: "photo.jpg",
        url: "/uploads/photo.jpg",
        size: 100,
        type: "jpg",
      },
      signature: {
        name: "sign.jpg",
        url: "/uploads/sign.jpg",
        size: 40,
        type: "jpg",
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts legacy front-back drafts that only store front/back objects", () => {
    const schema = buildDynamicZodSchema(gstConfig);

    const result = schema.safeParse({
      applicantName: "Asha Kumar",
      panNumber: "ABCDE1234F",
      mobileNumber: "9876543210",
      emailAddress: "asha@example.com",
      tradeName: "Asha Traders",
      constitutionType: "PROPRIETORSHIP",
      registeredAddress: "123 Main Street, Mumbai",
      panDocument: { name: "pan.pdf", url: "/uploads/pan.pdf", size: 100, type: "pdf" },
      aadhaarDocument: {
        front: { name: "front.pdf", url: "/uploads/front.pdf", size: 100, type: "pdf" },
        back: { name: "back.pdf", url: "/uploads/back.pdf", size: 100, type: "pdf" },
      },
      addressProofDocument: {
        name: "bill.pdf",
        url: "/uploads/bill.pdf",
        size: 100,
        type: "pdf",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing front-back uploads for required fields", () => {
    const schema = buildDynamicZodSchema(panConfig);

    const result = schema.safeParse({
      fullName: "Asha Kumar",
      dateOfBirth: "1990-01-01",
      mobileNumber: "9876543210",
      email: "asha@example.com",
      aadhaarCard: { frontUrl: "", backUrl: "", front: null, back: null },
      passportPhoto: {
        name: "photo.jpg",
        url: "/uploads/photo.jpg",
        size: 100,
        type: "jpg",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects required file uploads without a url", () => {
    const schema = buildDynamicZodSchema(panConfig);

    const result = schema.safeParse({
      fullName: "Asha Kumar",
      dateOfBirth: "1990-01-01",
      mobileNumber: "9876543210",
      email: "asha@example.com",
      aadhaarCard: {
        frontUrl: "/uploads/front.pdf",
        backUrl: "/uploads/back.pdf",
        front: { name: "front.pdf", url: "/uploads/front.pdf", size: 100, type: "pdf" },
        back: { name: "back.pdf", url: "/uploads/back.pdf", size: 100, type: "pdf" },
      },
      passportPhoto: { name: "photo.jpg" },
    });

    expect(result.success).toBe(false);
  });

  it("requires conditional fields only when visible", () => {
    const schema = buildDynamicZodSchema(gstConfig);
    const basePayload = {
      applicantName: "Asha Kumar",
      panNumber: "ABCDE1234F",
      mobileNumber: "9876543210",
      emailAddress: "asha@example.com",
      tradeName: "Asha Traders",
      registeredAddress: "123 Main Street, Mumbai",
      panDocument: { name: "pan.pdf", url: "/uploads/pan.pdf", size: 100, type: "pdf" },
      aadhaarDocument: {
        front: { name: "front.pdf", url: "/uploads/front.pdf", size: 100, type: "pdf" },
        back: { name: "back.pdf", url: "/uploads/back.pdf", size: 100, type: "pdf" },
      },
      addressProofDocument: {
        name: "bill.pdf",
        url: "/uploads/bill.pdf",
        size: 100,
        type: "pdf",
      },
    };

    const missingCin = schema.safeParse({
      ...basePayload,
      constitutionType: "PVT_LTD",
    });
    expect(missingCin.success).toBe(false);

    const withCin = schema.safeParse({
      ...basePayload,
      constitutionType: "PVT_LTD",
      cinOrLlpin: "U12345MH2020PTC123456",
    });
    expect(withCin.success).toBe(true);
  });

  it("rejects invalid PAN via validation preset", () => {
    const schema = buildDynamicZodSchema(gstConfig);
    const base = {
      applicantName: "Asha Kumar",
      panNumber: "INVALID",
      mobileNumber: "9876543210",
      emailAddress: "asha@example.com",
      tradeName: "Asha Traders",
      constitutionType: "PROPRIETORSHIP",
      registeredAddress: "123 Main Street, Mumbai",
      panDocument: { name: "pan.pdf", url: "/uploads/pan.pdf", size: 100, type: "pdf" },
      aadhaarDocument: {
        front: { name: "front.pdf", url: "/uploads/front.pdf", size: 100, type: "pdf" },
        back: { name: "back.pdf", url: "/uploads/back.pdf", size: 100, type: "pdf" },
      },
      addressProofDocument: {
        name: "bill.pdf",
        url: "/uploads/bill.pdf",
        size: 100,
        type: "pdf",
      },
    };

    expect(schema.safeParse(base).success).toBe(false);
    expect(
      schema.safeParse({ ...base, panNumber: "ABCDE1234F" }).success,
    ).toBe(true);
  });

  it("rejects invalid mobile via validation preset", () => {
    const schema = buildDynamicZodSchema(gstConfig);
    const base = {
      applicantName: "Asha Kumar",
      panNumber: "ABCDE1234F",
      mobileNumber: "12345",
      emailAddress: "asha@example.com",
      tradeName: "Asha Traders",
      constitutionType: "PROPRIETORSHIP",
      registeredAddress: "123 Main Street, Mumbai",
      panDocument: { name: "pan.pdf", url: "/uploads/pan.pdf", size: 100, type: "pdf" },
      aadhaarDocument: {
        front: { name: "front.pdf", url: "/uploads/front.pdf", size: 100, type: "pdf" },
        back: { name: "back.pdf", url: "/uploads/back.pdf", size: 100, type: "pdf" },
      },
      addressProofDocument: {
        name: "bill.pdf",
        url: "/uploads/bill.pdf",
        size: 100,
        type: "pdf",
      },
    };

    expect(schema.safeParse(base).success).toBe(false);
    expect(
      schema.safeParse({ ...base, mobileNumber: "+91 9876543210" }).success,
    ).toBe(true);
  });

  it("rejects invalid select values not in allowed options", () => {
    const schema = buildDynamicZodSchema(gstConfig);
    const base = {
      applicantName: "Asha Kumar",
      panNumber: "ABCDE1234F",
      mobileNumber: "9876543210",
      emailAddress: "asha@example.com",
      tradeName: "Asha Traders",
      constitutionType: "NOT_A_REAL_TYPE",
      registeredAddress: "123 Main Street, Mumbai",
      panDocument: { name: "pan.pdf", url: "/uploads/pan.pdf", size: 100, type: "pdf" },
      aadhaarDocument: {
        front: { name: "front.pdf", url: "/uploads/front.pdf", size: 100, type: "pdf" },
        back: { name: "back.pdf", url: "/uploads/back.pdf", size: 100, type: "pdf" },
      },
      addressProofDocument: {
        name: "bill.pdf",
        url: "/uploads/bill.pdf",
        size: 100,
        type: "pdf",
      },
    };

    expect(schema.safeParse(base).success).toBe(false);
  });

  it("produces user-friendly required error messages instead of raw Zod type errors for mcaConfig", () => {
    const schema = buildDynamicZodSchema(mcaConfig);
    const result = schema.safeParse({});
    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);

      // Verify no technical Zod type errors leak out
      for (const msg of messages) {
        expect(msg).not.toContain("expected string, received undefined");
        expect(msg).not.toContain("expected object, received undefined");
        expect(msg).not.toContain("Invalid input: expected");
      }

      // Verify human readable labels are present
      expect(messages).toContain("Proposed Name Option 1 is required");
      expect(messages).toContain("Please select Entity Structure");
      expect(messages).toContain("Primary Director / Partner Name is required");
      expect(messages).toContain("Director Contact Phone is required");
      expect(messages).toContain("Director Email Address is required");
      expect(messages).toContain("Proposed Authorized Capital (₹) is required");
      expect(messages).toContain("Registered Office Address is required");
      expect(messages).toContain("Director PAN Card Copy file is required");
      expect(messages).toContain("Director Aadhaar / Passport Copy is required");
      expect(messages).toContain("Office Utility Bill / NOC from Owner file is required");
    }
  });
});
