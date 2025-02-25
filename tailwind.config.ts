import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin.js";

export default <Partial<Config>>{
  theme: {
    fontFamily: {
      body: ["Inter", "sans-serif"],
    },
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "surface-white": "rgb(var(--surface-white) / <alpha-value>)",
        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "surface-card": "rgb(var(--surface-card) / <alpha-value>)",
        "border-default": "rgb(var(--border-default) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-placeholder": "rgb(var(--text-placeholder) / <alpha-value>)",
        "accent-primary": "rgb(var(--accent-primary) / <alpha-value>)",
        "accent-primary-hover": "rgb(var(--accent-primary-hover) / <alpha-value>)",
        "accent-primary-dark": "rgb(var(--accent-primary-dark) / <alpha-value>)",
        "accent-primary-light": "rgb(var(--accent-primary-light) / <alpha-value>)",
        "surface-blue": "rgb(var(--surface-blue) / <alpha-value>)",
        "text-blue": "rgb(var(--text-blue) / <alpha-value>)",
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "animate-delay": (value) => ({
            animationDelay: value,
          }),
        },
        { values: theme("transitionDelay") },
      );
    }),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "animate-duration": (value) => ({
            animationDuration: value,
          }),
        },
        { values: theme("transitionDuration") },
      );
    }),
  ],
};
