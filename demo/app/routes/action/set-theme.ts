import {createSetThemeAction} from 'remix-themes'
import {getThemeSession} from '../../theme'

export const action = createSetThemeAction(getThemeSession)
