import {createCookieSessionStorage} from '@remix-run/node'
import {createThemeSessionResolver} from 'remix-themes'

export const themeSessionResolver = createThemeSessionResolver(
  createCookieSessionStorage({
    cookie: {
      name: '__remix-themes',
      // domain: 'remix.run',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secrets: ['s3cr3t'],
      // secure: true,
    },
  }),
)
