import { useEffect, useState } from 'react'
import { NEARBY_PLACES } from '../data/restaurants.js'

// TODO(geo): đọc data quán từ Google Sheets công khai. Yêu cầu sheet ở chế độ
// "Anyone with the link -> Viewer". Cột header (viết có dấu hay không đều hiểu):
// name | avatar | food | intents | lat | lng | shopee | grab | phone
// - intents: tên quẻ `food` đã chuẩn hóa (UPPERCASE, bỏ dấu, bỏ cách), cách nhau bằng |
// - food/intents: nhiều giá trị cách nhau bằng dấu phẩy hoặc |
// - shopee/grab/phone: để trống -> ẩn nút tương ứng
const SHEET_ID = '10R4BBfOjX5eX1tf4NkDenVb6Io5DITLwj-MizM2v0t4'
const SHEET_GID = '0'
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`
const CACHE_KEY = 'restaurants-live'

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
  const [state, setState] = useState({ places: NEARBY_PLACES, source: 'mock' })

  useEffect(() => {
    let cancelled = false

    const apply = (items) => {
      if (cancelled) return
      if (Array.isArray(items) && items.length) {
        setState({ places: items, source: 'sheet' })
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }))
        } catch {
          // lưu cache hỏng -> bỏ qua
        }
      }
    }

    // Luôn gọi mới mỗi khi mount (mỗi lần box hiển thị) -> sửa sheet là thấy ngay.
    fetchSheetJsonp()
      .then(buildList)
      .then((items) => {
        if (cancelled) return
        if (items.length) {
          apply(items)
        } else {
          throw new Error('sheet empty')
        }
      })
      .catch(() => {
        // fallback: cache cũ -> mock local
        let fromCache = null
        try {
          const cached = localStorage.getItem(CACHE_KEY)
          if (cached) {
            const { items } = JSON.parse(cached)
            if (Array.isArray(items) && items.length) fromCache = items
          }
        } catch {
          // bỏ qua
        }
        if (cancelled) return
        if (fromCache) setState({ places: fromCache, source: 'sheet' })
        else setState({ places: NEARBY_PLACES, source: 'mock' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}