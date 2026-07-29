import { ServiceFormConfig } from "@/types/form-config.types";
import { gstConfig } from "../config/gst.config";
import { panConfig } from "../config/pan.config";
import { trademarkConfig } from "../config/trademark.config";

/**
 * Service Configuration Registry
 * Adding a new 100th service requires ONLY registering its config here!
 */
export const serviceRegistry: Record<string, ServiceFormConfig> = {
  "gst-registration": gstConfig,
  "pan-card-registration": panConfig,
  "trademark-registration": trademarkConfig,
};

export function getServiceConfig(slug: string): ServiceFormConfig {
  return serviceRegistry[slug] || gstConfig; // Default fallback to GST config
}
