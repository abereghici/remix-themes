import {useCallback} from 'react'

function withoutTransition(callback: Function) {
  const css = document.createElement('style')
  css.appendChild(
    document.createTextNode(
      `* {
       -webkit-transition: none !important;
       -moz-transition: none !important;
       -o-transition: none !important;
       -ms-transition: none !important;
       transition: none !important;
    }`,
    ),
  )
  document.head.appendChild(css)

  callback()

  setTimeout(() => {
    // Calling getComputedStyle forces the browser to redraw
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = window.getComputedStyle(css).transition
    document.head.removeChild(css)
  }, 0)
}

export function useCorrectCssTransition({
  disableTransitions = false,
}: {disableTransitions?: boolean} = {}) {
  return useCallback(
    (callback: Function) => {
      if (disableTransitions) {
        withoutTransition(() => {
          callback()
        })
      } else {
        callback()
      }
    },
    [disableTransitions],
  )
}
