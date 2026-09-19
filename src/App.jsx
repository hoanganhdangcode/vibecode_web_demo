import { useCallback, useEffect } from 'react'
import { RitualProvider, useRitual, RITUAL_PHASES } from './context/RitualContext.jsx'
import ShrineScene from './components/scene/ShrineScene.jsx'
import Instruction from './components/ui/Instruction.jsx'
import FortuneResult from './components/ui/FortuneResult.jsx'
import LoadingScreen from './components/ui/LoadingScreen.jsx'
import { useDailyFortune } from './hooks/useDailyFortune.js'
import { useConfig } from './hooks/useConfig.js'
import { ensureAudio, playRevealChime } from './sounds/ritualSounds.js'

function Experience() {
  const { phase, startRitual, resetRitual } = useRitual()
  const { config } = useConfig()
  const { fortune, ready, canDraw, draw, fromStorage, resetToInitial } = useDailyFortune()
  const showResult =
    ready && fortune && (fromStorage || phase === RITUAL_PHASES.RESULT)

  const onActivate = useCallback(() => {
    if (!ready || !canDraw) return
    ensureAudio()
    draw()
    startRitual()
  }, [ready, canDraw, draw, startRitual])

  const onReset = useCallback(() => {
    if (!ready) return
    if (phase !== RITUAL_PHASES.IDLE && phase !== RITUAL_PHASES.RESULT) return
    resetToInitial()
    resetRitual()
  }, [ready, phase, resetToInitial, resetRitual])

  useEffect(() => {
    if (phase === RITUAL_PHASES.REVEALING) playRevealChime()
  }, [phase])

  return (
    <>
      <ShrineScene interactive={canDraw} onActivate={onActivate} />
      <LoadingScreen />
      <Instruction forceHidden={showResult} />
      <FortuneResult
        visible={showResult}
        fortune={fortune}
        alreadyRead={fromStorage}
        onReset={config.DENY_RETRY_SAME_DAY ? undefined : onReset}
      />
    </>
  )
}

export default function App() {
  return (
    <RitualProvider>
      <Experience />
    </RitualProvider>
  )
}