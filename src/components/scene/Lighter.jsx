import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { AdditiveBlending } from 'three'
import { useRitual } from '../../context/RitualContext.jsx'

const BRUSHED = { color: '#c8ccd3', metalness: 0.85, roughness: 0.32 }

export default function Lighter() {
  const { refs } = useRitual()
  const wheel = {
    ref: null,
    rot: 0,
  }
  const flame = useRef(null)
  const light = useRef(null)
  const intensity = useRef(0)

  useFrame((_, delta) => {
    const w = wheel.ref
    if (w) {
      wheel.rot += delta * 2.2
      w.rotation.z = wheel.rot
    }
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
    <group position={[0, 0.05, 0.09]} rotation={[0, 0.18, -0.12]}>
      <RoundedBox args={[0.048, 0.075, 0.018]} radius={0.006} smoothness={6}>
        <meshStandardMaterial {...BRUSHED} />
      </RoundedBox>

      <RoundedBox
        args={[0.047, 0.006, 0.017]}
        radius={0.002}
        smoothness={4}
        position={[0, 0.004, 0]}
      >
        <meshStandardMaterial color="#aab0b8" metalness={0.7} roughness={0.4} />
      </RoundedBox>

      <group position={[0, 0.0445, -0.005]} rotation={[0.42, 0, 0]}>
        <RoundedBox args={[0.046, 0.022, 0.016]} radius={0.004} smoothness={4}>
          <meshStandardMaterial color="#b6bbc3" metalness={0.9} roughness={0.3} />
        </RoundedBox>
      </group>

      <mesh position={[0, 0.043, 0.002]}>
        <cylinderGeometry args={[0.009, 0.009, 0.024, 16]} />
        <meshStandardMaterial color="#9aa0a8" metalness={0.9} roughness={0.28} />
      </mesh>

      <mesh
        ref={(n) => (wheel.ref = n)}
        position={[0, 0.054, 0.002]}
        rotation={[Math.PI / 2, Math.PI / 2, 0]}
      >
        <cylinderGeometry args={[0.0055, 0.0055, 0.026, 12]} />
        <meshStandardMaterial color="#7c8289" metalness={0.95} roughness={0.2} />
      </mesh>

      <mesh ref={flame} position={[0, 0.065, -0.002]}>
        <coneGeometry args={[0.02, 0.06, 10]} />
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
        position={[0, 0.07, 0]}
        intensity={0}
        distance={1.6}
        decay={2}
        color="#ffb066"
      />
    </group>
  )
}