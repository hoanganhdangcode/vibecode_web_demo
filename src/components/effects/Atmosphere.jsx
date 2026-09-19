import { Sparkles } from '@react-three/drei'

const IS_MOBILE =
  typeof window !== 'undefined' && window.innerWidth < 768

export default function Atmosphere() {
  return (
    <group>
      <Sparkles
        count={IS_MOBILE ? 22 : 70}
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