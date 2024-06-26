// https://nuxt.com/docs/api/configuration/nuxt-config
import dotenv from 'dotenv'

dotenv.config()

export default defineNuxtConfig({
  devServer: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000
  },

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      PORT: process.env.PORT
    }
  },
  modules: ["@nuxt/ui"]
})
