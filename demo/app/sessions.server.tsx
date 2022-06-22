import {createCookieSessionStorage} from '@remix-run/node'
import {createThemeSessionResolver} from 'remix-themes'
export const themeSessionResolver = createThemeSessionResolver(
  createCookieSessionStorage({
    cookie: {
      name: 'remix-themes',
      secure: true,
      sameSite: 'lax',
      secrets: ['s3cr3t'],
      path: '/',
      expires: new Date('2100-08-14'),
      httpOnly: true,
    },
  }),
)
