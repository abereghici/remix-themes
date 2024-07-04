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

    if (!theme) {
      return json(
        {success: true},
        {headers: {'Set-Cookie': await session.destroy()}},
      )
    }

    if (!isTheme(theme)) {
      return json({
        success: false,
        message: `theme value of ${theme} is not a valid theme.`,
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
