import { useEffect, useState } from 'react'

// TODO(geo): vị trí mặc định này là MOCK khi user từ chối/không hỗ trợ geolocation.
const FALLBACK = { lat: 20.779576, lng: 106.215692 }

export function useUserLocation() {
  const [loc, setLoc] = useState({ status: 'loading', lat: null, lng: null })

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLoc({ status: 'fallback', ...FALLBACK })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLoc({ status: 'ok', lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLoc({ status: 'fallback', ...FALLBACK }),
      { timeout: 6000, maximumAge: 60000 }
    )
  }, [])

  return loc
}