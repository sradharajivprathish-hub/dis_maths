import { useCallback, useEffect, useRef, useState } from 'react'
import type { NodeId } from '../types/graph.ts'

export type AnimationStatus = 'idle' | 'playing' | 'paused'

export interface PacketAnimationState {
  status: AnimationStatus
  progress: number
  segmentIndex: number
  liveMessage: string
}

export function usePacketAnimation(route: NodeId[] | null, speed = 1) {
  const [status, setStatus] = useState<AnimationStatus>('idle')
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const segmentCount = route && route.length > 1 ? route.length - 1 : 0

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastRef.current = null
  }, [])

  const reset = useCallback(() => {
    cancel()
    setStatus('idle')
    setProgress(0)
  }, [cancel])

  useEffect(() => {
    reset()
  }, [route, reset])

  useEffect(() => () => cancel(), [cancel])

  const play = useCallback(() => {
    if (!route || route.length < 2) return
    cancel()
    setStatus('playing')
    lastRef.current = null

    const stepMs = reducedMotion ? 600 / speed : null

    const tick = (ts: number) => {
      if (lastRef.current === null) lastRef.current = ts
      const dt = ts - lastRef.current
      lastRef.current = ts

      setProgress((p) => {
        if (reducedMotion && stepMs) {
          const nextSeg = Math.min(segmentCount, Math.floor(p * segmentCount) + 1)
          return nextSeg / segmentCount
        }
        const rate = 0.08 * speed
        const next = Math.min(1, p + (dt / 1000) * rate)
        return next
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    if (reducedMotion && stepMs) {
      let step = 0
      const interval = window.setInterval(() => {
        step++
        setProgress(step / segmentCount)
        if (step >= segmentCount) {
          window.clearInterval(interval)
          setStatus('paused')
        }
      }, stepMs)
      rafRef.current = interval as unknown as number
    } else {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [cancel, reducedMotion, route, segmentCount, speed])

  useEffect(() => {
    if (status !== 'playing' || reducedMotion) return
    if (progress >= 1) {
      cancel()
      setStatus('paused')
    }
  }, [progress, status, cancel, reducedMotion])

  const pause = useCallback(() => {
    cancel()
    setStatus('paused')
  }, [cancel])

  const segmentIndex =
    route && route.length > 1
      ? Math.min(segmentCount - 1, Math.floor(progress * segmentCount))
      : 0

  const atNode = route?.[Math.min(route.length - 1, segmentIndex)] ?? null
  const liveMessage =
    route && route.length > 1
      ? `Packet at node ${atNode ?? '—'}, step ${segmentIndex + 1} of ${segmentCount}`
      : 'No route selected for animation.'

  return {
    status,
    progress,
    segmentIndex,
    liveMessage,
    play,
    pause,
    reset,
    setStatus,
  }
}
