export default defineNuxtConfig({
  modules: [
    'nuxt-runtime-compiler'
  ],
  experimental: {
    externalVue: !process.env.NO_EXTERNAL_VUE
  },
  builder: process.env.BUILDER as 'vite' | 'webpack' ?? 'vite'
})
