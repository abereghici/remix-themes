# Remix Themes

### An abstraction for themes in your [Remix](https://remix.run/) app.

## Features

- ✅ Perfect dark mode in a few lines of code
- ✅ System setting with prefers-color-scheme
- ✅ No flash on load
- ✅ Disable flashing when changing themes
- ✅ Class or data attribute selector
- ✅ Sync theme across tabs and windows

Check out the
[Example](https://github.com/abereghici/remix-themes/tree/main/packages/remix-themes-app)
to see it in action.

## Install

```bash
$ npm install remix-themes
# or
$ yarn add remix-themes
```

## Getting Started

### Create your session storage and create a themeSessionResolver

```ts
// sessions.server.tsx

import {createThemeSessionResolver} from 'remix-themes'
import { createCookieSessionStorage } from "@remix-run/node"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__remix-themes',
    // domain: 'remix.run',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secrets: ['s3cr3t'],
    // secure: true,
  },
})

export const themeSessionResolver = createThemeSessionResolver(sessionStorage)
```

Note: make sure you have `domain` and `secure` parameters set only for your
production environment. Otherwise, Safari won't store the cookie if you set
these parameters on localhost.

### Setup Remix Themes

```ts
// root.tsx

import {ThemeProvider, useTheme, PreventFlashOnWrongTheme} from 'remix-themes'
import {themeSessionResolver} from './sessions.server'

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
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  )
}

// Use the theme in your app.
// If the theme is missing in session storage, PreventFlashOnWrongTheme will get
// the browser theme before hydration and will prevent a flash in browser.
// The client code runs conditionally, it won't be rendered if we have a theme in session storage.
function App() {
  const data = useLoaderData()
  const [theme] = useTheme()
  return (
    <html lang="en" data-theme={theme ?? ''}>
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

Create a file in `/routes/action/set-theme.ts` or `/routes/action.set-theme.ts`
when using
[Route File Naming v2](https://remix.run/docs/en/1.19.3/file-conventions/route-files-v2#route-file-naming-v2)
with the content below. Ensure that you pass the filename to the `ThemeProvider`
component.

> Note: You can name the action route whatever you want. Just make sure you pass
> the correct action name to the `ThemeProvider` component. Make sure to use
> absolute path when using nested routing.

This route is used to store the preferred theme in the session storage when
the user changes it.

```ts
import {createThemeAction} from 'remix-themes'
import {themeSessionResolver} from './sessions.server'

export const action = createThemeAction(themeSessionResolver)
```

## API

Let's dig into the details.

### ThemeProvider

- `specifiedTheme`: The theme from the session storage.
- `themeAction`: The action name used to change the theme in the session
  storage.
- `disableTransitionOnThemeChange`: Disable CSS transitions on theme change to
  prevent the flashing effect.

### useTheme

useTheme takes no parameters but returns:

- `theme`: Active theme name
- `setTheme`: Function to set the theme. If the theme is set to `null`, the
  system theme will be used and `definedBy` property in the `metadata` object
  will be set to `SYSTEM`.
- `metadata`: An object which contains the following properties:
  - `definedBy`: The theme source. It can be `USER` or `SYSTEM`. Useful to
    detect if the theme was set by the user or by the system.

### createThemeSessionResolver

`createThemeSessionResolver` function takes a cookie session storage and returns

- `resolver`: A function that takes a request and returns an object with the
  following properties:
  - `getTheme`: A function that returns the theme from the session storage.
  - `setTheme`: A function that takes a theme name and sets it in the session
    storage.
  - `commit`: A function that commits the session storage (Stores all data in
    the session and returns the Set-Cookie header to use in the HTTP response.)

### PreventFlashOnWrongTheme

On the server, "theme" might be `null` so `PreventFlashOnWrongTheme` ensures
that this is correct before hydration. If the theme is null on the server, this
component will set the browser theme on the `html` element in a `data-theme`
attribute if exists, otherwise it will be set to a `class` attribute. If both
`data-theme` and `class` are set, the `data-theme` will be used.

- `ssrTheme`: boolean value that indicates if we have a theme in the session
  storage.
