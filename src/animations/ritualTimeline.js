import gsap from 'gsap'
import { RITUAL_PHASES } from '../context/RitualContext.jsx'
import { playIgnitePop } from '../sounds/ritualSounds.js'

export function playRitualTimeline({ refs, camera, setPhase }) {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

  const jar = refs.jar
  const paper = refs.paper
  if (jar) {
    jar.rotation.set(0, 0, 0)
    jar.position.y = 0.5
  }
  if (paper) {
    paper.position.set(0, 0.5, -1.05)
    paper.rotation.set(0, 0, 0)
    paper.scale.setScalar(1)
  }

  tl.call(() => setPhase(RITUAL_PHASES.LIGHTING_INCENSE), [], 0)
  tl.call(() => {
    refs.ignite = true
    playIgnitePop()
  }, [], 0.1)

  const hand = refs.hand
  const incense = refs.incense
  if (hand) {
    const ix = incense ? incense.position.x : 0
    const iy = incense ? incense.position.y : 0
    const iz = incense ? incense.position.z : 0
    tl.to(hand.position, { x: ix + 0.22, y: iy + 0.85, z: iz + 0.3, duration: 0.5, ease: 'power2.inOut' }, 0.15)
      .to(hand.rotation, { z: -0.35, duration: 0.5, ease: 'power2.inOut' }, 0.15)
      .to(hand.position, { x: 2.2, y: 0.7, z: -0.4, duration: 0.55, ease: 'power2.inOut' }, 0.85)
      .to(hand.rotation, { z: 0, duration: 0.55, ease: 'power2.inOut' }, 0.85)
  }

  tl.call(() => setPhase(RITUAL_PHASES.SMOKE), [], 0.4)

  tl.call(() => setPhase(RITUAL_PHASES.SHAKE_JAR), [], 2.0)

  if (jar) {
    tl.to(jar.rotation, { z: 0.05, duration: 0.2, ease: 'power1.in' }, 1.85)
      .to(jar.position, { y: 0.06, duration: 0.3, ease: 'power2.out' }, 2.0)
      .to(
        jar.rotation,
        {
          duration: 1.5,
          ease: 'none',
          keyframes: [
            { z: 0.04 }, { z: -0.04 },
            { z: 0.09 }, { z: -0.09 },
            { z: 0.18 }, { z: -0.18 },
          ],
        },
        2.1
      )
      .to(
        jar.rotation,
        {
          duration: 1.5,
          ease: 'none',
          keyframes: [
            { y: 0.03 }, { y: -0.03 },
            { y: 0.07 }, { y: -0.07 },
            { y: 0.12 }, { y: -0.12 },
          ],
        },
        2.1
      )
      .to(jar.rotation, { z: 0, y: 0, duration: 0.1, ease: 'power4.in' }, '+=0.02')
      .to(jar.position, { y: 0, duration: 0.2, ease: 'power2.inOut' }, '<')
  }

  tl.call(() => setPhase(RITUAL_PHASES.DRAWING_FORTUNE), [], 3.7)

  if (paper) {
    tl.to(paper.position, { y: 1.5, duration: 0.45, ease: 'power2.out' }, 3.75)
      .to(paper.position, { y: 1.32, z: 0.3, duration: 0.6, ease: 'power2.inOut' }, 4.2)
      .to(paper.rotation, { x: 0.5, z: 0.22, duration: 0.6, ease: 'power2.inOut' }, 4.2)
      .to(paper.position, { y: 1.2, z: 1.55, duration: 0.75, ease: 'power3.inOut' }, 4.8)
      .to(paper.rotation, { x: -0.08, z: 0.08, duration: 0.75, ease: 'power3.inOut' }, 4.8)
  }

  tl.call(() => setPhase(RITUAL_PHASES.REVEALING), [], 5.6)

  tl.to(camera.position, { z: 4.0, y: 1.55, duration: 1.5, ease: 'power2.inOut' }, 5.7)

  if (paper) {
    tl.to(paper.position, { y: 1.35, duration: 0.3, ease: 'power2.out' }, 5.6)
      .to(paper.rotation, { x: 0, z: 0, duration: 1.0, ease: 'back.out(1.6)' }, 5.6)
      .to(paper.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.8, ease: 'back.out(2.2)' }, 5.6)
  }

  tl.call(() => {
    refs.ignite = false
    setPhase(RITUAL_PHASES.RESULT)
  }, [], 7.3)

  return tl
}