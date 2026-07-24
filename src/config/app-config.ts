import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Filing Compliance Portal",
  version: packageJson.version,
  copyright: `© ${currentYear}, All rights reserved.`,
  meta: {
    title: "Filing Compliance Portal",
    description:
      "Filing Compliance Portal is a modern Next.js dashboard starter template that provides a solid foundation for building web applications with a sleek and responsive user interface. It features a user-friendly design, robust authentication system, and a full-stack implementation, making it a powerful tool for developers to create secure and efficient web applications.",
  },
};

export default APP_CONFIG;