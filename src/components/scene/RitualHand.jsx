import { useRitual } from '../../context/RitualContext.jsx'
import Lighter from './Lighter.jsx'

export default function RitualHand() {
  const { register } = useRitual()

  return (
    <group ref={register('hand')} position={[2.2, 0.7, -0.4]} scale={1.3}>
      <mesh position={[0.1, -0.3, -0.05]} rotation={[0, 0, 0.25]} castShadow>
        <capsuleGeometry args={[0.11, 0.6, 6, 12]} />
        <meshStandardMaterial color="#5a4030" roughness={0.85} />
      </mesh>
      <mesh position={[0.02, 0.1, 0.03]} rotation={[-0.45, 0, -0.1]} castShadow>
        <sphereGeometry args={[0.17, 20, 16]} />
        <meshStandardMaterial color="#e8b284" roughness={0.55} />
      </mesh>
      <group position={[0.06, 0.22, 0.14]}>
        <Lighter />
      </group>
    </group>
  )
}