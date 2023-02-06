import {expect, test, type Page} from '@playwright/test'

test('toggling the theme', async ({page}) => {
  await page.goto('/')

  const html = () => page.locator('html')
  const toggler = () => page.getByRole('button', {name: 'Toggle theme'})

  const themeAttribute = 'data-theme'
  const initialTheme = await html().getAttribute(themeAttribute)
  const oppositeTheme = initialTheme === 'light' ? 'dark' : 'light'

  await toggler().click()
  expect(html()).toHaveAttribute(themeAttribute, oppositeTheme)

  await page.reload()

  await expect(toggler()).toBeVisible()

  await expect(html()).toHaveAttribute(themeAttribute, oppositeTheme)
})

test('sync between tabs when theme change', async ({context}) => {
  const pageOne = await context.newPage()
  const pageTwo = await context.newPage()

  await pageOne.goto('/')
  await pageTwo.goto('/')

  const html = (page: Page) => page.locator('html')
  const toggler = (page: Page) =>
    page.getByRole('button', {name: 'Toggle theme'})

  const themeAttribute = 'data-theme'
  const initialTheme = await html(pageOne).getAttribute(themeAttribute)
  const oppositeTheme = initialTheme === 'light' ? 'dark' : 'light'

  await toggler(pageOne).click()
  await expect(html(pageOne)).toHaveAttribute(themeAttribute, oppositeTheme)
  await expect(html(pageTwo)).toHaveAttribute(themeAttribute, oppositeTheme)
})
