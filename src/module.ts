import { defineNuxtModule, isNuxt2, isNuxt3 } from '@nuxt/kit'
import { resolve } from 'pathe'

interface NuxtRuntimeCompilerOptions {
  nodeModulesRoot?: string
}

export default defineNuxtModule({
  meta: {
    name: 'nuxt-runtime-compiler',
    configKey: 'nuxtRuntimeCompiler'
  },
  setup (options: NuxtRuntimeCompilerOptions, nuxt) {
    const { nodeModulesRoot = './', includeVue = true } = options

    if (isNuxt2(nuxt)) {
      /** override all nuxt default vue aliases to force uses of the full bundle of VueJS  */
      const vueFullCommonPath = 'vue/dist/vue.common.js'
      const aliases = [
        'vue/dist/vue.common.dev',
        'vue/dist/vue.common.dev.js',
        'vue/dist/vue.common',
        'vue/dist/vue.common.js',
        'vue/dist/vue.common.prod',
        'vue/dist/vue.common.prod.js',
        'vue/dist/vue.esm.browser',
        'vue/dist/vue.esm.browser.js',
        'vue/dist/vue.esm.browser.min',
        'vue/dist/vue.esm.browser.min.js',
        'vue/dist/vue.esm',
        'vue/dist/vue.esm.js',
        'vue/dist/vue',
        'vue/dist/vue.js',
        'vue/dist/vue.min',
        'vue/dist/vue.min.js',
        'vue/dist/vue.runtime.common.dev',
        'vue/dist/vue.runtime.common.dev.js',
        'vue/dist/vue.runtime.common',
        'vue/dist/vue.runtime.common.js',
        'vue/dist/vue.runtime.common.prod',
        'vue/dist/vue.runtime.common.prod.js',
        'vue/dist/vue.runtime.esm',
        'vue/dist/vue.runtime.esm.js',
        'vue/dist/vue.runtime',
        'vue/dist/vue.runtime.js',
        'vue/dist/vue.runtime.min',
        'vue/dist/vue.runtime.min.js',
        'vue'
      ].reduce((obj, aliasName) => Object.assign(obj, { [aliasName]: vueFullCommonPath }), {})

      nuxt.options.alias = {
        ...nuxt.options.alias,
        ...aliases
      }
    } else if (isNuxt3(nuxt)) {
      if(!nuxt.options.nitro) { nuxt.options.nitro = {} }
      // remove vue 3 mocks
      nuxt.options.alias = {
        ...nuxt.options.alias,
        '@vue/compiler-core': '@vue/compiler-core',
        '@vue/compiler-dom': '@vue/compiler-dom',
        '@vue/compiler-ssr': '@vue/compiler-ssr',
        'vue/server-renderer': 'vue/server-renderer',
        'estree-walker': 'estree-walker',
        '@babel/parser': '@babel/parser'
      }

      if (nuxt.options.experimental.externalVue) {
        // force include files not traced by NFT but used by generated code from the runtime compiler
        if(!nuxt.options.nitro.externals) {
          nuxt.options.nitro.externals = {
            traceInclude: []
          }
        }
        if(!nuxt.options.nitro.externals.traceInclude) {
          nuxt.options.nitro.externals.traceInclude = []
        }
        nuxt.options.nitro.externals.traceInclude.push(resolve(nodeModulesRoot, 'node_modules', 'vue', 'server-renderer', 'index.js'))
      } else {
        // allow dynamic require -- passed to rollup
        const commonJS = {
          dynamicRequireTargets: [
            resolve(nodeModulesRoot, 'node_modules', '@vue/compiler-core'),
            resolve(nodeModulesRoot, 'node_modules', '@vue/compiler-dom'),
            resolve(nodeModulesRoot, 'node_modules', '@vue/compiler-ssr'),
            resolve(nodeModulesRoot, 'node_modules', 'vue/server-renderer'),
            resolve(nodeModulesRoot, 'node_modules', 'vue')
          ].concat(nuxt.options.nitro.commonJS?.dynamicRequireTargets ?? [])
        }

        if (nuxt.options.nitro.commonJS) {
          Object.assign(nuxt.options.nitro.commonJS, commonJS)
        } else {
          nuxt.options.nitro.commonJS = commonJS
        }
      }

      // set vue esm on client
      nuxt.hook('vite:extendConfig', (config, { isClient }) => {
        if (isClient) {
          // @ts-ignore -- expect an object
          config.resolve.alias.vue = 'vue/dist/vue.esm-bundler'
        }
      })
      nuxt.hook('webpack:config', (configuration) => {
        const clientConfig = configuration.find(config => config.name === 'client')
        if (!clientConfig.resolve) { clientConfig.resolve.alias = {} }
        if (Array.isArray(clientConfig.resolve.alias)) {
          clientConfig.resolve.alias.push({
            name: 'vue',
            alias: 'vue/dist/vue.esm-bundler'
          })
        } else {
          clientConfig.resolve.alias.vue = 'vue/dist/vue.esm-bundler'
        }
      })
    }
  }
})
