import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

export const RITUAL_PHASES = Object.freeze({
  IDLE: 'idle',
  START_RITUAL: 'start-ritual',
  LIGHTING_INCENSE: 'lighting-incense',
  SMOKE: 'smoke',
  SHAKE_JAR: 'shake-jar',
  DRAWING_FORTUNE: 'drawing-fortune',
  REVEALING: 'revealing',
  RESULT: 'result',
})

const RitualContext = createContext(null)

export function RitualProvider({ children }) {
  const [phase, setPhase] = useState(RITUAL_PHASES.IDLE)
  const refs = useRef({ ignite: false }).current

  const startRitual = useCallback(() => {
    setPhase((current) =>
      current === RITUAL_PHASES.IDLE ? RITUAL_PHASES.START_RITUAL : current
    )
  }, [])

  const register = useCallback((name) => (node) => {
    refs[name] = node
  }, [])

  const value = useMemo(
    () => ({ phase, setPhase, startRitual, refs, register }),
    [phase, refs, register, startRitual]
  )

  return <RitualContext.Provider value={value}>{children}</RitualContext.Provider>
}

export function useRitual() {
  const ctx = useContext(RitualContext)
  if (!ctx) throw new Error('useRitual must be used within a RitualProvider')
  return ctx
}