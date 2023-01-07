import { it, expect } from 'vitest'
import { getBrowser, url } from '@nuxt/test-utils'

export function runTest () {
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
}
