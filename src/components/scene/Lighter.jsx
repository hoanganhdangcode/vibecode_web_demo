import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import { useRitual } from '../../context/RitualContext.jsx'

const SILVER = { color: '#c8ccd3', metalness: 0.95, roughness: 0.2 }

export default function Lighter() {
  const { refs } = useRitual()
  const flame = useRef(null)
  const light = useRef(null)
  const intensity = useRef(0)

  useFrame(() => {
    const target = refs.ignite ? 1 : 0
    intensity.current += (target - intensity.current) * 0.2
    const f = intensity.current
    const fl = flame.current
    if (fl) {
      fl.scale.set(1 + Math.random() * 0.25, 1.1 + Math.random() * 0.4, 1)
      fl.material.opacity = f * (0.8 + Math.random() * 0.2)
    }
    if (light.current) light.current.intensity = f * (0.7 + Math.random() * 0.2)
  })

  return (
    <group position={[0, 0.06, 0.08]} rotation={[0, Math.PI, 0.15]}>
      <mesh>
        <boxGeometry args={[0.055, 0.13, 0.03]} />
        <meshStandardMaterial {...SILVER} />
      </mesh>

      <mesh ref={flame} position={[0, 0.095, 0]}>
        <coneGeometry args={[0.022, 0.07, 10]} />
        <meshBasicMaterial
          color="#ffb45a"
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        ref={light}
        position={[0, 0.1, 0]}
        intensity={0}
        distance={1.6}
        decay={2}
        color="#ffb066"
      />
    </group>
  )
}