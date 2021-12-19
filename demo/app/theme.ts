import {createCookieSessionStorage} from 'remix'
import {createThemeSession} from 'remix-themes'

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: 'remix-themes',
    secure: true,
    sameSite: 'lax',
    secrets: ['s3cr3t'],
    path: '/',
    expires: new Date('2100-08-14'),
    httpOnly: true,
  },
})

export const getThemeSession = createThemeSession(themeStorage)
