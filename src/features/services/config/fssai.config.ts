import { ServiceFormConfig } from "@/types/form-config.types";

export const fssaiConfig: ServiceFormConfig = {
  serviceSlug: "fssai-food-license",
  title: "FSSAI Food License / Registration Application",
  category: "Food Safety & Licensing",
  sections: [
    {
      id: "business_info",
      title: "1. Food Business Operator (FBO) Details",
      description: "Enter food business category, turnover, and applicant details",
      fields: [
        {
          id: "applicantName",
          type: "text",
          label: "Food Business Operator / Proprietor Name",
          placeholder: "Name as per ID proof",
          required: true,
        },
        {
          id: "foodBusinessName",
          type: "text",
          label: "Food Business Trade Name / Restaurant Name",
          placeholder: "e.g. Royal Kitchens & Cafe",
          required: true,
        },
        {
          id: "licenseCategory",
          type: "select",
          label: "License Category Requested",
          required: true,
          optionsSource: {
            type: "static",
            options: [
              { label: "Basic Registration (Turnover up to ₹12 Lakhs)", value: "BASIC" },
              { label: "State License (Turnover ₹12 Lakhs to ₹20 Crores)", value: "STATE" },
              { label: "Central License (Turnover above ₹20 Crores / Import Export)", value: "CENTRAL" },
            ],
          },
        },
        {
          id: "mobileNumber",
          type: "phone",
          label: "Contact Mobile Number",
          placeholder: "+91 9876543210",
          required: true,
        },
        {
          id: "emailAddress",
          type: "email",
          label: "Email Address",
          placeholder: "contact@restaurant.com",
          required: true,
        },
        {
          id: "registeredAddress",
          type: "textarea",
          label: "Food Premises Address",
          placeholder: "Full address where food is prepared/stored/sold",
          required: true,
        },
      ],
    },
    {
      id: "documents_upload",
      title: "2. FSSAI Verification Documents",
      description: "Upload photo, identity proof, and premises proof",
      fields: [
        {
          id: "passportPhoto",
          type: "file",
          label: "Applicant Passport Size Photograph",
          required: true,
          uploadRule: {
            allowedExtensions: ["jpg", "jpeg", "png"],
            allowedMimeTypes: ["image/jpeg", "image/png"],
            maxSizeBytes: 2 * 1024 * 1024,
          },
        },
        {
          id: "identityProof",
          type: "file",
          label: "Identity Proof (Aadhaar / Voter ID / Passport)",
          required: true,
          uploadRule: {
            allowedExtensions: ["jpg", "png", "pdf"],
            allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
            maxSizeBytes: 3 * 1024 * 1024,
          },
        },
        {
          id: "premisesProof",
          type: "file",
          label: "Premises Rent Agreement / Electricity Bill / NOC",
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
