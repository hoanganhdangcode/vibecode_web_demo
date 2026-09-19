import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import Glow from '../effects/Glow.jsx'
import { useRitual, RITUAL_PHASES } from '../../context/RitualContext.jsx'

const STICK_COUNT = 120
const STICK_W = 0.016
const STICK_T = 0.006
const STICK_LEN = 0.68
const CYL_TOP_R = 0.22
const CYL_BOT_R = 0.19
const CYL_H = 0.55
const HIT_R = 0.35
const HIT_H = 1.05

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function FortuneJar({
  position = [0, 0, 0.15],
  interactive = true,
  onActivate,
}) {
  const group = useRef(null)
  const baseY = useRef(position[1])
  const { phase, startRitual, register } = useRitual()
  const isIdle = phase === RITUAL_PHASES.IDLE
  const usable = isIdle && interactive
  const handleActivate = onActivate || startRitual
  const [hovered, setHovered] = useState(false)
  useCursor(usable && hovered)
  const pos = Array.isArray(position) ? position : [0, 0.5, 0]

  const sticks = useMemo(() => {
    const list = []
    const up = new THREE.Vector3(0, 1, 0)
    const q = new THREE.Quaternion()
    const dir = new THREE.Vector3()
    const e = new THREE.Euler()
    for (let i = 0; i < STICK_COUNT; i++) {
      const rnd = mulberry32(i * 104729 + 7)
      const az = rnd() * Math.PI * 2
      const rad = Math.sqrt(rnd()) * 0.185
      const by = 0.46 + rnd() * 0.07
      const base = new THREE.Vector3(Math.cos(az) * rad, by, Math.sin(az) * rad)
      e.set((rnd() - 0.5) * 0.06, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.06)
      q.setFromEuler(e)
      dir.set(0, 1, 0).applyQuaternion(q)
      list.push({
        mid: base.clone().addScaledVector(dir, STICK_LEN / 2),
        quat: q.clone(),
      })
    }
    return list
  }, [])
  const inst = useRef(null)

  useEffect(() => {
    const mesh = inst.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    sticks.forEach((s, i) => {
      dummy.position.copy(s.mid)
      dummy.quaternion.copy(s.quat)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [sticks])

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const targetScale = isIdle && hovered ? 1.02 : 1
    g.scale.x += (targetScale - g.scale.x) * 0.14
    g.scale.y = g.scale.x
    g.scale.z = g.scale.x

    const floatY = isIdle ? baseY.current + Math.sin(t * 1.5) * 0.03 : baseY.current
    g.position.y += (floatY - g.position.y) * 0.1
  })

  return (
    <group
      ref={(node) => {
        group.current = node
        register('jar')(node)
      }}
      position={pos}
      onClick={usable ? handleActivate : undefined}
      onPointerOver={usable ? () => setHovered(true) : undefined}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, CYL_H / 2, 0]} castShadow>
        <cylinderGeometry args={[CYL_TOP_R, CYL_BOT_R, CYL_H, 32]} />
        <meshStandardMaterial color="#6d4526" roughness={0.78} />
      </mesh>

      <mesh position={[0, CYL_H - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[CYL_TOP_R - 0.015, 0.014, 10, 32]} />
        <meshStandardMaterial color="#4a2f18" roughness={0.9} />
      </mesh>
      <mesh position={[0, CYL_H - 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[CYL_TOP_R - 0.018, 0.011, 10, 32]} />
        <meshStandardMaterial color="#422a14" roughness={0.9} />
      </mesh>

      <instancedMesh ref={inst} args={[undefined, undefined, STICK_COUNT]}>
        <boxGeometry args={[STICK_W, STICK_LEN, STICK_T]} />
        <meshStandardMaterial color="#c0392b" roughness={0.55} />
      </instancedMesh>

      <mesh position={[0, CYL_H - 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[CYL_BOT_R + 0.015, 0.012, 10, 32]} />
        <meshStandardMaterial color="#c9a227" metalness={0.45} roughness={0.35} />
      </mesh>

      <mesh position={[0, CYL_H / 2, 0]}>
        <cylinderGeometry args={[HIT_R, HIT_R, HIT_H, 16, 1, true]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      <Glow active={usable} />
    </group>
  )
}