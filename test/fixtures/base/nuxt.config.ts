import { defineNuxtConfig } from 'nuxt/config'
import nuxtRuntimeCompiler from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    nuxtRuntimeCompiler
  ]
})
