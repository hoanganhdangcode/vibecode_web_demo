let ctx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

export function ensureAudio() {
  getCtx()
}

export function playIgnitePop() {
  const c = getCtx()
  if (!c) return
  try {
    const now = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(170, now)
    osc.frequency.exponentialRampToValueAtTime(62, now + 0.18)
    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(now)
    osc.stop(now + 0.25)
  } catch {
    // audio is best-effort
  }
}

function makeImpulse(c, seconds, decay) {
  const rate = c.sampleRate
  const len = Math.floor(rate * seconds)
  const impulse = c.createBuffer(2, len, rate)
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
  }
  return impulse
}

export function playRevealChime() {
  const c = getCtx()
  if (!c) return
  try {
    const now = c.currentTime
    const f0 = 196
    const partials = [
      { r: 1.0, a: 1.0, d: 3.8 },
      { r: 2.05, a: 0.5, d: 2.6 },
      { r: 2.65, a: 0.3, d: 2.1 },
      { r: 3.43, a: 0.19, d: 1.6 },
      { r: 4.32, a: 0.13, d: 1.2 },
      { r: 5.62, a: 0.08, d: 0.9 },
    ]

    const wet = c.createGain()
    wet.gain.value = 0.45
    const conv = c.createConvolver()
    conv.buffer = makeImpulse(c, 3.4, 1.8)
    wet.connect(conv)
    conv.connect(c.destination)

    partials.forEach((p) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = f0 * p.r
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(p.a * 0.16, now + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.d)
      osc.connect(gain)
      gain.connect(c.destination)
      gain.connect(wet)
      osc.start(now)
      osc.stop(now + p.d + 0.1)
    })

    const noiseLen = 0.045
    const buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * noiseLen)), c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2)
    }
    const src = c.createBufferSource()
    src.buffer = buffer
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1100
    const nGain = c.createGain()
    nGain.gain.value = 0.06
    src.connect(filter)
    filter.connect(nGain)
    nGain.connect(c.destination)
    nGain.connect(wet)
    src.start(now, 0, noiseLen)
  } catch {
    // audio is best-effort
  }
}