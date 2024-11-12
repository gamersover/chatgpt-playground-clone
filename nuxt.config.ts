// https://nuxt.com/docs/api/configuration/nuxt-config
import dotenv from 'dotenv'

dotenv.config()

export default defineNuxtConfig({
  app: {
    head: {
      title: "LLM Playground",
      link: [
        { rel: "icon", type: "image/x-icon", href: "/icon.ico" },
      ]
    }
  },

  devServer: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000
  },

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      PORT: process.env.PORT
    }
  },

  modules: ["@nuxt/ui"],
  compatibilityDate: "2024-11-12"
})