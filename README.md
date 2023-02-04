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
