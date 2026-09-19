import { useMemo, useState } from 'react'
import { useRestaurants } from '../../hooks/useRestaurants.js'
import { useUserLocation } from '../../hooks/useUserLocation.js'
import { haversine, formatDistance } from '../../utils/geo.js'

const MAX_KM = 10

export default function NearbyPlaces({ visible = false, fortune = null }) {
  const { places, source } = useRestaurants()
  const { lat, lng } = useUserLocation()
  const hasLoc = lat != null && lng != null
  const [maxKm, setMaxKm] = useState(MAX_KM)

  const items = useMemo(() => {
    // TODO(geo): xử lý fallback khi sheet trống - hiện đang dùng mock local.
    let list = places
    if (fortune) {
      const key = (s) => String(s).trim().toLowerCase()
      const star = (fortune.intents || []).map(key)
      const matches = (p) => {
        const pIt = p.intents && p.intents.length ? p.intents : p.food || []
        if (star.length && pIt.length) {
          const pKeys = pIt.map(key)
          const overlap = star.filter((s) => pKeys.includes(s)).length
          return overlap > 0
        }
        const q = fortune.food.trim().toLowerCase()
        return pIt.some((f) => key(f) === q || key(f).includes(q) || q.includes(key(f)))
      }
      list = [...places.filter(matches), ...places.filter((p) => !matches(p))]
    }
    return list
      .map((p, i) => ({
        ...p,
        distanceKm: hasLoc ? haversine(lat, lng, p.lat, p.lng) : null,
        _i: i,
      }))
      .sort(
        (a, b) =>
          (a.distanceKm == null ? Number.MAX_SAFE_INTEGER : a.distanceKm) -
          (b.distanceKm == null ? Number.MAX_SAFE_INTEGER : b.distanceKm) ||
          a._i - b._i
      )
      .filter((p) => !hasLoc || p.distanceKm == null || p.distanceKm <= maxKm)
      .slice(0, 8)
  }, [places, fortune, hasLoc, lat, lng, maxKm])

  if (!items.length) return null

  return (
    <aside className="nearby-box" aria-hidden={!visible}>
      <div className="nearby-head">
        <h2 className="nearby-title">Quán gần đây</h2>
        <span className={`nearby-source ${source}`}>{source === 'sheet' ? 'Nguồn: Sheet' : 'Nguồn: mock'}</span>
      </div>
      <div className="nearby-filter">
        <label htmlFor="nearby-range">Trong phạm vi</label>
        <input
          id="nearby-range"
          type="range"
          min={1}
          max={MAX_KM}
          step={0.5}
          value={maxKm}
          disabled={!hasLoc}
          onChange={(e) => setMaxKm(Number(e.target.value))}
        />
        <span className="nearby-range-value">
          {hasLoc ? `${maxKm} km` : 'xác định vị trí...'}
        </span>
      </div>
      <ul className="nearby-list">
        {items.map((p) => (
          <li key={p.name} className="nearby-item">
            {p.avatar && <img className="nearby-avatar" src={p.avatar} alt="" loading="lazy" />}
            <div className="nearby-info">
              <span className="nearby-name">{p.name}</span>
              {(p.food[0] || p.distanceKm != null) && (
                <span className="nearby-meta">
                  {[p.food[0], formatDistance(p.distanceKm)].filter(Boolean).join(' · ')}
                </span>
              )}
              <div className="nearby-actions">
                {p.shopee && (
                  <a className="nearby-btn nearby-shopee" href={p.shopee} target="_blank" rel="noreferrer">
                    ShopeeFood
                  </a>
                )}
                {p.grab && (
                  <a className="nearby-btn nearby-grab" href={p.grab} target="_blank" rel="noreferrer">
                    GrabFood
                  </a>
                )}
                {p.phone && <a className="nearby-btn nearby-tel" href={`tel:${p.phone}`}>Gọi {p.phone}</a>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}