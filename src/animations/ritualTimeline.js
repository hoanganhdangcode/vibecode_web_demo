import gsap from 'gsap'
import { RITUAL_PHASES } from '../context/RitualContext.jsx'
import { playIgnitePop } from '../sounds/ritualSounds.js'

const HAND_IN = { x: 0.45, y: 0.95, z: -1.3 }
const HAND_OUT = { x: 2.6, y: 0.7, z: -0.4 }
const ROT_IN = { y: -0.5, z: 0.35 }

export function playRitualTimeline({ refs, camera, setPhase }) {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

  tl.to(camera.position, {
    x: 0,
    y: 1.6,
    z: 4.25,
    duration: 2.4,
    ease: 'power1.inOut',
  }, 0)

  tl.call(() => setPhase(RITUAL_PHASES.LIGHTING_INCENSE), [], 0.7)

  const hand = refs.hand
  if (hand) {
    tl.to(hand.position, { ...HAND_IN, duration: 1.1, ease: 'power2.in' }, 0.9)
      .to(hand.rotation, { ...ROT_IN, duration: 1.1, ease: 'power2.in' }, 0.9)
      .call(() => {
        refs.ignite = true
        playIgnitePop()
      }, [], 2.0)
      .to({}, { duration: 0.7 })
      .to(hand.position, { ...HAND_OUT, duration: 0.9, ease: 'power2.out' }, '+=0')
      .to(hand.rotation, { y: 0, z: 0, duration: 0.9 }, '<')
  } else {
    tl.call(() => {
      refs.ignite = true
    }, [], 1.2)
  }

  tl.call(() => setPhase(RITUAL_PHASES.SMOKE), [], 3.7)

  tl.call(() => setPhase(RITUAL_PHASES.SHAKE_JAR), [], 4.5)

  const jar = refs.jar
  if (jar) {
    tl.to(jar.rotation, { z: 0.05, duration: 0.28, ease: 'power1.in' }, 4.22)
      .to(jar.position, { y: 0.06, duration: 0.35, ease: 'power2.out' }, 4.5)
      .to(
        jar.rotation,
        {
          duration: 2.3,
          ease: 'none',
          keyframes: [
            { z: 0.04 }, { z: -0.04 },
            { z: 0.08 }, { z: -0.08 },
            { z: 0.16 }, { z: -0.16 },
            { z: 0.24 }, { z: -0.24 },
          ],
        },
        4.85
      )
      .to(
        jar.rotation,
        {
          duration: 2.3,
          ease: 'none',
          keyframes: [
            { y: 0.03 }, { y: -0.03 },
            { y: 0.06 }, { y: -0.06 },
            { y: 0.1 }, { y: -0.1 },
            { y: 0.14 }, { y: -0.14 },
          ],
        },
        4.85
      )
      .to(jar.rotation, { z: 0, y: 0, duration: 0.1, ease: 'power4.in' }, '+=0.05')
      .to(jar.position, { y: 0, duration: 0.22, ease: 'power2.inOut' }, '<');
  }

  tl.call(() => setPhase(RITUAL_PHASES.DRAWING_FORTUNE), [], 7.45)

  const paper = refs.paper
  if (paper) {
    tl.to(paper.position, { y: 1.5, duration: 0.5, ease: 'power2.out' }, 7.5)
      .to(paper.position, { y: 1.32, z: 0.3, duration: 0.7, ease: 'power2.inOut' }, 8.0)
      .to(paper.rotation, { x: 0.5, z: 0.22, duration: 0.7, ease: 'power2.inOut' }, 8.0)
      .to(paper.position, { y: 1.2, z: 1.55, duration: 0.75, ease: 'power3.inOut' }, 8.7)
      .to(paper.rotation, { x: -0.08, z: 0.08, duration: 0.75, ease: 'power3.inOut' }, 8.7)
  }

  tl.call(() => setPhase(RITUAL_PHASES.REVEALING), [], 9.5)

  tl.to(camera.position, { z: 4.0, y: 1.55, duration: 1.6, ease: 'power2.inOut' }, 9.6)

  if (paper) {
    tl.to(paper.position, { y: 1.35, duration: 0.3, ease: 'power2.out' }, 9.5)
      .to(paper.rotation, { x: 0, z: 0, duration: 1.0, ease: 'back.out(1.6)' }, 9.5)
      .to(paper.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.8, ease: 'back.out(2.2)' }, 9.5)
  }

  tl.call(() => setPhase(RITUAL_PHASES.RESULT), [], 10.65)

  return tl
}