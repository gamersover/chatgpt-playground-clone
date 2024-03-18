// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  vite: {
    server: {
      proxy: {
        "/ollama": {
          target: "http://localhost:11434/v1",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ollama/, '')
        }
      }
    }
  }
})