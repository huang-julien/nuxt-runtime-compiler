import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, getBrowser, url } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/' + (process.env.FIXTURE ?? 'base'), import.meta.url)),
  browser: true,
  server: true
})

describe('test basic config', () => {
  it('expect render page without any error or logs', async () => {
    const browser = await getBrowser()
    const page = await browser.newPage({})
    const pageErrors: Error[] = []
    const consoleLogs: { type: string, text: string }[] = []

    page.on('console', (message) => {
      consoleLogs.push({
        type: message.type(),
        text: message.text()
      })
    })
    page.on('pageerror', (err) => {
      pageErrors.push(err)
    })

    await page.goto(url('/'), { waitUntil: 'networkidle' })

    expect(pageErrors).toHaveLength(0)
    expect(consoleLogs).toHaveLength(0)
  })
})
