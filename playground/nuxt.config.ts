import { defineNuxtConfig } from 'nuxt'
import nuxtRuntimeCompiler from "../src/module"

export default defineNuxtConfig({
  modules: [
    nuxtRuntimeCompiler
  ],
})
