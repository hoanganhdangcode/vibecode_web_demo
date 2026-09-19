import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

export default function LoadingScreen() {
  const { active, progress } = useProgress()
  const [hidden, setHidden] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (active) {
      started.current = true
      return
    }
    if (!started.current) return
    const t = setTimeout(() => setHidden(true), 250)
    return () => clearTimeout(t)
  }, [active])

  return (
    <div className={`loading-screen ${hidden ? 'hidden' : ''}`} aria-hidden={hidden}>
      <div>
        {/* <div className="loading-ornament">✦</div> */}
        <div className="loading-bar">
          <span style={{ width: `${progress}%` }} />
        </div>
        {/* <div className="loading-text">...</div> */}
      </div>
    </div>
  )
}