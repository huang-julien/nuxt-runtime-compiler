import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, getBrowser, url, $fetch } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  browser: true,
  server: true
})

describe('test basic config', () => {
  it('expect render page without any error or logs', async () => {
    const { getWarningLogs, getErrorLogs, pageErrors } = await getPage()
    expect(getWarningLogs()).toHaveLength(0)
    expect(getErrorLogs()).toHaveLength(0)
    expect(pageErrors).toHaveLength(0)
  })

  it('test HelloWorld.vue', async () => {
    const html = await $fetch('/')
    const { page } = await getPage()

    expect(html).toContain('<div id="hello-world">hello, Helloworld.vue here ! </div>')
    expect(await page.locator('body').innerHTML()).toContain('<div id="hello-world">hello, Helloworld.vue here ! </div>')
  })

  it('test Name.ts', async () => {
    const html = await $fetch('/')
    const { page } = await getPage()

    await page.goto(url('/'), { waitUntil: 'networkidle' })
    expect(html).toContain('<div id="name">I am the Name.ts component</div>')
    expect(await page.locator('body').innerHTML()).toContain('<div id="name">I am the Name.ts component</div>')
  })

  it('test ShowTemplate.ts', async () => {
    const html = await $fetch('/')
    const { page } = await getPage()

    await page.goto(url('/'), { waitUntil: 'networkidle' })
    expect(html).toContain('<div id="show-template">Hello my name is : Julien, i am defined by ShowTemplate.vue and my template is retrieved from the API</div>')
    expect(await page.locator('body').innerHTML()).toContain('<div id="show-template">Hello my name is : Julien, i am defined by ShowTemplate.vue and my template is retrieved from the API</div>')
  })

  it('test Interactive component.ts', async () => {
    const html = await $fetch('/')
    const { page } = await getPage()

    await page.goto(url('/'), { waitUntil: 'networkidle' })
    expect(html).toContain('I am defined by Interactive in the setup of App.vue. My full component definition is retrieved from the api')
    expect(await page.locator('#interactive').innerHTML()).toContain('I am defined by Interactive in the setup of App.vue. My full component definition is retrieved from the api')
    const button = page.locator('#inc-interactive-count')
    await button.click()
    const count = page.locator('#interactive-count')
    expect(await count.innerHTML()).toBe('1')
  })
})

async function getPage () {
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

  const getErrorLogs = () => consoleLogs.filter(i => i.type === 'error')
  const getWarningLogs = () => consoleLogs.filter(i => i.type === 'warning')

  return { page, pageErrors, consoleLogs, getErrorLogs, getWarningLogs }
}
