import { useEffect, useState } from 'react'
import { NEARBY_PLACES } from '../data/restaurants.js'

// TODO(geo): đọc data quán từ Google Sheets công khai. Yêu cầu sheet ở chế độ
// "Anyone with the link -> Viewer". Cột header đề xuất (viết được tiếng Việt có dấu
// hoặc không dấu đều hiểu): name | avatar | food | lat | lng | shopee | grab | phone
// - food: nhiều món cách nhau bằng dấu phẩy hoặc | (VD: "bún đậu, mắm tôm")
// - avatar: link ảnh (hoặc để trống -> không ảnh)
// - shopee/grab/phone: để trống -> ẩn nút tương ứng
// - intents: list ý định chung của quán, dùng token giống `intents` của quẻ trong
//   data/fortunes.js, cách nhau bằng | (VD: "bún|mắm|tôm") -> ghép quẻ vừa gieo với quán
const SHEET_ID = '10R4BBfOjX5eX1tf4NkDenVb6Io5DITLwj-MizM2v0t4'
const SHEET_GID = '0'
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`
const CACHE_KEY = 'restaurants-live'
const CACHE_TTL = 6 * 60 * 60 * 1000

const HEADER_KEYS = {
  name: 'name',
  avatar: 'avatar',
  food: 'food',
  intents: 'intents',
  lat: 'lat',
  lng: 'lng',
  shopee: 'shopee',
  grab: 'grab',
  phone: 'phone',
}

function deaccent(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

function normalizeHeader(s) {
  return deaccent(String(s).trim().toLowerCase())
}

function mapColumn(key) {
  return HEADER_KEYS[key] || null
}

function buildList(body) {
  const table = body && body.table
  if (!table || !Array.isArray(table.rows) || table.rows.length === 0) return []

  const colLabels = (table.cols || []).map((c) => normalizeHeader(c && c.label))
  let mapping = colLabels.map(mapColumn)
  let startIdx = 0

  if (!mapping.some(Boolean)) {
    const first = table.rows[0]
    mapping = (first.c || []).map((cell) =>
      mapColumn(normalizeHeader(cell && cell.v != null ? String(cell.v) : ''))
    )
    startIdx = 1
  }

  const items = []
  for (let r = startIdx; r < table.rows.length; r++) {
    const cells = table.rows[r].c || []
    const obj = {}
    cells.forEach((cell, ci) => {
      const key = mapping[ci]
      if (!key) return
      const v = cell && cell.v != null ? cell.v : ''
      if (v === '') return
      if (key === 'lat' || key === 'lng') {
        let n = Number(String(v).replace(',', '.'))
        if (!Number.isNaN(n)) {
          // Google Sheets locale VN (dấu chấm = phân tách nghìn) thường nuốt dấu chấm:
          // "20.780176" -> 20780176. Phục hồi khi giá trị rơi vào miền lat/lng hợp lệ.
          if (Number.isInteger(n) && Math.abs(n) >= 1000000 && Math.abs(n / 1e6) <= 180) {
            n = n / 1e6
          }
          obj[key] = n
        }
        return
      }
      if (key === 'food' || key === 'intents') {
        obj[key] = String(v)
          .split(/[,|]/)
          .map((s) => s.trim())
          .filter(Boolean)
        return
      }
      obj[key] = String(v).trim()
    })
    if (obj.name) items.push(obj)
  }
  return items
}

function fetchSheetJsonp() {
  return new Promise((resolve, reject) => {
    const id = '__sheets_cb_' + Math.random().toString(36).slice(2)
    const cleanup = () => {
      const el = document.getElementById(id)
      if (el) el.remove()
      try {
        delete window.google
      } catch {
        window.google = undefined
      }
    }
    window.google = window.google || {}
    window.google.visualization = window.google.visualization || {}
    window.google.visualization.Query = window.google.visualization.Query || {}
    window.google.visualization.Query.setResponse = (body) => {
      clearTimeout(timer)
      cleanup()
      resolve(body)
    }
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('timeout'))
    }, 15000)
    const s = document.createElement('script')
    s.id = id
    s.src = BASE_URL
    s.onerror = () => {
      clearTimeout(timer)
      cleanup()
      reject(new Error('script load error'))
    }
    document.head.appendChild(s)
  })
}

export function useRestaurants() {
  const [places, setPlaces] = useState(NEARBY_PLACES)

  useEffect(() => {
    let cancelled = false
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { ts, items } = JSON.parse(cached)
        if (Date.now() - ts < CACHE_TTL && Array.isArray(items) && items.length) {
          setPlaces(items)
          return
        }
      }
    } catch {
      // cache hỏng -> bỏ qua
    }

    fetchSheetJsonp()
      .then(buildList)
      .then((items) => {
        if (cancelled) return
        if (items.length) {
          setPlaces(items)
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }))
          } catch {
            // lưu cache hỏng -> bỏ qua
          }
        }
      })
      .catch(() => {
        // không kéo được sheet -> giữ mock data
      })

    return () => {
      cancelled = true
    }
  }, [])

  return places
}