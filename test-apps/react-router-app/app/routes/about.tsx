import { Theme, useTheme } from "remix-themes";

export default function About() {
  const [, setTheme] = useTheme();
  return (
    <div>
      <h1>Welcome to React Router</h1>
      <div style={{ margin: "1rem 0" }}>
        <button
          type="button"
          onClick={() =>
            setTheme((prev) => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))
          }
        >
          Toggle theme
        </button>
      </div>
      <a href="/">Home</a>
    </div>
  );
}
