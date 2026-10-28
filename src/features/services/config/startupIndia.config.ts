import { ServiceFormConfig } from "@/types/form-config.types";

export const startupIndia: ServiceFormConfig = {
  serviceSlug: "startup-india-registration",
  title: "Startup India Registration Application",
  category: "Business & Entrepreneurship",
  sections: [
    {
      id: "applicant_info",
      title: "1. Applicant Information",
      description:
        "Details must match your Aadhaar and supporting identity documents exactly.",
      fields: [
        {
          id: "fullName",
          type: "text",
          label: "Full Name",
          placeholder: "First Name Middle Name Last Name",
          description:
            "As printed on Aadhaar — only letters, spaces, and dots allowed.",
          required: true,
          validation: {
            minLength: 2,
            maxLength: 85,
            pattern: "^[A-Za-z][A-Za-z .]{1,84}$",
            patternMessage:
              "Name must start with a letter and contain only letters, spaces, or dots",
            requiredMessage: "Full legal name is required",
          },
        },
      ],
    },
    {
      id: "trade_doc",
      title: "2. Identity Verification Documents",
      description: "Upload clear, colour scans. Blurred or cropped documents will be rejected.",
      fields: [
        {
          id: "aadhaarCard",
          type: "front-back-file",
          label: "Aadhaar Card Scans (Front & Back)",
          description: "JPEG, PNG, or PDF — max 1 MB per side. All 12 digits must be readable.",
          required: true,
          validation: {
            requiredMessage: "Aadhaar front and back scans are required",
          },
          frontRule: {
            allowedExtensions: ["jpeg", "jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
            maxSizeBytes: 1 * 1024 * 1024,
          },
          backRule: {
            allowedExtensions: ["jpeg", "jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
            maxSizeBytes: 1 * 1024 * 1024,
          },
        },
        {
          id: "passportPhoto",
          type: "file",
          label: "Applicant Passport Photograph",
          description: "White background, face clearly visible — JPG or PNG, max 1 MB.",
          required: true,
          validation: {
            requiredMessage: "Passport-size photograph is required",
          },
          uploadRule: {
            allowedExtensions: ["jpg", "png"],
            allowedMimeTypes: ["image/jpeg", "image/png"],
            maxSizeBytes: 1 * 1024 * 1024,
          },
        },
        {
          id: "signature",
          type: "file",
          label: "Applicant Signature",
          description: "Sign on white paper, scan or photograph — JPG only, max 50 KB.",
          required: true,
          validation: {
            requiredMessage: "Signature scan is required",
          },
          uploadRule: {
            allowedExtensions: ["jpg", "jpeg"],
            allowedMimeTypes: ["image/jpeg"],
            maxSizeBytes: 50 * 1024,
          },
        },
      ],
    },
  ],
};

