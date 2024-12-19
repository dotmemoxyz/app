// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import vueI18n from "@intlify/eslint-plugin-vue-i18n";

export default withNuxt(...vueI18n.configs["flat/recommended"], {
  settings: {
    "vue-i18n": {
      localeDir: "./app/locales/*.{json,json5,yaml,yml}",
      messageSyntaxVersion: "^9.0.0",
    },
  },
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-empty": "error",
    "vue/html-self-closing": "off",
    "vue/no-multiple-template-root": "off",
    "@intlify/vue-i18n/no-raw-text": "off",
  },
});
