import { useEffect, useState } from 'react'

interface UseQueueTimerReturn {
  timeLeft: number
  minutes: number
  seconds: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: (time?: number) => void
}

export function useQueueTimer(
  initialTime: number,
  onTimeout: () => void,
  startImmediately = false,
): UseQueueTimerReturn {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(startImmediately)

  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsRunning(false)
          onTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, onTimeout])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const start = () => setIsRunning(true)
  const pause = () => setIsRunning(false)
  const reset = (time?: number) => {
    setTimeLeft(time ?? initialTime)
    setIsRunning(false)
  }

  return {
    timeLeft,
    minutes,
    seconds,
    isRunning,
    start,
    pause,
    reset,
  }
}
