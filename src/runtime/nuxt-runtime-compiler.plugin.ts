import { defineNuxtPlugin, useAppConfig } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const appConfig = useAppConfig()
  nuxtApp.vueApp.config.compilerOptions.isCustomElement = appConfig.vue?.compilerOptions?.isCustomElement
})
