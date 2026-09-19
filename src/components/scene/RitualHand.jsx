import { useRitual } from '../../context/RitualContext.jsx'
import Lighter from './Lighter.jsx'

export default function RitualHand() {
  const { register } = useRitual()

  return (
    <group ref={register('hand')} position={[2.2, 0.7, -0.4]}>
      <mesh position={[0.06, -0.28, 0]} rotation={[0, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.09, 0.9, 8, 12]} />
        <meshStandardMaterial color="#3a2418" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.1, 0.02]} rotation={[-0.4, 0, -0.15]} castShadow>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#d9a06b" roughness={0.7} />
      </mesh>
      <Lighter />
    </group>
  )
}