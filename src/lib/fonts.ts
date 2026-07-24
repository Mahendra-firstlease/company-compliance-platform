import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const fontRegistry = {
  poppins: {
    label: "Poppins",
    font: poppins,
  },
} as const;

export const fontVars = Object.values(fontRegistry)
  .map(({ font }) => font.variable)
  .join(" ");