import {createCookieSessionStorage} from '@remix-run/node'
import {createThemeSessionResolver} from 'remix-themes'
import {createThemeAction} from './create-theme-action'
import {themes} from './theme-provider'

function createThemedRequest(theme: string) {
  return new Request('https://remix.themes', {
    method: 'POST',
    body: JSON.stringify({
      theme,
    }),
  })
}

const themeSessionResolver = createThemeSessionResolver(
  createCookieSessionStorage({
    cookie: {
      name: '__remix-themes',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secrets: ['s3cr3t'],
    },
  }),
)

let action: ReturnType<typeof createThemeAction>

beforeEach(() => {
  action = createThemeAction(themeSessionResolver)
})

describe('create-theme action', () => {
  it.each(themes)('successfully save the %s theme', async theme => {
    let request = createThemedRequest(theme)
    let response = await action({request, params: {}, context: {}})
    await expect(response.json()).resolves.toEqual({success: true})
  })

  it("doesn't accept invalid themes", async () => {
    let theme = 'yellow'
    let request = createThemedRequest(theme)
    let response = await action({request, params: {}, context: {}})
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: `theme value of ${theme} is not a valid theme.`,
    })
  })

  it("doesn't accept empty themes", async () => {
    let theme = ''
    let request = createThemedRequest(theme)
    let response = await action({request, params: {}, context: {}})
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: `empty theme provided`,
    })
  })
})
