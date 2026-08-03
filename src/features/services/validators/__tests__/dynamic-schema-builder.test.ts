import { describe, expect, it } from "vitest";
import { buildDynamicZodSchema } from "../dynamic-schema-builder";
import { panConfig } from "../../config/pan.config";
import { gstConfig } from "../../config/gst.config";

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
});
