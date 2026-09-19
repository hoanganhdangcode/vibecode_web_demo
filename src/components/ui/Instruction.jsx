import { useRitual, RITUAL_PHASES } from '../../context/RitualContext.jsx'

export default function Instruction({ forceHidden = false }) {
  const { phase } = useRitual()
  const lighting =
    phase === RITUAL_PHASES.START_RITUAL ||
    phase === RITUAL_PHASES.LIGHTING_INCENSE ||
    phase === RITUAL_PHASES.SMOKE
  const idle = phase === RITUAL_PHASES.IDLE
  const visible = (idle || lighting) && !forceHidden
  const text = lighting ? 'Đang thắp hương' : 'Click hũ quẻ để gieo quẻ'

  return (
    <div className={`instruction ${visible ? 'visible' : ''}`} aria-hidden={!visible}>
      {/* <span className="instruction-star">✦</span> */}
      {text}
      {/* <span className="instruction-star">✦</span> */}
    </div>
  )
}