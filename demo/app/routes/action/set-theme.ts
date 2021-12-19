import {createThemeAction} from 'remix-themes'
import {themeSessionResolver} from '../../root'

export const action = createThemeAction(themeSessionResolver)
