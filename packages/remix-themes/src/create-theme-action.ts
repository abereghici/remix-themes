import type { ActionFunction } from 'react-router-dom';
import { data } from 'react-router-dom';
import {isTheme} from './theme-provider'
import type {ThemeSessionResolver} from './theme-server'

export const createThemeAction = (
  themeSessionResolver: ThemeSessionResolver,
): ActionFunction => {
  const action: ActionFunction = async ({request}) => {
    const session = await themeSessionResolver(request)
    const {theme} = await request.json()

    if (!theme) {
      return data(
        {success: true},
        {headers: {'Set-Cookie': await session.destroy()}},
      )
    }

    if (!isTheme(theme)) {
      return data({
        success: false,
        message: `theme value of ${theme} is not a valid theme.`,
      })
    }

    session.setTheme(theme)
    return data(
      {success: true},
      {
        headers: {'Set-Cookie': await session.commit()},
      },
    )
  }
  return action
}
