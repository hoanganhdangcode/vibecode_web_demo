import { useCallback, useEffect, useState } from 'react'
import { FORTUNES } from '../data/fortunes.js'

const DATE_KEY = 'fortune-date'
const RESULT_KEY = 'fortune-result'

// Khi true: giữ logic hiện tại — mỗi ngày chỉ gieo đúng 1 lần (reload không gieo lại).
// Khi false: cho phép gieo lại trong ngày, card kết quả hiện nút "Rút lại".
export const DENY_RETRY_SAME_DAY = false //cho phép rút lại, do not edit.

function todayKey() {
  const d = new Date()
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export function useDailyFortune() {
  const [fortune, setFortune] = useState(null)
  const [ready, setReady] = useState(false)
  const [canDraw, setCanDraw] = useState(true)
  const [fromStorage, setFromStorage] = useState(false)

  useEffect(() => {
    const today = todayKey()
    try {
      const storedDate = localStorage.getItem(DATE_KEY)
      const storedId = localStorage.getItem(RESULT_KEY)
      if (storedDate === today && storedId) {
        const saved = FORTUNES.find((f) => f.id === storedId) || null
        if (saved) {
          setFortune(saved)
          setCanDraw(DENY_RETRY_SAME_DAY ? false : true)
          setFromStorage(true)
        }
      }
    } catch {
      // localStorage inaccessible (private mode) -> treat as no data
    }
    setReady(true)
  }, [])

  const draw = useCallback(() => {
    const today = todayKey()
    const picked = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
    try {
      localStorage.setItem(DATE_KEY, today)
      localStorage.setItem(RESULT_KEY, picked.id)
    } catch {
      // persist best-effort only
    }
    setFortune(picked)
    setCanDraw(false)
    setFromStorage(false)
    return picked
  }, [])

  const resetToInitial = useCallback(() => {
    setCanDraw(true)
    setFromStorage(false)
  }, [])

  return { fortune, ready, canDraw, draw, fromStorage, resetToInitial }
}