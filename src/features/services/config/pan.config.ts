import { ServiceFormConfig } from "@/types/form-config.types";

export const panConfig: ServiceFormConfig = {
  serviceSlug: "pan-card-registration",
  title: "PAN Card Registration Application",
  category: "Taxation & Licensing",
  sections: [
    {
      id: "applicant_info",
      title: "1. Applicant Information",
      description: "Details must match your Aadhaar and supporting identity documents exactly.",
      fields: [
        {
          id: "fullName",
          type: "text",
          label: "Full Name",
          placeholder: "First Name Middle Name Last Name",
          description: "As printed on Aadhaar — only letters, spaces, and dots allowed.",
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
        {
          id: "dateOfBirth",
          type: "date",
          label: "Date of Birth / Incorporation",
          description: "For individuals: you must be at least 18 years old. For entities: date of incorporation.",
          required: true,
          validation: {
            minDate: "1900-01-01",
            maxDate: new Date(
              new Date().setFullYear(new Date().getFullYear() - 18),
            )
              .toISOString()
              .split("T")[0],
            requiredMessage: "Date of birth or incorporation is required",
          },
        },
        {
          id: "mobileNumber",
          type: "phone",
          label: "Mobile Number",
          placeholder: "+91 9876543210",
          description: "Active Indian mobile number linked to Aadhaar for OTP verification.",
          required: true,
          validation: {
            preset: "mobile-in",
            requiredMessage: "Mobile number is required",
          },
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          placeholder: "name@example.com",
          description: "Official email for application status and e-PAN delivery.",
          required: true,
          validation: {
            requiredMessage: "Email address is required",
          },
        },
      ],
    },
    {
      id: "pan_documents",
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
