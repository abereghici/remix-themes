import {Link} from '@remix-run/react'
import {useEffect} from 'react'
import {Theme, useTheme} from 'remix-themes'

export default function Index() {
  const [theme, setTheme, {definedBy}] = useTheme()

  useEffect(() => {
    console.log({theme, definedBy})
  }, [definedBy, theme])

  return (
    <div>
      <h1>Welcome to Remix</h1>
      <div style={{margin: '1rem 0'}}>
        <label style={{display: 'flex', gap: '8px'}}>
          Theme
          <select
            name="theme"
            value={definedBy === 'SYSTEM' ? '' : theme ?? ''}
            onChange={e => {
              const nextTheme = e.target.value

              if (nextTheme === '') {
                setTheme(null)
              } else {
                setTheme(nextTheme as Theme)
              }
            }}
          >
            <option value="">System</option>
            <option value={Theme.LIGHT}>Light</option>
            <option value={Theme.DARK}>Dark</option>
          </select>
        </label>
      </div>
      <Link to="/about">About</Link>
    </div>
  )
}
