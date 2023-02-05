import { resolve } from 'path'
import { existsSync } from 'fs'
import { addPlugin, createResolver, defineNuxtModule, isNuxt2, isNuxt3, resolvePath } from '@nuxt/kit'
import type { AppConfig } from '@nuxt/schema'

interface NuxtRuntimeCompilerOptions {
  nodeModulesRoot?: string
}

export default defineNuxtModule({
  meta: {
    name: 'nuxt-runtime-compiler',
    configKey: 'nuxtRuntimeCompiler'
  },
  async setup ({ nodeModulesRoot = './' } : NuxtRuntimeCompilerOptions, nuxt) {
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
      if (!nuxt.options.nitro) { nuxt.options.nitro = {} }
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
        if (!nuxt.options.nitro.externals) {
          nuxt.options.nitro.externals = {
            traceInclude: []
          }
        }
        if (!nuxt.options.nitro.externals.traceInclude) {
          nuxt.options.nitro.externals.traceInclude = []
        }
        nuxt.options.nitro.externals.traceInclude.push(resolve(nodeModulesRoot, 'node_modules', 'vue', 'server-renderer', 'index.js'))
      } else {
        const requireTargets = [
          resolve(nodeModulesRoot, 'node_modules', '@vue/compiler-core'),
          resolve(nodeModulesRoot, 'node_modules', '@vue/compiler-dom'),
          resolve(nodeModulesRoot, 'node_modules', '@vue/compiler-ssr'),
          resolve(nodeModulesRoot, 'node_modules', 'vue/server-renderer'),
          resolve(nodeModulesRoot, 'node_modules', 'vue')
        ]

        // allow dynamic require -- passed to rollup
        const commonJS = {
          dynamicRequireTargets: typeof nuxt.options.nitro.commonJS?.dynamicRequireTargets === 'string'
            ? [
                ...requireTargets,
                nuxt.options.nitro.commonJS?.dynamicRequireTargets
              ]
            : requireTargets.concat(nuxt.options.nitro.commonJS?.dynamicRequireTargets as string[] ?? [])
        }

        if (nuxt.options.nitro.commonJS) {
          Object.assign(nuxt.options.nitro.commonJS, commonJS)
        } else {
          nuxt.options.nitro.commonJS = commonJS
        }
      }

      // set vue esm alias on vite and webpack
      nuxt.hook('vite:extendConfig', (config, { isClient }) => {
        // don't set the alias on server with externalVue false
        if (nuxt.options.experimental.externalVue || isClient) {
          // @ts-ignore -- expect an object
          config.resolve.alias.vue = 'vue/dist/vue.esm-bundler'
        }
      })
      nuxt.hook('webpack:config', (configuration) => {
        configuration.forEach((config) => {
          if (!config.resolve) { config.resolve = { alias: [] } }
          if (!config.resolve.alias) { config.resolve.alias = [] }
          if (Array.isArray(config.resolve.alias)) {
            config.resolve.alias.push({
              name: 'vue',
              alias: 'vue/dist/vue.esm-bundler'
            })
          } else {
            config.resolve.alias.vue = 'vue/dist/vue.esm-bundler'
          }
        })
      })

      const resolver = createResolver(import.meta.url)
      const runtimeDir = await resolver.resolve('./runtime')
      nuxt.options.build.transpile.push(runtimeDir)

      addPlugin(resolve(runtimeDir, 'nuxt-runtime-compiler.plugin'))

      nuxt.hook('prepare:types', ({ references }) => {
        references.push({ path: resolve(runtimeDir, 'types.d.ts') })
      })

      const appConfigPath = await resolvePath('app.config')

      // use AppConfig to define vue compiler options at build time
      if (existsSync(appConfigPath)) {
        const globalDefineAppConfig = (globalThis as any).defineAppConfig

        if (!globalDefineAppConfig) {
          // allow defineAppConfig
          (globalThis as any).defineAppConfig = (c: any) => c
        }
        const appConfig = await import(appConfigPath) as AppConfig

        nuxt.options.vite.vue = {
          ...nuxt.options.vite.vue,
          template: {
            ...nuxt.options.vite.vue?.template,
            compilerOptions: {
              ...nuxt.options.vite.vue?.template?.compilerOptions,
              ...appConfig.vue?.compilerOptions
            }
          }
        }

        nuxt.options.webpack.loaders.vue = {
          ...nuxt.options.webpack.loaders.vue,
          compilerOptions: {
            ...nuxt.options.webpack.loaders.vue.compilerOptions,
            ...appConfig.vue?.compilerOptions
          }
        }

        if (!globalDefineAppConfig) {
          delete (globalThis as any).defineAppConfig
        }
      }
    }
  }
})
