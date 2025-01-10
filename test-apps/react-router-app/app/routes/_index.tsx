import { Theme, useTheme } from "remix-themes";
import { useEffect } from "react";

export default function Index() {
  const [theme, setTheme, { definedBy }] = useTheme();

  useEffect(() => {
    console.log({ theme, definedBy });
  }, [definedBy, theme]);

  return (
    <div>
      <h1>Welcome to React Router</h1>
      <div style={{ margin: "1rem 0" }}>
        <label style={{ display: "flex", gap: "8px" }}>
          Theme
          <select
            name="theme"
            value={definedBy === "SYSTEM" ? "" : (theme ?? "")}
            onChange={(e) => {
              const nextTheme = e.target.value;

              if (nextTheme === "") {
                setTheme(null);
              } else {
                setTheme(nextTheme as Theme);
              }
            }}
          >
            <option value="">System</option>
            <option value={Theme.LIGHT}>Light</option>
            <option value={Theme.DARK}>Dark</option>
          </select>
        </label>
      </div>
      <a href="/about">About</a>
    </div>
  );
}
