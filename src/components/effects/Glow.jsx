import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide } from 'three'
import { useRitual, RITUAL_PHASES } from '../../context/RitualContext.jsx'

const PULSE_SPEED = 2.2

export default function Glow({ active: propActive }) {
  const ringRef = useRef(null)
  const haloRef = useRef(null)
  const ringMat = useRef(null)
  const haloMat = useRef(null)
  const factor = useRef(0)
  const { phase } = useRitual()
  const active = propActive !== undefined ? propActive : phase === RITUAL_PHASES.IDLE

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const target = active ? 1 : 0
    factor.current += (target - factor.current) * 0.08
    const f = factor.current
    const pulse = f * ((Math.sin(t * PULSE_SPEED) + 1) / 2)

    if (ringRef.current) {
      ringRef.current.scale.set(1 + pulse * 0.05, 1 + pulse * 0.05, 1)
      ringMat.current.opacity = (0.35 + pulse * 0.3) * f
    }
    if (haloRef.current) {
      haloMat.current.opacity = (0.08 + pulse * 0.05) * f
    }
  })

  return (
    <group>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <torusGeometry args={[0.52, 0.02, 12, 48]} />
        <meshBasicMaterial ref={ringMat} color="#ffd27a" transparent opacity={0.4} />
      </mesh>
      <mesh ref={haloRef} position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.45, 0.52, 0.98, 24, 1, true]} />
        <meshBasicMaterial
          ref={haloMat}
          color="#ffb266"
          transparent
          opacity={0.1}
          depthWrite={false}
          side={DoubleSide}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  )
}