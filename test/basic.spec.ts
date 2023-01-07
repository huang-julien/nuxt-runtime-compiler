import { fileURLToPath } from 'node:url'
import { describe } from 'vitest'
import { setup } from '@nuxt/test-utils'
import { runTest } from './commonTest'

describe('test basic config', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/base', import.meta.url)),
    browser: true,
    server: true
  })

  runTest()
})
