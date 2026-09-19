import { useEffect, useMemo, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import Signboard from './Signboard.jsx'

const MODEL_URL = '/models/truongcongl.glb'

export default function Shrine({
  height = 4.2,
  z = -3.4,
  rotateY = 0,
  castShadow = false,
  onBox = null,
  signVisible = true,
  signX0 = 0.09,
  signX1 = 0.91,
  signY0 = 0.58,
  signY1 = 0.79,
  signRecess = 1.345,
  signDepth = 0.08,
}) {
  const group = useRef(null)
  const [ready, setReady] = useState(false)
  const [sign, setSign] = useState({})
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
setSign({
      position: [
        0,
        (((signY0 + signY1) / 2) * height - g.position.y) / scale,
        (g.position.z + box.max.z * scale - signRecess - signDepth / 2 - g.position.z) /
          scale,
      ],
      w: ((signX1 - signX0) * size.x * scale) / scale,
      h: ((signY1 - signY0) * size.y * scale) / scale,
      d: signDepth / scale,
    })
    if (onBox) {
      onBox({
        min: new THREE.Vector3(
          box.min.x * scale + g.position.x,
          box.min.y * scale + g.position.y,
          box.min.z * scale + g.position.z
        ),
        max: new THREE.Vector3(
          box.max.x * scale + g.position.x,
          box.max.y * scale + g.position.y,
          box.max.z * scale + g.position.z
        ),
      })
    }
    setReady(true)
  }, [model, height, z, rotateY, castShadow, signX0, signX1, signY0, signY1, signRecess, signDepth, onBox])

  return (
    <group ref={group} visible={ready}>
      <primitive object={model} />
      {signVisible && ready && (
        <Signboard position={sign.position} width={sign.w} height={sign.h} depth={sign.d} />
      )}
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