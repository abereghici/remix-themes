# Remix Themes

### An abstraction for themes in your [Remix](https://remix.run/) app.

## Features

- ✅ Perfect dark mode in a few lines of code
- ✅ System setting with prefers-color-scheme
- ✅ Automatically updates the theme when the user changes the system setting
- ✅ No flash on load

Check out the
[Example](https://github.com/abereghici/remix-themes/tree/main/demo) to see it
in action.

## Install

```bash
$ npm install remix-themes
# or
$ yarn add remix-themes
```

## Getting Started

### Create your session storage and create a themeSessionResolver

```ts
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'remix-themes',
    secure: true,
    sameSite: 'lax',
    secrets: ['s3cr3t'],
    path: '/',
    httpOnly: true,
  },
})

export const themeSessionResolver = createThemeSessionResolver(sessionStorage)
```

### Setup Remix Themes

```ts
import {
  ThemeProvider,
  useTheme,
  PreventFlashOnWrongTheme,
  createThemeSessionResolver,
} from 'remix-themes'

// Return the theme from the session storage using the loader
export const loader: LoaderFunction = async ({request}) => {
  const {getTheme} = await themeSessionResolver(request)
  return {
    theme: getTheme(),
  }
}

// Wrap your app with ThemeProvider.
// `specifiedTheme` is the stored theme in the session storage.
// `themeAction` is the action name that's used to change the theme in the session storage.
export default function AppWithProviders() {
  const data = useLoaderData()
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="action/set-theme">
      <App />
    </ThemeProvider>
  )
}

// Use the theme in your app.
// PreventFlashOnWrongTheme is used to prevent flash on wrong theme.
// If the theme is missing in session storage, it will get the browser theme.
// The client code runs conditionally, it won't be rendered if we have a theme in session storage.
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
```

#### Add the action route

Create a file in `/routes/action/set-theme.ts` with the content below. Ensure
that you pass the filename to the `ThemeProvider` component.

This route it's used to store the preferred theme in the session storage when
the user changes it.

```ts
import {createThemeAction} from 'remix-themes'
import {themeSessionResolver} from '../../root'

export const action = createThemeAction(themeSessionResolver)
```

## API

Let's dig into the details.

### ThemeProvider

- `specifiedTheme`: The theme from the session storage.
- `themeAction`: The action name that's used to change the theme in the session
  storage.

### useTheme

useTheme takes no parameters but returns:

- `theme`: Active theme name

### createThemeSessionResolver

`createThemeSessionResolver` function takes a cookie session storage and returns

- `resolver`: A function that takes a request and returns an object with the
  following properties:
  - `getTheme`: A function that returns the theme from the session storage.
  - `setTheme`: A function that takes a theme name and sets it in the session
    storage.
  - `commit`: A function that commits the session storage (Stores all data in
    the session and returns the Set-Cookie header to be used in the HTTP
    response.)

### PreventFlashOnWrongTheme

On the server, "theme" might be `null` so `PreventFlashOnWrongTheme` ensures
that this is correct before hydration.

- `ssrTheme`: boolean value that indicates if we have a theme in the session
  storage.
