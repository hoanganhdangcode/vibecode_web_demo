import { useCallback, useEffect } from 'react'
import { RitualProvider, useRitual, RITUAL_PHASES } from './context/RitualContext.jsx'
import ShrineScene from './components/scene/ShrineScene.jsx'
import Instruction from './components/ui/Instruction.jsx'
import FortuneResult from './components/ui/FortuneResult.jsx'
import { useDailyFortune } from './hooks/useDailyFortune.js'
import { ensureAudio, playRevealChime } from './sounds/ritualSounds.js'

function Experience() {
  const { phase, startRitual } = useRitual()
  const { fortune, ready, canDraw, draw } = useDailyFortune()
  const showResult = ready && fortune && (!canDraw || phase === RITUAL_PHASES.RESULT)

  const onActivate = useCallback(() => {
    if (!ready || !canDraw) return
    ensureAudio()
    draw()
    startRitual()
  }, [ready, canDraw, draw, startRitual])

  useEffect(() => {
    if (phase === RITUAL_PHASES.REVEALING) playRevealChime()
  }, [phase])

  return (
    <>
      <ShrineScene interactive={canDraw} onActivate={onActivate} />
      <Instruction forceHidden={showResult} />
      <FortuneResult visible={showResult} fortune={fortune} alreadyRead={!canDraw} />
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