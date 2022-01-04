import {
  createCookieSessionStorage,
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'remix'
import type {MetaFunction} from 'remix'
import {
  ThemeProvider,
  useTheme,
  PreventFlashOnWrongTheme,
  createThemeSessionResolver,
} from 'remix-themes'
import styles from './styles/index.css'

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: styles}]
}

export const meta: MetaFunction = () => {
  return {title: 'New Remix App'}
}

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

export const loader: LoaderFunction = async ({request}) => {
  const {getTheme} = await themeSessionResolver(request)

  return {
    theme: getTheme(),
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
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  )
}
