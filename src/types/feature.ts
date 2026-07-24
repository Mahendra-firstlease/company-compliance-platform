import { ComponentType, SVGProps } from "react";

export type Feature = {
  title: string;
  description: string;
  action: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export type Faq = {
  question: string;
  answer: string;
};

export type Testimonial = {
  name: string;
  description: string;
  image: string;
  handle: string;
};
