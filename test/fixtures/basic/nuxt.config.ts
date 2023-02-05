import nuxtRuntimeCompiler from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    nuxtRuntimeCompiler
  ],
  experimental: {
    externalVue: !process.env.NO_EXTERNAL_VUE
  },
  builder: process.env.BUILDER as 'vite' | 'webpack' ?? 'vite'
})
