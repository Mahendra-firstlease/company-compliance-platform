import { FilterGroup } from "@/types";

export const filters: FilterGroup[] = [
  {
    id: "price",
    title: "Filing & Government Fees",

    options: [
      {
        label: "Under ₹999",
        value: "999",
      },
      {
        label: "₹1000 - ₹5000",
        value: "1000-5000",
      },
      {
        label: "Above ₹5000",
        value: "5000+",
      },
    ],
  },

  {
    id: "delivery",

    title: "Processing Timeline",

    options: [
      {
        label: "Within 24 Hours",
        value: "24",
      },

      {
        label: "Within 3 Days",
        value: "3days",
      },

      {
        label: "Within 7 Days",
        value: "7days",
      },
    ],
  },
];