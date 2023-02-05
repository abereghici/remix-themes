import {expect, test} from '@playwright/test'

test('toggling the theme', async ({page}) => {
  await page.goto('/')

  const html = () => page.locator('html')
  const toggler = () => page.getByRole('button', {name: 'Toggle theme'})

  expect(html()).toHaveAttribute('data-theme', 'light')

  await toggler().click()
  expect(html()).toHaveAttribute('data-theme', 'dark')

  await page.reload()

  await expect(html()).toHaveAttribute('data-theme', 'dark')
})
