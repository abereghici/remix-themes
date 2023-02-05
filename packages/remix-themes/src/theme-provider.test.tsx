import React from 'react'
import {vi} from 'vitest'
import {waitFor, render} from '@testing-library/react'
import {act, renderHook} from '@testing-library/react-hooks'
import type {ThemeProviderProps} from './theme-provider'
import {
  ThemeProvider,
  useTheme,
  Theme,
  PreventFlashOnWrongTheme,
  mediaQuery,
} from './theme-provider'

function createFetchResponse<T>(data: T) {
  return {json: () => new Promise(resolve => resolve(data))}
}

const themeAction = '/set-theme'

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue(
    createFetchResponse({
      success: true,
    }),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('theme-provider', () => {
  it('uses specified theme instead of using the current system theme', async () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: (props: ThemeProviderProps) => (
        <ThemeProvider
          {...props}
          specifiedTheme={Theme.DARK}
          themeAction={themeAction}
        />
      ),
    })

    expect(result.current[0]).toBe(Theme.DARK)
  })

  it('changes the theme', async () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: (props: ThemeProviderProps) => (
        <ThemeProvider
          {...props}
          specifiedTheme={Theme.DARK}
          themeAction={themeAction}
        />
      ),
    })
    expect(result.current[0]).toBe(Theme.DARK)

    act(() => {
      result.current[1](Theme.LIGHT)
    })

    const request = [
      themeAction,
      {
        body: JSON.stringify({theme: 'light'}),
        method: 'POST',
      },
    ]

    expect(global.fetch).toHaveBeenLastCalledWith(...request)
    expect(result.current[0]).toBe(Theme.LIGHT)
  })

  it('uses the current system theme if no specified theme was provided', async () => {
    let preferredTheme = Theme.DARK

    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === `(prefers-color-scheme: ${preferredTheme})`,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const {result} = renderHook(() => useTheme(), {
      wrapper: (props: ThemeProviderProps) => (
        <ThemeProvider {...props} themeAction={themeAction} />
      ),
    })

    expect(result.current[0]).toBe(preferredTheme)
  })

  it('updates automatically when the system theme  changes', async () => {
    const prefersLightMQ = '(prefers-color-scheme: light)'

    const {result} = renderHook(() => useTheme(), {
      wrapper: (props: ThemeProviderProps) => (
        <ThemeProvider {...props} themeAction={themeAction} />
      ),
    })

    act(() => {
      mediaQuery.dispatchEvent(
        new MediaQueryListEvent('change', {
          media: prefersLightMQ,
          matches: false,
        }),
      )
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(Theme.DARK)
    })

    act(() => {
      mediaQuery.dispatchEvent(
        new MediaQueryListEvent('change', {
          media: prefersLightMQ,
          matches: true,
        }),
      )
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(Theme.LIGHT)
    })
  })

  it('throws an error when useTheme is used without provider', async () => {
    const {result} = renderHook(() => useTheme())
    expect(result.error?.message).toBe(
      'useTheme must be used within a ThemeProvider',
    )
  })
})

describe('PreventFlashOnWrongTheme', () => {
  it('injects client code before hydration to ensure correct theme', async () => {
    render(
      <ThemeProvider themeAction={themeAction} specifiedTheme={null}>
        <PreventFlashOnWrongTheme ssrTheme={false} />
      </ThemeProvider>,
    )
    expect(document.querySelector('script')).toBeInTheDocument()
  })

  it("doesn't inject client code if backend provided a theme during SSR", async () => {
    render(
      <ThemeProvider themeAction={themeAction} specifiedTheme={null}>
        <PreventFlashOnWrongTheme ssrTheme={true} />
      </ThemeProvider>,
    )
    expect(document.querySelector('script')).not.toBeInTheDocument()
  })
})
