import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { AdaptiveDpr, OrbitControls } from '@react-three/drei'
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

function RitualDirector() {
  const { phase, setPhase, refs } = useRitual()
  const camera = useThree((state) => state.camera)
  const timeline = useRef(null)

  useEffect(() => {
    if (phase !== RITUAL_PHASES.START_RITUAL) return
    timeline.current = playRitualTimeline({ refs, camera, setPhase })
    return () => {
      if (timeline.current) {
        timeline.current.kill()
        timeline.current = null
      }
    }
  }, [phase, refs, camera, setPhase])

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