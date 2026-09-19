import { useEffect, useMemo, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = '/models/truongcongl.glb'

export default function Shrine({
  height = 4.2,
  z = -3.4,
  rotateY = 0,
  castShadow = false,
}) {
  const group = useRef(null)
  const [ready, setReady] = useState(false)
  const { scene } = useGLTF(MODEL_URL)

  const model = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    const g = group.current
    if (!g) return
    model.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const scale = height / size.y
    g.scale.setScalar(scale)
    g.rotation.y = rotateY * Math.PI
    g.position.set(0, -box.min.y * scale, z - (box.min.z + size.z / 2) * scale)
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = castShadow
        obj.receiveShadow = false
      }
    })
    setReady(true)
  }, [model, height, z, rotateY, castShadow])

  return (
    <group ref={group} visible={ready}>
      <primitive object={model} />
      <pointLight
        position={[0, 2.4, -1.6]}
        intensity={0.45}
        distance={5}
        decay={2}
        color="#ff9a4a"
      />
    </group>
  )
}