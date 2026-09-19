import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function Signboard({ width, height, depth = 0.06, position = [0, 0, 0] }) {
  const map = useTexture(`${import.meta.env.BASE_URL}textures/signboard.webp`)

  const materials = useMemo(() => {
    const wood = new THREE.MeshStandardMaterial({
      color: '#2e1208',
      roughness: 0.85,
      metalness: 0.05,
    })
    const front = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.5,
      metalness: 0.3,
      emissive: '#3d1c06',
      emissiveMap: map,
      emissiveIntensity: 0.16,
    })
    const side = new THREE.MeshStandardMaterial({
      color: '#7a4a1e',
      roughness: 0.7,
      metalness: 0.25,
    })
    return [side, side, side, side, front, wood]
  }, [map])

  return (
    <group position={position}>
      <mesh material={materials}>
        <boxGeometry args={[width, height, depth]} />
      </mesh>
    </group>
  )
}