// Đọc config website từ Google Sheets công khai (tab "Config", gid=2137222860). Sheet yêu cầu
// "Anyone with the link -> Viewer". Cột header (viết có dấu hay không đều hiểu):
// key | value | type (type bỏ trống cũng được: tự detect true/false -> boolean,
// số -> number, còn lại string).
// Cách reload giống restaurants/fortunes: load 1 lần lúc khởi động app (singleton,
// song song), luôn fetch lại sheet ở mỗi lần vào app; localStorage chỉ là cache
// bootstrap/fallback (không có TTL). Giữ DEFAULT_CONFIG nếu sheet lỗi. Biến lạ hoặc
// chưa có trong sheet bị bỏ qua -> giữ nguyên giá trị default.
import { useEffect, useState } from 'react'
import { DEFAULT_CONFIG } from '../data/config.js'

const SHEET_ID = '10R4BBfOjX5eX1tf4NkDenVb6Io5DITLwj-MizM2v0t4'
const SHEET_GID = '2137222860'
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`
const CACHE_KEY = 'config-live'

function deaccent(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

function normalizeHeader(s) {
  return deaccent(String(s).trim().toLowerCase())
}

function mapColumn(key) {
  if (key === 'key' || key === 'bien' || key === 'ten') return 'key'
  if (key === 'value' || key === 'giatri' || key === 'gia tri') return 'value'
  if (key === 'type' || key === 'kieu' || key === 'loai') return 'type'
  return null
}

function coerce(value, type) {
  let raw = String(value == null ? '' : value).trim()
  const t = (type || '').trim().toLowerCase()
  if (t === 'boolean' || /^(true|false|1|0)$/i.test(raw)) {
    return /^(true|1)$/i.test(raw)
  }
  if (t === 'number' || /^-?[\d.,]+$/.test(raw)) {
    const n = Number(raw.replace(',', '.'))
    return Number.isFinite(n) ? n : raw
  }
  return raw
}

function buildList(body) {
  const table = body && body.table
  if (!table || !Array.isArray(table.rows) || table.rows.length === 0) return {}

  let colKeys = (table.cols || []).map((c) => mapColumn(normalizeHeader(c && c.label)))
  let startIdx = 0
  if (!colKeys.some(Boolean)) {
    const first = table.rows[0]
    colKeys = (first.c || []).map((cell) =>
      mapColumn(normalizeHeader(cell && cell.v != null ? String(cell.v) : ''))
    )
    startIdx = 1
  }

  const map = {}
  for (let r = startIdx; r < table.rows.length; r++) {
    const cells = table.rows[r].c || []
    const obj = {}
    cells.forEach((cell, ci) => {
      const key = colKeys[ci]
      if (!key) return
      const v = cell && cell.v != null ? String(cell.v) : ''
      obj[key] = v.trim()
    })
    const keyName = String(obj.key || '').toUpperCase()
    // chỉ nhận biến đã khai báo trong DEFAULT_CONFIG, bỏ qua hàng lạ.
    if (keyName && keyName in DEFAULT_CONFIG) {
      map[keyName] = coerce(obj.value, obj.type)
    }
  }
  return map
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const { items } = JSON.parse(raw)
      if (items && Object.keys(items).length) return items
    }
  } catch {
    // cache hỏng -> bỏ qua
  }
  return null
}

let cacheMap = readCache()
let cache = cacheMap
  ? { config: { ...DEFAULT_CONFIG, ...cacheMap }, source: 'sheet' }
  : { config: { ...DEFAULT_CONFIG }, source: 'mock' }

const listeners = new Set()

function setData(map, src) {
  cache = { config: { ...DEFAULT_CONFIG, ...map }, source: src }
  listeners.forEach((fn) => fn(cache))
}

function fetchJsonp() {
  return new Promise((resolve, reject) => {
    const id = 'sheet-config-cb'
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

function startLoad() {
  fetchJsonp()
    .then(buildList)
    .then((map) => {
      if (!map || !Object.keys(map).length) return
      setData(map, 'sheet')
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items: map }))
      } catch {
        // cache hỏng -> bỏ qua
      }
    })
    .catch(() => {
      // sheet lỗi -> giữ mock/cache hiện tại
    })
}

startLoad()

export function useConfig() {
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