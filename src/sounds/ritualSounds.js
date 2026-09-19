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

export function playRevealChime() {
  const c = getCtx()
  if (!c) return
  try {
    const now = c.currentTime
    const notes = [880, 1108.73, 1318.51]
    notes.forEach((freq, i) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      const at = now + i * 0.06
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.linearRampToValueAtTime(0.05, at + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.5)
      osc.connect(gain)
      gain.connect(c.destination)
      osc.start(at)
      osc.stop(at + 1.6)
    })
  } catch {
    // audio is best-effort
  }
}