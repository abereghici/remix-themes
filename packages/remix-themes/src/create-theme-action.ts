import type {ActionFunction} from '@remix-run/server-runtime'
import {json} from '@remix-run/server-runtime'
import {isTheme} from './theme-provider'
import type {ThemeSessionResolver} from './theme-server'

export const createThemeAction = (
  themeSessionResolver: ThemeSessionResolver,
): ActionFunction => {
  const action: ActionFunction = async ({request}) => {
    const session = await themeSessionResolver(request)
    const {theme} = await request.json()

    if (!isTheme(theme)) {
      let message = theme
        ? `theme value of ${theme} is not a valid theme.`
        : `empty theme provided`

      return json({
        success: false,
        message,
      })
    }

    session.setTheme(theme)
    return json(
      {success: true},
      {
        headers: {'Set-Cookie': await session.commit()},
      },
    )
  }
  return action
}
