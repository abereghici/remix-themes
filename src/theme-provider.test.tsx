import { vi } from "vitest";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import {
  PreventFlashOnWrongTheme,
  Theme,
  ThemeProvider,
  mediaQuery,
  useTheme,
} from "./theme-provider";

function createFetchResponse<T>(data: T) {
  return { json: () => new Promise((resolve) => resolve(data)) };
}

const themeAction = "/set-theme";

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue(
    createFetchResponse({
      success: true,
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("theme-provider", () => {
  it("uses specified theme instead of using the current system theme", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider specifiedTheme={Theme.DARK} themeAction={themeAction}>
          {children}
        </ThemeProvider>
      ),
    });

    expect(result.current[0]).toBe(Theme.DARK);
    expect(result.current[2].definedBy).toBe("USER");
  });

  it("changes the theme", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider specifiedTheme={Theme.DARK} themeAction={themeAction}>
          {children}
        </ThemeProvider>
      ),
    });
    expect(result.current[0]).toBe(Theme.DARK);
    expect(result.current[2].definedBy).toBe("USER");

    act(() => {
      result.current[1](Theme.LIGHT);
    });

    const request = [
      themeAction,
      {
        body: JSON.stringify({ theme: "light" }),
        method: "POST",
      },
    ];

    expect(global.fetch).toHaveBeenLastCalledWith(...request);
    expect(result.current[0]).toBe(Theme.LIGHT);
    expect(result.current[2].definedBy).toBe("USER");
  });

  it("uses the current system theme if no specified theme was provided", async () => {
    const preferredTheme = Theme.DARK;

    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === `(prefers-color-scheme: ${preferredTheme})`,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider themeAction={themeAction} specifiedTheme={null}>
          {children}
        </ThemeProvider>
      ),
    });

    expect(result.current[0]).toBe(preferredTheme);
    expect(result.current[2].definedBy).toBe("SYSTEM");
  });

  it("updates automatically when the system theme changes", async () => {
    const prefersLightMQ = "(prefers-color-scheme: light)";

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider themeAction={themeAction} specifiedTheme={null}>
          {children}
        </ThemeProvider>
      ),
    });

    act(() => {
      mediaQuery?.dispatchEvent(
        new MediaQueryListEvent("change", {
          media: prefersLightMQ,
          matches: false,
        }),
      );
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(Theme.DARK);
      expect(result.current[2].definedBy).toBe("SYSTEM");
    });

    act(() => {
      mediaQuery?.dispatchEvent(
        new MediaQueryListEvent("change", {
          media: prefersLightMQ,
          matches: true,
        }),
      );
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(Theme.LIGHT);
      expect(result.current[2].definedBy).toBe("SYSTEM");
    });
  });

  it("ignores the system theme if the user already chose one", async () => {
    const prefersLightMQ = "(prefers-color-scheme: light)";

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider themeAction={themeAction} specifiedTheme={Theme.LIGHT}>
          {children}
        </ThemeProvider>
      ),
    });

    act(() => {
      mediaQuery?.dispatchEvent(
        new MediaQueryListEvent("change", {
          media: prefersLightMQ,
          matches: false,
        }),
      );
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(Theme.LIGHT);
      expect(result.current[2].definedBy).toBe("USER");
    });

    act(() => {
      mediaQuery?.dispatchEvent(
        new MediaQueryListEvent("change", {
          media: prefersLightMQ,
          matches: true,
        }),
      );
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(Theme.LIGHT);
    });
  });

  it("throws an error when useTheme is used without provider", async () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme must be used within a ThemeProvider");
  });
});

describe("PreventFlashOnWrongTheme", () => {
  it("injects client code before hydration to ensure correct theme", async () => {
    const { baseElement } = render(
      <ThemeProvider themeAction={themeAction} specifiedTheme={null}>
        <PreventFlashOnWrongTheme ssrTheme={false} />
      </ThemeProvider>,
    );
    expect(baseElement.querySelector("script")).not.toBeNull();
  });

  it("doesn't inject client code if backend provided a theme during SSR", async () => {
    const { baseElement } = render(
      <ThemeProvider themeAction={themeAction} specifiedTheme={null}>
        <PreventFlashOnWrongTheme ssrTheme={true} />
      </ThemeProvider>,
    );
    expect(baseElement.querySelector("script")).toBeNull();
  });
});
