import { ServiceFormConfig } from "@/types/form-config.types";

export const gstConfig: ServiceFormConfig = {
  serviceSlug: "gst-registration",
  title: "GST Registration Application",
  category: "Taxation & Licensing",
  sections: [
    {
      id: "applicant_details",
      title: "1. Authorized Signatory Identity Details",
      description: "Enter official credentials of proprietor or authorized partner",
      fields: [
        {
          id: "applicantName",
          type: "text",
          label: "Full Legal Name",
          placeholder: "As printed on PAN Card",
          required: true,
          minLength: 2,
          maxLength: 100,
        },
        {
          id: "panNumber",
          type: "text",
          label: "Permanent Account Number (PAN)",
          placeholder: "ABCDE1234F",
          required: true,
          pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
        },
        {
          id: "mobileNumber",
          type: "phone",
          label: "Mobile Number",
          placeholder: "+91 9876543210",
          required: true,
        },
        {
          id: "emailAddress",
          type: "email",
          label: "Official Email Address",
          placeholder: "contact@company.com",
          required: true,
        },
      ],
    },
    {
      id: "business_details",
      title: "2. Business Entity Information",
      description: "Specify business trade name and Constitution type",
      fields: [
        {
          id: "tradeName",
          type: "text",
          label: "Trade / Business Name",
          placeholder: "e.g. Zenith Tech Solutions",
          required: true,
        },
        {
          id: "constitutionType",
          type: "select",
          label: "Constitution of Business",
          required: true,
          optionsSource: {
            type: "static",
            options: [
              { label: "Proprietorship", value: "PROPRIETORSHIP" },
              { label: "Partnership Firm", value: "PARTNERSHIP" },
              { label: "Private Limited Company", value: "PVT_LTD" },
              { label: "Limited Liability Partnership (LLP)", value: "LLP" },
            ],
          },
        },
        {
          id: "registeredAddress",
          type: "textarea",
          label: "Registered Business Premises Address",
          placeholder: "Door/Plot No, Building Name, Street, City, State, Pincode",
          required: true,
          maxLength: 500,
        },
      ],
    },
    {
      id: "documents_upload",
      title: "3. Mandatory Verification Attachments",
      description: "Upload clean copies of statutory legal proofs",
      fields: [
        {
          id: "panDocument",
          type: "file",
          label: "PAN Card Copy",
          required: true,
          uploadRule: {
            allowedExtensions: ["jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
            maxSizeBytes: 2 * 1024 * 1024,
          },
        },
        {
          id: "aadhaarDocument",
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
          id: "addressProofDocument",
          type: "file",
          label: "Premises Address Proof (Utility Bill / Lease Agreement)",
          required: true,
          uploadRule: {
            allowedExtensions: ["jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
            maxSizeBytes: 5 * 1024 * 1024,
          },
        },
      ],
    },
  ],
};
