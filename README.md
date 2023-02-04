# nuxt-runtime-compiler

A simple module to enable vue runtime bundle on Nuxt 2 and 3

## Configuration

Add the module to nuxt config file:

`nuxt.config.ts`
```ts
export default defineNuxtConfig({
    modules: ["nuxt-runtime-compiler"]
})
```

## Options 

The module has some options built-in

```ts

interface NuxtRuntimeCompilerOptions {
  nodeModulesRoot?: string
  vue?: {
    customElementTags?: string[]
  }
}

```
### nodeModulesRoot

You can specify the node_modules root directory if your `node_modules` directory is not at your `process.cwd()`.

- Default value is `./`

For example if you are running `nuxt build` from a project in `root/packages/{YOUR_WORKSPACE}` while your `node_modules` is in `root/`
then the nodeModulesRoot should be 
```ts
export default defineNuxtConfig({
    modules: ["nuxt-runtime-compiler", {
        nodeModulesRoot: "../../"
    }]
})
```

## RuntimeCompilerOptions
See [app.config documentation](https://nuxt.com/docs/examples/app/app-config)
This module overloads the `AppConfig` exported by `app.config.ts` to pass the [RuntimeCompilerOptions](https://github.com/vuejs/core/blob/dbe7109c8f6417770129dc92313f05feac0c0edb/packages/runtime-core/src/componentOptions.ts#L213-L218) to your VueApp.

Options needs to be passed through `vue.compilerOptions`

`app.config.ts`

```ts
export default defineAppConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => {
        return [
          'math',
          'maction',
        ].includes(tag)
      }
    }
  }
})
```