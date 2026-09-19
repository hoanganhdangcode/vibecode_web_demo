import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { AdaptiveDpr, OrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import Shrine from './Shrine.jsx'
import FortuneJar from './FortuneJar.jsx'
import Incense from './Incense.jsx'
import FortunePaper from './FortunePaper.jsx'
import RitualHand from './RitualHand.jsx'
import Atmosphere from '../effects/Atmosphere.jsx'
import { playRitualTimeline } from '../../animations/ritualTimeline.js'
import { useRitual, RITUAL_PHASES } from '../../context/RitualContext.jsx'

const INCENSE_Y = 0.12
const INCENSE_Z_FRONT = -1.2

const INITIAL_CAMERA = { x: 0, y: 1.7, z: 4.6 }
const INITIAL_TARGET = [0, 1.3, 0]

function RitualDirector() {
  const { phase, setPhase, refs } = useRitual()
  const camera = useThree((state) => state.camera)
  const timeline = useRef(null)

  useEffect(() => {
    if (phase !== RITUAL_PHASES.START_RITUAL) return
    if (timeline.current && timeline.current.isActive()) return
    if (timeline.current) {
      timeline.current.kill()
      timeline.current = null
    }
    timeline.current = playRitualTimeline({ refs, camera, setPhase })
  }, [phase, refs, camera, setPhase])

  useEffect(
    () => () => {
      if (timeline.current) {
        timeline.current.kill()
        timeline.current = null
      }
    },
    []
  )

  return null
}

function RitualResetDirector() {
  const { phase, refs } = useRitual()
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls)
  const prevPhase = useRef(RITUAL_PHASES.IDLE)
  const tween = useRef(null)

  useEffect(() => {
    const prev = prevPhase.current
    prevPhase.current = phase
    if (phase !== RITUAL_PHASES.IDLE || prev !== RITUAL_PHASES.RESULT) return
    if (tween.current) {
      tween.current.kill()
      tween.current = null
    }
    if (controls) controls.enabled = false
    const tw = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
    tw.to(camera.position, INITIAL_CAMERA, 0)
    const paper = refs.paper
    if (paper) {
      tw.to(paper.position, { x: 0, y: 0.5, z: -1.05, duration: 1.2 }, 0)
      tw.to(paper.rotation, { x: 0, y: 0, z: 0, duration: 0.9 }, 0)
      tw.to(paper.scale, { x: 1, y: 1, z: 1, duration: 0.9 }, 0)
    }
    const hand = refs.hand
    if (hand) {
      tw.to(hand.position, { x: 2.2, y: 0.7, z: -0.4, duration: 1.2 }, 0)
      tw.to(hand.rotation, { z: 0, duration: 1.2 }, 0)
    }
    tw.call(() => {
      if (controls) {
        controls.target.set(...INITIAL_TARGET)
        controls.enabled = true
        controls.update()
      }
    })
    tween.current = tw
    return () => {
      if (tween.current) {
        tween.current.kill()
        tween.current = null
      }
      if (controls) controls.enabled = true
    }
  }, [phase, camera, controls, refs])

  return null
}

export default function ShrineScene({ interactive = true, onActivate }) {
  const { phase } = useRitual()
  const isIdle = phase === RITUAL_PHASES.IDLE
  const isResult = phase === RITUAL_PHASES.RESULT
  const orbitEnabled = isIdle || isResult
  const [shrineBox, setShrineBox] = useState(null)

  const incensePos = useMemo(() => {
    if (!shrineBox) return null
    const h = shrineBox.max.y - shrineBox.min.y
    return [0, shrineBox.min.y + INCENSE_Y * h, shrineBox.max.z + INCENSE_Z_FRONT]
  }, [shrineBox])

  return (
    <Canvas
      camera={{ position: [0, 1.7, 4.6], fov: 50 }}
      shadows
      dpr={[1, 1.75]}
    >
      <color attach="background" args={['#120a06']} />
      <fog attach="fog" args={['#120a06', 5, 16]} />

      <ambientLight intensity={0.32} />
      <directionalLight
        position={[-4, 5, -3]}
        intensity={0.22}
        color="#aeb8ff"
      />
      <directionalLight position={[2, 4, 3]} intensity={0.45} color="#ffd9a0" />
      <pointLight
        position={[0, 1.6, 3]}
        intensity={0.25}
        distance={6}
        color="#ffb066"
      />

      <group position={[0, 2.4, -1.05]}>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 1.8]} />
          <meshStandardMaterial color="#3a2414" />
        </mesh>
        <mesh position={[0, -0.28, 0]} castShadow>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial
            color="#ffd9a0"
            emissive="#ffb066"
            emissiveIntensity={1.6}
          />
        </mesh>
        <pointLight
          position={[0, 1.6, 3]}
          intensity={0.25}
          distance={6}
          color="#ffb066"
        />

        <group position={[0, 2.6, -1.05]}>
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 2.2]} />
            <meshStandardMaterial color="#3a2414" />
          </mesh>
          <mesh position={[0, -0.08, 0]} castShadow>
            <sphereGeometry args={[0.14, 24, 24]} />
            <meshStandardMaterial
              color="#ffd9a0"
              emissive="#ffb066"
              emissiveIntensity={1.8}
            />
          </mesh>
          <pointLight
            position={[0, -0.35, 0]}
            intensity={0.8}
            distance={4}
            color="#ffd27a"
          />
        </group>

      </group>

      <Atmosphere />
      <Suspense fallback={null}>
        <Shrine onBox={setShrineBox} />
      </Suspense>
      <FortuneJar position={[0, 0.5, -1.05]} interactive={interactive} onActivate={onActivate} />
      {incensePos && <Incense position={incensePos} />}
      <FortunePaper position={[0, 0.5, -1.05]} />
      <RitualHand />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[3.6, 48]} />
        <meshStandardMaterial color="#2a1a10" roughness={1} />
      </mesh>

      <RitualDirector />
      <RitualResetDirector />
      <AdaptiveDpr pixelated />

      <OrbitControls
        makeDefault
        enabled={orbitEnabled}
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.3, 0]}
      />
    </Canvas>
  )
}