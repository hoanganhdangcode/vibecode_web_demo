import { Sparkles } from '@react-three/drei'

export default function Atmosphere() {
  return (
    <group>
      <Sparkles
        count={70}
        scale={[6, 3, 6]}
        size={1.2}
        speed={0.15}
        opacity={0.25}
        color="#ffcf9a"
        position={[0, 1.5, 0]}
      />
    </group>
  )
}