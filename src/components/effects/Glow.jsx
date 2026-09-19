import { Sparkles } from '@react-three/drei'
import { useRitual, RITUAL_PHASES } from '../../context/RitualContext.jsx'

export default function Glow({ active: propActive }) {
  const { phase } = useRitual()
  const active = propActive !== undefined ? propActive : phase === RITUAL_PHASES.IDLE

  if (!active) return null

  return (
    <group>
      <Sparkles
        count={90}
        scale={[0.85, 1.9, 0.85]}
        size={0.04}
        speed={0.35}
        opacity={0.55}
        color="#ffd987"
        noise={0.6}
      />
      <Sparkles
        count={28}
        scale={[0.42, 1.25, 0.42]}
        size={0.07}
        speed={0.5}
        opacity={0.4}
        color="#fff2c2"
      />
    </group>
  )
}