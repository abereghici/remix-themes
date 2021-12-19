import {SessionStorage} from '@remix-run/server-runtime'
import {Theme, isTheme} from './theme-provider'

type ThemeSession = {
  getTheme: () => Theme | null
  setTheme: (theme: Theme) => void
  commit: () => Promise<string>
}

export type GetThemeSessionFn = (request: Request) => Promise<ThemeSession>

const createThemeSession = (
  cookieThemeSession: SessionStorage,
): GetThemeSessionFn => {
  return async (request: Request): Promise<ThemeSession> => {
    const session = await cookieThemeSession.getSession(
      request.headers.get('Cookie'),
    )

    return {
      getTheme: () => {
        const themeValue = session.get('theme')
        return isTheme(themeValue) ? themeValue : null
      },
      setTheme: (theme: Theme) => session.set('theme', theme),
      commit: () => cookieThemeSession.commitSession(session),
    }
  }
}

export {createThemeSession}
