import { useEffect, useState } from 'react'

// TODO(geo): đọc data quán từ Google Sheets công khai. Yêu cầu sheet ở chế độ
// "Anyone with the link -> Viewer". Cột header (viết có dấu hay không đều hiểu):
// name | avatar | food | lat | lng | shopee | grab | phone | pay
// - food: list ID quẻ (khớp id trong data/fortunes.js) quán phục vụ, cách nhau bằng |
//   (khuyên nên bọc | hai đầu như "|1|2|") -> match quẻ khi id quẻ nằm trong food
// - pay: số tiền quán tài trợ quảng cáo (VD: 500000, 500.000, 500k, 5tr) -> quán
//   trả nhiều hơn xếp trước
const SHEET_ID = '10R4BBfOjX5eX1tf4NkDenVb6Io5DITLwj-MizM2v0t4'
const SHEET_GID = '0'
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`
const CACHE_KEY = 'restaurants-live'

const HEADER_KEYS = {
  name: 'name',
  avatar: 'avatar',
  food: 'food',
  lat: 'lat',
  lng: 'lng',
  shopee: 'shopee',
  grab: 'grab',
  phone: 'phone',
  pay: 'pay',
}

function toPay(v) {
  if (v == null || v === '') return 0
  let s = String(v).replace(/\s+/g, '').toLowerCase()
  let mult = 1
  if (s.endsWith('tr')) {
    mult = 1e6
    s = s.slice(0, -2)
  } else if (s.endsWith('k')) {
    mult = 1e3
    s = s.slice(0, -1)
  }
  s = s.replace(/\./g, '').replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(n * mult) : 0
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
      if (key === 'pay') {
        obj[key] = toPay(v)
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

function readCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { items } = JSON.parse(cached)
      if (Array.isArray(items) && items.length) return items
    }
  } catch {
    // cache hỏng -> bỏ qua
  }
  return null
}

// Singleton: bắt đầu tải 1 lần ngay khi module được import (song song với khởi động app).
const listeners = new Set()
const cachedPlaces = readCache()
let cache = { places: cachedPlaces || [], source: cachedPlaces ? 'sheet' : 'empty' }

function setData(places, source) {
  cache = { places, source }
  listeners.forEach((fn) => fn(cache))
}

function startLoad() {
  fetchSheetJsonp()
    .then(buildList)
    .then((items) => {
      if (Array.isArray(items) && items.length) {
        setData(items, 'sheet')
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }))
        } catch {
          // bỏ qua
        }
      }
    })
    .catch(() => {
      // fetch lỗi -> giữ cache/mock hiện có, không ghi đè
    })
}

startLoad()

export function useRestaurants() {
  const [state, setState] = useState(cache)

  useEffect(() => {
    setState(cache)
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return state
}