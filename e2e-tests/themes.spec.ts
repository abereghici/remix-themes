import {expect, test} from '@playwright/test'

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
