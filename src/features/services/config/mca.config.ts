import { ServiceFormConfig } from "@/types/form-config.types";

export const mcaConfig: ServiceFormConfig = {
  serviceSlug: "mca-company-llp-registration",
  title: "MCA Private Limited / LLP Incorporation Application",
  category: "Business Registration",
  sections: [
    {
      id: "company_identity",
      title: "1. Proposed Company & Director Details",
      description: "Enter proposed company name preferences and Director details",
      fields: [
        {
          id: "companyNameOption1",
          type: "text",
          label: "Proposed Name Option 1",
          placeholder: "e.g. FirstLease Compliance Technologies Pvt Ltd",
          required: true,
        },
        {
          id: "companyNameOption2",
          type: "text",
          label: "Proposed Name Option 2",
          placeholder: "e.g. FirstLease Solutions Pvt Ltd",
          required: false,
        },
        {
          id: "entityType",
          type: "select",
          label: "Entity Structure",
          required: true,
          optionsSource: {
            type: "static",
            options: [
              { label: "Private Limited Company", value: "PVT_LTD" },
              { label: "Limited Liability Partnership (LLP)", value: "LLP" },
              { label: "One Person Company (OPC)", value: "OPC" },
            ],
          },
        },
        {
          id: "applicantName",
          type: "text",
          label: "Primary Director / Partner Name",
          placeholder: "Full name as per PAN Card",
          required: true,
        },
        {
          id: "mobileNumber",
          type: "phone",
          label: "Director Contact Phone",
          placeholder: "+91 9876543210",
          required: true,
        },
        {
          id: "emailAddress",
          type: "email",
          label: "Director Email Address",
          placeholder: "director@company.com",
          required: true,
        },
      ],
    },
    {
      id: "registered_office",
      title: "2. Registered Office & Capital Structure",
      description: "Specify proposed registered address and authorized capital",
      fields: [
        {
          id: "authorizedCapital",
          type: "text",
          label: "Proposed Authorized Capital (₹)",
          placeholder: "e.g. 100000",
          required: true,
        },
        {
          id: "registeredAddress",
          type: "textarea",
          label: "Registered Office Address",
          placeholder: "Door No, Building, Street, City, State, Pincode",
          required: true,
        },
      ],
    },
    {
      id: "documents_upload",
      title: "3. Mandatory Incorporation Attachments",
      description: "Upload clean copies of identity, address, and premises proofs",
      fields: [
        {
          id: "panDocument",
          type: "file",
          label: "Director PAN Card Copy",
          required: true,
          uploadRule: {
            allowedExtensions: ["jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
            maxSizeBytes: 3 * 1024 * 1024,
          },
        },
        {
          id: "aadhaarDocument",
          type: "front-back-file",
          label: "Director Aadhaar / Passport Copy",
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
          id: "premisesProof",
          type: "file",
          label: "Office Utility Bill / NOC from Owner",
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
