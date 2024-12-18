// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: ".MEMO",
    },
  },

  css: ["~/assets/css/main.css"],
  devtools: { enabled: true },

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
  ],

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
      enabled: true,
    },
  },

  icon: {
    clientBundle: {
      scan: true,
    },
    serverBundle: "local",
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
