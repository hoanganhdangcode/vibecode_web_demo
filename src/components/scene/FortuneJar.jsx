import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import Glow from '../effects/Glow.jsx'
import { useRitual, RITUAL_PHASES } from '../../context/RitualContext.jsx'

export default function FortuneJar({
  position = [0, 0, 0.15],
  interactive = true,
  onActivate,
}) {
  const group = useRef(null)
  const baseY = useRef(position[1])
  const { phase, startRitual, register } = useRitual()
  const isIdle = phase === RITUAL_PHASES.IDLE
  const usable = isIdle && interactive
  const handleActivate = onActivate || startRitual
  const [hovered, setHovered] = useState(false)
  useCursor(usable && hovered)
  const pos = Array.isArray(position) ? position : [0, 0.5, 0]

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const targetScale = isIdle && hovered ? 1.02 : 1
    g.scale.x += (targetScale - g.scale.x) * 0.14
    g.scale.y = g.scale.x
    g.scale.z = g.scale.x

    const floatY = isIdle ? baseY.current + Math.sin(t * 1.5) * 0.03 : baseY.current
    g.position.y += (floatY - g.position.y) * 0.1
  })

  return (
    <group
      ref={(node) => {
        group.current = node
        register('jar')(node)
      }}
      position={pos}
      onClick={usable ? handleActivate : undefined}
      onPointerOver={usable ? () => setHovered(true) : undefined}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.22, 0.9, 28]} />
        <meshStandardMaterial color="#8a1f1f" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <torusGeometry args={[0.31, 0.035, 12, 28]} />
        <meshStandardMaterial color="#c9a227" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.18, 24, 16]} />
        <meshStandardMaterial color="#c9a227" metalness={0.5} roughness={0.35} />
      </mesh>
      <Glow active={usable} />
    </group>
  )
}