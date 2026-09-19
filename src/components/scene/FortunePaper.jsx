import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'
import { useRitual, RITUAL_PHASES } from '../../context/RitualContext.jsx'

export default function FortunePaper({ position = [0, 1.06, 0.16] }) {
  const { register, phase } = useRitual()
  const bob = useRef(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const result = phase === RITUAL_PHASES.RESULT

    if (bob.current) {
      const targetY = result ? Math.sin(t * 1.1) * 0.02 : 0
      bob.current.position.y += (targetY - bob.current.position.y) * 0.08
      const targetZ = result ? Math.sin(t * 0.7) * 0.04 : 0
      bob.current.rotation.z += (targetZ - bob.current.rotation.z) * 0.08
    }
  })

  return (
    <group ref={register('paper')} position={position}>
      <group ref={bob}>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.1, 0.52, 0.014]} />
          <meshStandardMaterial color="#a32a20" roughness={0.7} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}