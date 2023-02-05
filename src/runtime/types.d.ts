
import { RuntimeCompilerOptions } from 'vue'

declare module '@nuxt/schema' {
    interface AppConfig {
        vue?: {
            compilerOptions?: RuntimeCompilerOptions
        }
    }

    interface AppConfigInput {
        vue?: {
            compilerOptions?: RuntimeCompilerOptions
        }
    }
}
