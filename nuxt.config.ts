// https://nuxt.com/docs/api/configuration/nuxt-config
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
export default defineNuxtConfig({
  app: {
    head: {
      title: ".MEMO",
    },
  },
  plugins: ["~/plugins/auth-init.client.ts"],
  css: ["~/assets/css/main.css"],
  devtools: { enabled: true },
  experimental: { viewTransition: true },
  vite: {
    plugins: [
      VueI18nPlugin({
        include: ["./locales/**"],
      }),
    ],
  },
  watch: ["~/locales/**"],
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/google-fonts",
    "@nuxtjs/color-mode",
    "@vue-final-modal/nuxt",
    "@vite-pwa/nuxt",
    "@nuxtjs/i18n",
  ],
  i18n: {
    defaultLocale: "en",
    locales: [{ code: "en", name: "English", file: "en-US.json" }],
  },
  runtimeConfig: {
    apiUrl: "",
    public: {
      appUrl: "",
      api: {
        kodaprice: "",
        coingecko: "",
      },
      chain: "ahp",
    },
  },
  colorMode: {
    preference: "system",
    fallback: "light",
    storage: "localStorage",
    storageKey: "color-mode",
  },
  pwa: {
    strategies: "generateSW",
    registerType: "autoUpdate",
    manifest: {
      name: ".MEMO Web App",
      short_name: ".MEMO",
      theme_color: "#ffffff",
      icons: [
        {
          src: "icons/192.webp",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icons/256.webp",
          sizes: "256x256",
          type: "image/png",
        },
        {
          src: "icons/512.webp",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/ahk\.gql\.api\.kodadot.xyz\/.*/i,
          handler: "CacheFirst",
        },
      ],
    },
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      // Enable for development testing
      // enabled: true,
    },
  },

  icon: {
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
      sizeLimitKb: 1024,
    },
    serverBundle: "local",
    customCollections: [
      {
        prefix: "memo",
        dir: "./app/assets/icons",
        width: 24,
        height: 24,
      },
    ],
  },

  googleFonts: {
    families: {
      Unbounded: true,
    },
  },
  routeRules: {
    "/create": { ssr: false },
  },

  compatibilityDate: "2024-09-20",
});
