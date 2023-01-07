import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import module from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    [module]
  ],
  experimental: {
    externalVue: false
  },
  extends: './../base'
})
