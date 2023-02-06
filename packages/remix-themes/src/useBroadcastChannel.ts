import {useEffect, useCallback, useRef} from 'react'
import type {MutableRefObject} from 'react'

export function useBroadcastChannel<T = string>(
  channelName: string,
  handleMessage?: (event: MessageEvent) => void,
  handleMessageError?: (event: MessageEvent) => void,
): (data: T) => void {
  const channelRef = useRef(
    typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel(channelName + '-channel')
      : null,
  )

  useChannelEventListener(channelRef, 'message', handleMessage)
  useChannelEventListener(channelRef, 'messageerror', handleMessageError)

  return useCallback(
    (data: T) => {
      channelRef?.current?.postMessage(data)
    },
    [channelRef],
  )
}

function useChannelEventListener<K extends keyof BroadcastChannelEventMap>(
  channelRef: MutableRefObject<BroadcastChannel | null>,
  event: K,
  handler: (e: BroadcastChannelEventMap[K]) => void = () => {},
) {
  useEffect(() => {
    const channel = channelRef.current
    if (channel) {
      channel.addEventListener(event, handler)
      return () => channel.removeEventListener(event, handler)
    }
  }, [channelRef, event, handler])
}
