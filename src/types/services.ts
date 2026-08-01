export interface FAQItem {
  question: string;
  answer: string;
}

export interface ServiceDetails {
  benefits?: string[];
  eligibility?: string[];
  requiredDocuments?: string[];
  faqs?: FAQItem[];
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description?: string;
  image: string;
  price: number;
  originalPrice?: number;
  governmentFee?: number;
  professionalFee?: number;
  duration: string;
  featured?: boolean;
  popular?: boolean;
  benefits?: string[];
  eligibility?: string[];
  requiredDocuments?: string[];
  faqs?: FAQItem[];
  details?: ServiceDetails;
}