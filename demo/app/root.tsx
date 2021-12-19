import {
  Links,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'remix'
import type {MetaFunction} from 'remix'
import {ThemeProvider, useTheme, PreventFlashOnWrongTheme} from 'remix-themes'
import {getThemeSession} from './theme'

export const meta: MetaFunction = () => {
  return {title: 'New Remix App'}
}

export const loader: LoaderFunction = async ({request}) => {
  const themeSession = await getThemeSession(request)

  return {
    theme: themeSession.getTheme(),
  }
}

function App() {
  const data = useLoaderData()
  const [theme] = useTheme()
  return (
    <html lang="en" className={theme ?? ''}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}

export default function AppWithProviders() {
  const data = useLoaderData()

  return (
    <ThemeProvider
      specifiedTheme={data.theme}
      setThemeAction="action/set-theme"
    >
      <App />
    </ThemeProvider>
  )
}
