import { ServiceFormConfig } from "@/types/form-config.types";
import { gstConfig } from "../config/gst.config";
import { panConfig } from "../config/pan.config";
import { trademarkConfig } from "../config/trademark.config";
import { mcaConfig } from "../config/mca.config";
import { fssaiConfig } from "../config/fssai.config";
import { udyamConfig } from "../config/udyam.config";

/**
 * Enterprise Service Configuration Registry
 * Maps each service slug to its unique statutory form configuration.
 */
export const serviceRegistry: Record<string, ServiceFormConfig> = {
  "gst-registration": gstConfig,
  "pan-card-services": panConfig,
  "pan-card-registration": panConfig,
  "trademark-registration": trademarkConfig,
  "mca-company-llp-registration": mcaConfig,
  "fssai-food-license": fssaiConfig,
  "msme-udyam-registration": udyamConfig,
};

/**
 * Dynamically resolves or generates tailored form configurations for any statutory service
 */
export function getServiceConfig(slug: string): ServiceFormConfig {
  if (serviceRegistry[slug]) {
    return serviceRegistry[slug];
  }

  // Format title from slug
  const titleFormatted = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Generic fallback configuration for remaining statutory services
  return {
    serviceSlug: slug,
    title: `${titleFormatted} Application`,
    category: "Statutory Compliance",
    sections: [
      {
        id: "applicant_details",
        title: "1. Applicant & Business Identity Details",
        description: "Enter official credentials for statutory processing",
        fields: [
          {
            id: "applicantName",
            type: "text",
            label: "Full Legal Applicant Name",
            placeholder: "As printed on official PAN / Aadhaar ID",
            required: true,
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
            label: "Official Email Address",
            placeholder: "contact@company.com",
            required: true,
          },
          {
            id: "registeredAddress",
            type: "textarea",
            label: "Registered Business Premises Address",
            placeholder: "Door No, Street, City, State, Pincode",
            required: true,
          },
        ],
      },
      {
        id: "documents_upload",
        title: "2. Verification Documents",
        description: "Upload clean copies of statutory legal proofs",
        fields: [
          {
            id: "identityDocument",
            type: "file",
            label: "Identity Proof (PAN / Aadhaar / Passport)",
            required: true,
            uploadRule: {
              allowedExtensions: ["jpg", "png", "pdf"],
              allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
              maxSizeBytes: 3 * 1024 * 1024,
            },
          },
          {
            id: "addressProofDocument",
            type: "file",
            label: "Address Proof (Utility Bill / Lease Agreement)",
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
}
