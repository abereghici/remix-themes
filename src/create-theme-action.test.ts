import { createCookieSessionStorage } from "react-router";
import { createThemeAction } from "./create-theme-action";
import { createThemeSessionResolver } from "./theme-server";
import { themes } from "./theme-provider";

function createThemedRequest(theme: string) {
  return new Request("https://remix.themes", {
    method: "POST",
    body: JSON.stringify({
      theme,
    }),
  });
}

const themeSessionResolver = createThemeSessionResolver(
  createCookieSessionStorage({
    cookie: {
      name: "__remix-themes",
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secrets: ["s3cr3t"],
    },
  }),
);

let action: ReturnType<typeof createThemeAction>;

beforeEach(() => {
  action = createThemeAction(themeSessionResolver);
});

describe("create-theme action", () => {
  it.each(themes)("successfully save the %s theme", async (theme) => {
    const request = createThemedRequest(theme);
    const response = await action({ request, params: {}, context: {} });
    await expect((response as Response).json()).resolves.toEqual({
      success: true,
    });
  });

  it("doesn't accept invalid themes", async () => {
    const theme = "yellow";
    const request = createThemedRequest(theme);
    const response = await action({ request, params: {}, context: {} });
    await expect((response as Response).json()).resolves.toEqual({
      success: false,
      message: `theme value of ${theme} is not a valid theme.`,
    });
  });

  it("accepts empty themes", async () => {
    const theme = "";
    const request = createThemedRequest(theme);
    const response = await action({ request, params: {}, context: {} });
    await expect((response as Response).json()).resolves.toEqual({
      success: true,
    });
  });
});
