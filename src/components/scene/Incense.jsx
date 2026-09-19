import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import Smoke from './Smoke.jsx'
import { useRitual, RITUAL_PHASES } from '../../context/RitualContext.jsx'

const STICK_X = [-0.07, 0, 0.07]
const TIP_Y = 1.02

export default function Incense({ position = [0, 0, 1.05] }) {
  const { refs, phase, register } = useRitual()
  const shown =
    phase === RITUAL_PHASES.START_RITUAL ||
    phase === RITUAL_PHASES.LIGHTING_INCENSE ||
    phase === RITUAL_PHASES.SMOKE
  const flameRefs = useRef([])
  const lightRefs = useRef([])
  const tipRefs = useRef([])
  const ignited = useRef(0)

  useFrame(() => {
    const target = refs.ignite ? 1 : 0
    ignited.current += (target - ignited.current) * 0.12
    const f = ignited.current

    flameRefs.current.forEach((flame, i) => {
      if (!flame) return
      const light = lightRefs.current[i]
      const flick = 0.85 + Math.random() * 0.4
      flame.scale.set(flick, 1.05 + Math.random() * 0.35, flick)
      flame.material.opacity = f * (0.75 + Math.random() * 0.25)
      if (light) light.intensity = f * (0.6 + Math.random() * 0.3)
    })

    tipRefs.current.forEach((tip) => {
      if (!tip) return
      tip.material.emissiveIntensity = 0.15 + f * 1.35
    })
  })

  return (
    <group ref={register('incense')} position={position}>
      {STICK_X.map((x, i) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 1, 8]} />
            <meshStandardMaterial color="#8a6240" roughness={0.9} />
          </mesh>

          <mesh ref={(n) => (tipRefs.current[i] = n)} position={[0, TIP_Y, 0]}>
            <sphereGeometry args={[0.02, 10, 10]} />
            <meshStandardMaterial
              color="#ff8c2e"
              emissive="#ff5a00"
              emissiveIntensity={0.15}
            />
          </mesh>

          <mesh
            ref={(n) => (flameRefs.current[i] = n)}
            position={[0, TIP_Y + 0.1, 0]}
          >
            <coneGeometry args={[0.03, 0.16, 12]} />
            <meshBasicMaterial
              color="#ff9a3a"
              transparent
              opacity={0}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          <pointLight
            ref={(n) => (lightRefs.current[i] = n)}
            position={[0, TIP_Y + 0.12, 0]}
            intensity={0}
            distance={2.4}
            decay={2}
            color="#ff8c2e"
          />

          <Smoke position={[0, TIP_Y, 0]} />
        </group>
      ))}
    </group>
  )
}