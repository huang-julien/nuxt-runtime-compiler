import { resolve } from "path";
import { fileURLToPath } from "url";
import { defineNuxtModule, addPlugin } from "@nuxt/kit";
import commonjs from "@rollup/plugin-commonjs";
export interface ModuleOptions {
  addPlugin: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt3-runtime-compiler-module",
    configKey: "nuxt3RuntimeCompilerModule",
  },
  defaults: {
    addPlugin: true,
  },
  setup(options, nuxt) {
    // remove vue 3 mocks
    nuxt.options.alias = {
      ...nuxt.options.alias,
      "@vue/compiler-core": "@vue/compiler-core",
      "@vue/compiler-dom": "@vue/compiler-dom",
      "@vue/compiler-ssr": "@vue/compiler-ssr",
      "@vue/devtools-api": "@vue/devtools-api",
      "@vue/server-renderer": "@vue/server-renderer",
      // rollup error fix: 'ssrRenderAttrs' is not exported by ...due to export *
      "vue/server-renderer": "@vue/server-renderer",
    };

    // set vue esm on client
    nuxt.hook("vite:extendConfig", (config, { isClient, isServer }) => {
      if (isClient) {
        config.resolve.alias.vue = "vue/dist/vue.esm-bundler";
      }
    });

    if (!nuxt.options.nitro.hooks) {
      nuxt.options.nitro.hooks = {};
    }

    nuxt.options.nitro.hooks["rollup:before"] = (nitro) => {
      // get the index of @rollup/plugin-commonjs set by nitro
      const indexOfCommonJsPlugin =
        nitro.options.rollupConfig.plugins.findIndex((plugin) => {
          return typeof plugin !== "boolean" && plugin.name === "commonjs";
        });

      if (indexOfCommonJsPlugin >= 0) {
        // replace the @rollup/plugin-commonjs set by nitro
        nitro.options.rollupConfig.plugins.splice(
          indexOfCommonJsPlugin,
          1,
          commonjs({
            dynamicRequireTargets: [
              "./node_modules/@vue/compiler-core",
              "./node_modules/@vue/compiler-dom",
              "./node_modules/@vue/compiler-ssr",
              "./node_modules/@vue/devtools-api",
              "./node_modules/vue/server-renderer",
              "./node_modules/@vue/server-renderer",
            ],
          })
        );
      }
    };
  },
});
