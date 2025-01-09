import type { SessionStorage } from "react-router";
import type { Theme } from "./theme-provider";
import { isTheme } from "./theme-provider";

type ThemeSession = {
  getTheme: () => Theme | null;
  setTheme: (theme: Theme) => void;
  commit: () => Promise<string>;
  destroy: () => Promise<string>;
};

export type ThemeSessionResolver = (request: Request) => Promise<ThemeSession>;

export const createThemeSessionResolver = (
  cookieThemeSession: SessionStorage,
): ThemeSessionResolver => {
  const resolver = async (request: Request): Promise<ThemeSession> => {
    const session = await cookieThemeSession.getSession(
      request.headers.get("Cookie"),
    );

    return {
      getTheme: () => {
        const themeValue = session.get("theme");
        return isTheme(themeValue) ? themeValue : null;
      },
      setTheme: (theme: Theme) => session.set("theme", theme),
      commit: () => cookieThemeSession.commitSession(session),
      destroy: () => cookieThemeSession.destroySession(session),
    };
  };

  return resolver;
};
