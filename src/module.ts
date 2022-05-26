import { defineNuxtModule } from "@nuxt/kit";
import commonjs from "@rollup/plugin-commonjs";

export interface ModuleOptions {
  includeVue: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt3-runtime-compiler-module",
    configKey: "nuxt3RuntimeCompilerModule",
  },
  setup(options, nuxt) {

    const {includeVue} = options;

    // remove vue 3 mocks
    nuxt.options.alias = {
      ...nuxt.options.alias,
      "@vue/compiler-core": "@vue/compiler-core",
      "@vue/compiler-dom": "@vue/compiler-dom",
      "@vue/compiler-ssr": "@vue/compiler-ssr",
      "vue/server-renderer": "vue/server-renderer",
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

    // unmock vue
    const dynamicRequireTargets = [
      "./node_modules/@vue/compiler-core",
      "./node_modules/@vue/compiler-dom",
      "./node_modules/@vue/compiler-ssr",
      "./node_modules/vue/server-renderer",
    ];

    if(includeVue) {
      dynamicRequireTargets.push('./node_modules/vue')
    }

    if(nuxt._version === '3.0.0-rc.1'){
      // nuxt rc 1 compatibility
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
              dynamicRequireTargets
            })
          );
        }
      };
    } else {
      nuxt.options.commonJS.dynamicRequireTargets = dynamicRequireTargets
    }
  },
});
