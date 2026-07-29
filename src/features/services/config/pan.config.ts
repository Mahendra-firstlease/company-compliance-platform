import { ServiceFormConfig } from "@/types/form-config.types";

export const panConfig: ServiceFormConfig = {
  serviceSlug: "pan-card-registration",
  title: "PAN Card Registration Application",
  category: "Taxation & Licensing",
  sections: [
    {
      id: "applicant_info",
      title: "1. Applicant Information",
      fields: [
        {
          id: "fullName",
          type: "text",
          label: "Full Name",
          placeholder: "First Name Middle Name Last Name",
          required: true,
          minLength: 2,
        },
        {
          id: "dateOfBirth",
          type: "date",
          label: "Date of Birth / Incorporation",
          required: true,
        },
        {
          id: "mobileNumber",
          type: "phone",
          label: "Mobile Number",
          required: true,
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          required: true,
        },
      ],
    },
    {
      id: "pan_documents",
      title: "2. Identity Verification Documents",
      fields: [
        {
          id: "aadhaarCard",
          type: "front-back-file",
          label: "Aadhaar Card Scans (Front & Back)",
          required: true,
          frontRule: {
            allowedExtensions: ["jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
            maxSizeBytes: 1 * 1024 * 1024,
          },
          backRule: {
            allowedExtensions: ["jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
            maxSizeBytes: 1 * 1024 * 1024,
          },
        },
        {
          id: "passportPhoto",
          type: "file",
          label: "Applicant Passport Photograph",
          required: true,
          uploadRule: {
            allowedExtensions: ["jpg", "png"],
            allowedMimeTypes: ["image/jpeg", "image/png"],
            maxSizeBytes: 1 * 1024 * 1024,
          },
        },
      ],
    },
  ],
};
