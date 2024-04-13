import {Link} from '@remix-run/react'
import {Theme, useTheme} from 'remix-themes'
import {MoonIcon, SunIcon} from 'lucide-react'

export default function Index() {
  const [, setTheme] = useTheme()
  return (
    <div>
      <h1>Welcome to Remix</h1>
      <button
        type="button"
        className="icon-button"
        onClick={() =>
          setTheme(prev => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))
        }
      >
        <SunIcon className="icon sun-icon" />
        <MoonIcon className="icon moon-icon" />
      </button>
      <Link to="/about">About</Link>
    </div>
  )
}
