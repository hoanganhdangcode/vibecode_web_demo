import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRitual } from '../../context/RitualContext.jsx'

const IS_MOBILE =
  typeof window !== 'undefined' && window.innerWidth < 768
const COUNT = IS_MOBILE ? 16 : 30
const P_LIFE = 3.2

const VERTEX = `
attribute float aPhase;
attribute float aSeed;
uniform float uTime;
uniform float uEmit;
varying float vAlpha;
void main() {
  float life = ${P_LIFE.toFixed(1)};
  float cycle = mod(uTime + aPhase * life, life);
  float tp = cycle / life;
  vec3 p = position;
  p.y += tp * 1.15;
  p.x += sin(uTime * 1.3 + aSeed * 6.2832) * 0.09 * tp;
  p.z += cos(uTime * 0.9 + aSeed * 6.2832) * 0.06 * tp;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float pSize = (0.05 + tp * 0.3) * uEmit;
  pSize *= 340.0 / max(1.0, -mv.z);
  gl_PointSize = pSize;
  vAlpha = sin(tp * 3.14159) * 0.4 * uEmit;
}
`

const FRAGMENT = `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float d = length(uv);
  float a = smoothstep(0.5, 0.05, d) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor, a);
}
`

export default function Smoke({ position = [0, 0, 0] }) {
  const { refs } = useRitual()
  const emit = useRef(0)
  const matRef = useRef(null)

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const aPhase = new Float32Array(COUNT)
    const aSeed = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.05
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.05
      aPhase[i] = Math.random()
      aSeed[i] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1))
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uEmit: { value: 0 },
          uColor: { value: new THREE.Color('#bfae97') },
        },
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
      }),
    []
  )

  useEffect(() => {
    matRef.current = material
    material.uniforms.uEmit.value = 0
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((state) => {
    const target = refs.ignite ? 1 : 0
    emit.current += (target - emit.current) * 0.08
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uEmit.value = emit.current
  })

  return (
    <points geometry={geometry} material={material} position={position} frustumCulled={false} />
  )
}