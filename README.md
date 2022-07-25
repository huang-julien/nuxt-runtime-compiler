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
  nodeModulesRoot?: string,
  includeVue?: boolean
}

```
### nodeModulesRoot

You can specify the node_modules root directory if your `node_modules` directory is not at your `process.cwd()`.

Default value is `./`

For example if you are running `nuxt build` from a project in `root/packages/{YOUR_WORKSPACE}` while your `node_modules` is in `root/`
then the nodeModulesRoot should be 
```ts
export default defineNuxtConfig({
    modules: ["nuxt-runtime-compiler", {
        nodeModulesRoot: "../../"
    }]
})
```

### includeVue
By default this option is set to true. It adds the vue package to the dynamic require targets of Rollup.


## Issues
### "[nuxt] [request error] ... is not defined " on Nuxt 3
###### Fixed in 1.0.9 by unmocking estree and babel/parser for the compiler-dom
Defining components in files that are used by nuxt might cause some template compilation issues with the interpolation.
If you are defining your component in files that are directly imported and compiled by nuxt, prefer using the render function instead of the template key.

```ts
import {defineNuxtComponent} from "#imports";
import {compile} from "vue";

export default defineNuxtComponent({
  render: compile(template)
})
```
