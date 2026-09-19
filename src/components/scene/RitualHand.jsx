import { useRitual } from '../../context/RitualContext.jsx'
import Lighter from './Lighter.jsx'

export default function RitualHand() {
  const { register } = useRitual()

  return (
    <group ref={register('hand')} position={[2.2, 0.7, -0.4]} scale={1.3}>
      <Lighter />
    </group>
  )
}