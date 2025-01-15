import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      boxShadow: {
        "custom-medium":
          '0 2px 8px rgba(0, 0, 0, 0.2), 2px 0 8px rgba(0, 0, 0, 0.2), -2px 0 8px rgba(0, 0, 0, 0.2)', // Shadow on all sides
      },
    },
  },
  plugins: [],
} satisfies Config;
