import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";

export function useBroadcastChannel<T = string>(
  channelName: string,
  handleMessage?: (event: MessageEvent) => void,
  handleMessageError?: (event: MessageEvent) => void,
): (data: T) => void {
  const channelRef = useRef(
    typeof window !== "undefined" && "BroadcastChannel" in window
      ? new BroadcastChannel(`${channelName}-channel`)
      : null,
  );

  useChannelEventListener(channelRef, "message", handleMessage);
  useChannelEventListener(channelRef, "messageerror", handleMessageError);

  return useCallback((data: T) => {
    channelRef?.current?.postMessage(data);
  }, []);
}

function useChannelEventListener<K extends keyof BroadcastChannelEventMap>(
  channelRef: RefObject<BroadcastChannel | null>,
  event: K,
  handler: (e: BroadcastChannelEventMap[K]) => void = () => {},
) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const channel = channelRef.current;
    if (channel) {
      channel.addEventListener(event, handler);
      return () => channel.removeEventListener(event, handler);
    }
  }, [event, handler]);
}
