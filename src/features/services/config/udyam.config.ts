import { ServiceFormConfig } from "@/types/form-config.types";

export const udyamConfig: ServiceFormConfig = {
  serviceSlug: "msme-udyam-registration",
  title: "MSME Udyam Registration Application",
  category: "Government Schemes",
  sections: [
    {
      id: "udyam_info",
      title: "1. Enterprise & Proprietor Identity",
      description: "Enter Aadhaar, PAN, and Enterprise classification details",
      fields: [
        {
          id: "applicantName",
          type: "text",
          label: "Proprietor / Managing Director Name",
          placeholder: "As printed on Aadhaar Card",
          required: true,
        },
        {
          id: "aadhaarNumber",
          type: "text",
          label: "12-Digit Aadhaar Number",
          placeholder: "123456789012",
          required: true,
          pattern: "^[0-9]{12}$",
        },
        {
          id: "panNumber",
          type: "text",
          label: "PAN Number",
          placeholder: "ABCDE1234F",
          required: true,
          pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
        },
        {
          id: "enterpriseName",
          type: "text",
          label: "Name of Enterprise",
          placeholder: "e.g. Unique Engineering Works",
          required: true,
        },
        {
          id: "organizationType",
          type: "select",
          label: "Type of Organization",
          required: true,
          optionsSource: {
            type: "static",
            options: [
              { label: "Proprietorship", value: "PROPRIETORSHIP" },
              { label: "Partnership", value: "PARTNERSHIP" },
              { label: "Private Limited", value: "PVT_LTD" },
              { label: "LLP", value: "LLP" },
            ],
          },
        },
        {
          id: "mobileNumber",
          type: "phone",
          label: "Aadhaar-Linked Mobile Number",
          placeholder: "+91 9876543210",
          required: true,
        },
        {
          id: "bankAccountNo",
          type: "text",
          label: "Bank Account Number",
          placeholder: "e.g. 9180200192847",
          required: true,
        },
        {
          id: "ifscCode",
          type: "text",
          label: "Bank IFSC Code",
          placeholder: "SBIN0001234",
          required: true,
        },
        {
          id: "registeredAddress",
          type: "textarea",
          label: "Plant / Unit Address",
          placeholder: "Address of business operations",
          required: true,
        },
      ],
    },
    {
      id: "documents_upload",
      title: "2. MSME Attachments",
      description: "Upload Aadhaar, PAN, and Bank Cheque Copy",
      fields: [
        {
          id: "aadhaarDocument",
          type: "front-back-file",
          label: "Aadhaar Card Scans",
          required: true,
          frontRule: {
            allowedExtensions: ["jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
            maxSizeBytes: 2 * 1024 * 1024,
          },
          backRule: {
            allowedExtensions: ["jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
            maxSizeBytes: 2 * 1024 * 1024,
          },
        },
        {
          id: "chequeDocument",
          type: "file",
          label: "Cancelled Bank Cheque / Passbook First Page",
          required: true,
          uploadRule: {
            allowedExtensions: ["jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
            maxSizeBytes: 3 * 1024 * 1024,
          },
        },
        {
          id: "panDocument",
          type: "file",
          label: "PAN Card Copy",
          required: true,
          uploadRule: {
            allowedExtensions: ["jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
            maxSizeBytes: 3 * 1024 * 1024,
          },
        },
      ],
    },
  ],
};
