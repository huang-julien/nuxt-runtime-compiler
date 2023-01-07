import { fileURLToPath } from 'node:url'
import { describe } from 'vitest'
import { setup } from '@nuxt/test-utils'
import { runTest } from './commonTest'

describe('test externalVue disabled config', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/external-vue-disabled', import.meta.url)),
    browser: true,
    server: true
  })

  runTest()
})
