import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide } from 'three'
import { useRitual, RITUAL_PHASES } from '../../context/RitualContext.jsx'

export default function FortunePaper({ position = [0, 1.06, 0.16] }) {
  const { register, phase } = useRitual()
  const bob = useRef(null)
  const flash = useRef(null)
  const flashMat = useRef(null)
  const opacity = useRef(0)
  const scale = useRef(1)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const result = phase === RITUAL_PHASES.RESULT

    if (bob.current) {
      const targetY = result ? Math.sin(t * 1.1) * 0.02 : 0
      bob.current.position.y += (targetY - bob.current.position.y) * 0.08
      const targetZ = result ? Math.sin(t * 0.7) * 0.04 : 0
      bob.current.rotation.z += (targetZ - bob.current.rotation.z) * 0.08
    }

    const f = flash.current
    const m = flashMat.current
    if (!f || !m) return
    const targetOpacity =
      phase === RITUAL_PHASES.REVEALING ? 0.55 + 0.25 * Math.sin(t * 7) : 0
    opacity.current += (targetOpacity - opacity.current) * 0.1
    m.opacity = opacity.current
    const targetScale =
      phase === RITUAL_PHASES.REVEALING ? 1 + 0.16 * Math.sin(t * 3.2) : 1
    scale.current += (targetScale - scale.current) * 0.1
    f.scale.setScalar(scale.current)
  })

  return (
    <group ref={register('paper')} position={position}>
      <group ref={bob}>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.1, 0.52, 0.014]} />
          <meshStandardMaterial color="#a32a20" roughness={0.7} side={DoubleSide} />
        </mesh>
        <mesh ref={flash} position={[0, 0.22, -0.09]}>
          <planeGeometry args={[0.75, 1.5]} />
          <meshBasicMaterial
            ref={flashMat}
            color="#ffcf8a"
            transparent
            opacity={0}
            depthWrite={false}
            side={DoubleSide}
            blending={AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  )
}