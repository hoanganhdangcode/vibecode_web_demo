import { useRitual, RITUAL_PHASES } from '../../context/RitualContext.jsx'

export default function Instruction({ forceHidden = false }) {
  const { phase } = useRitual()
  const visible = phase === RITUAL_PHASES.IDLE && !forceHidden

  return (
    <div className={`instruction ${visible ? 'visible' : ''}`} aria-hidden={!visible}>
      <span className="instruction-star">✦</span>
      Click gieo quẻ
      <span className="instruction-star">✦</span>
    </div>
  )
}