import { useMemo, useState } from 'react'
import { useRestaurants } from '../../hooks/useRestaurants.js'
import { useFortunes } from '../../hooks/useFortunes.js'
import { useUserLocation } from '../../hooks/useUserLocation.js'
import { haversine, formatDistance } from '../../utils/geo.js'

const MAX_M = 10000

const formatRange = (m) =>
  m >= 1000
    ? (m % 1000 === 0 ? `${m / 1000}` : (m / 1000).toFixed(1)).replace('.', ',') + ' km'
    : `${m} m`

export default function NearbyPlaces({ visible = false, fortune = null }) {
  const { places } = useRestaurants()
  const { fortunes } = useFortunes()
  const { lat, lng } = useUserLocation()
  const hasLoc = lat != null && lng != null
  const [maxM, setMaxM] = useState(MAX_M)
  const rangeLabel = hasLoc ? formatRange(maxM) : '...'

  const items = useMemo(() => {
    // TODO(geo): xử lý fallback khi sheet trống - hiện đang dùng mock local.
    // Food quán lưu dạng "|1|2|"; quẻ khớp khi chuỗi này contains "|id|"
    // (tránh nhầm id 5 với 55 vì "|55|" không chứa "|5|").
    const qId = fortune ? String(fortune.id) : ''
    const isMatch = (p) => {
      if (qId === '') return false
      const delimited =
        '|' +
        (p.food || [])
          .map((id) => String(id).trim())
          .join('|') +
        '|'
      return delimited.includes('|' + qId + '|')
    }
    const far = (d) => (d == null ? Number.MAX_SAFE_INTEGER : d)

    return places
      .map((p, i) => ({
        ...p,
        matched: isMatch(p),
        pay: Number(p.pay) || 0,
        dishNames: (p.food || []).map((id) => fortunes[id] && fortunes[id].food).filter(Boolean),
        distanceKm: hasLoc ? haversine(lat, lng, p.lat, p.lng) : null,
        _i: i,
      }))
      // 1. contains id: chỉ quán có id quẻ vừa gieo trong food
      .filter((p) => p.matched)
      // 2. phạm vi: chỉ quán trong maxM (hoặc chưa có vị trí)
      .filter((p) => !hasLoc || p.distanceKm == null || p.distanceKm <= maxM / 1000)
      // 3. pay desc: trả nhiều xếp trước, cùng tiền thì gần xếp trước
      .sort(
        (a, b) =>
          b.pay - a.pay ||
          far(a.distanceKm) - far(b.distanceKm) ||
          a._i - b._i
      )
      .slice(0, 8)
  }, [places, fortunes, fortune, hasLoc, lat, lng, maxM])

  return (
    <aside className="nearby-box" aria-hidden={!visible}>
      <h2 className="nearby-title">
        Quán gần đây
        <span className="nearby-title-chip">{rangeLabel}</span>
      </h2>
      <div className="nearby-filter">
        <label htmlFor="nearby-range">Trong phạm vi</label>
        <input
          id="nearby-range"
          type="range"
          min={100}
          max={MAX_M}
          step={100}
          value={maxM}
          disabled={!hasLoc}
          onChange={(e) => setMaxM(Number(e.target.value))}
        />
      </div>
      {items.length ? (
        <ul className="nearby-list">
        {items.map((p) => (
          <li key={p.name} className="nearby-item">
            {p.avatar && <img className="nearby-avatar" src={p.avatar} alt="" loading="lazy" />}
            <div className="nearby-info">
              <span className="nearby-name">{p.name}</span>
              {(p.dishNames?.[0] || p.distanceKm != null) && (
                <span className="nearby-meta">
                  {[p.dishNames?.[0], formatDistance(p.distanceKm)].filter(Boolean).join(' · ')}
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
      ) : (
        <p className="nearby-empty">Danh sách rỗng</p>
      )}
    </aside>
  )
}