import type {Dispatch, ReactNode, SetStateAction} from 'react'
import {createContext, useState, useContext, useEffect, useRef} from 'react'
import {useBroadcastChannel} from './useBroadcastChannel'

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export const themes: Array<Theme> = Object.values(Theme)

type ThemeContextType = [Theme | null, Dispatch<SetStateAction<Theme | null>>]

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
ThemeContext.displayName = 'ThemeContext'

const prefersLightMQ = '(prefers-color-scheme: light)'
const getPreferredTheme = () =>
  window.matchMedia(prefersLightMQ).matches ? Theme.LIGHT : Theme.DARK

export const mediaQuery =
  typeof window !== 'undefined' ? window.matchMedia(prefersLightMQ) : null

export type ThemeProviderProps = {
  children: ReactNode
  specifiedTheme: Theme | null
  themeAction: string
  disableTransitionOnThemeChange?: boolean
}

export function ThemeProvider({
  children,
  specifiedTheme,
  themeAction,
  disableTransitionOnThemeChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme | null>(() => {
    // On the server, if we don't have a specified theme then we should
    // return null and the clientThemeCode will set the theme for us
    // before hydration. Then (during hydration), this code will get the same
    // value that clientThemeCode got so hydration is happy.
    if (specifiedTheme) {
      return themes.includes(specifiedTheme) ? specifiedTheme : null
    }

    // there's no way for us to know what the theme should be in this context
    // the client will have to figure it out before hydration.
    if (typeof window !== 'object') return null

    return getPreferredTheme()
  })

  const mountRun = useRef(false)

  const broadcastThemeChange = useBroadcastChannel('remix-themes', e =>
    setTheme(e.data),
  )

  const disableTransition = () => {
    const style = document.createElement('style')

    style.textContent = `
      * {
          -ms-transition: none!important;
          -webkit-transition: none!important;
          -moz-transition: none!important;
          -o-transition: none!important;
          transition: none!important
      }
    `

    document.head.appendChild(style);

    (() => window.getComputedStyle(document.body))();

    setTimeout(() => {
      document.head.removeChild(style);
    }, 1);
  }

  useEffect(() => {
    if (!mountRun.current) {
      mountRun.current = true
      return
    }
    if (!theme) return

    fetch(`${themeAction}`, {
      method: 'POST',
      body: JSON.stringify({theme}),
    })

    broadcastThemeChange(theme)
    disableTransitionOnThemeChange && disableTransition()
  }, [broadcastThemeChange, theme, themeAction])

  useEffect(() => {
    const handleChange = (ev: MediaQueryListEvent) => {
      setTheme(ev.matches ? Theme.LIGHT : Theme.DARK)
      disableTransitionOnThemeChange && disableTransition()
    }
    mediaQuery?.addEventListener('change', handleChange)
    return () => mediaQuery?.removeEventListener('change', handleChange)
  }, [])

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      {children}
    </ThemeContext.Provider>
  )
}

const clientThemeCode = `
(() => {
  const theme = window.matchMedia(${JSON.stringify(prefersLightMQ)}).matches
    ? 'light'
    : 'dark';
  
  const cl = document.documentElement.classList;
  const dataAttr = document.documentElement.dataset.theme;

  if (dataAttr != null) {
    const themeAlreadyApplied = dataAttr === 'light' || dataAttr === 'dark';
    if (!themeAlreadyApplied) {
      document.documentElement.dataset.theme = theme;
    }
  } else {
    const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
    if (!themeAlreadyApplied) {
      cl.add(theme);
    }
  }
  
  const meta = document.querySelector('meta[name=color-scheme]');
  if (meta) {
    if (theme === 'dark') {
      meta.content = 'dark light';
    } else if (theme === 'light') {
      meta.content = 'light dark';
    }
  }
})();
`

export function PreventFlashOnWrongTheme({ssrTheme}: {ssrTheme: boolean}) {
  const [theme] = useTheme()

  return (
    <>
      {/*
        On the server, "theme" might be `null`, so clientThemeCode ensures that
        this is correct before hydration.
      */}
      <meta
        name="color-scheme"
        content={theme === 'light' ? 'light dark' : 'dark light'}
      />
      {/*
        If we know what the theme is from the server then we don't need
        to do fancy tricks prior to hydration to make things match.
      */}
      {ssrTheme ? null : (
        <script
          // NOTE: we cannot use type="module" because that automatically makes
          // the script "defer". That doesn't work for us because we need
          // this script to run synchronously before the rest of the document
          // is finished loading.
          dangerouslySetInnerHTML={{__html: clientThemeCode}}
        />
      )}
    </>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && themes.includes(value as Theme)
}
