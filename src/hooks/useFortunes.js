// Đọc list quẻ/món ăn từ Google Sheets công khai (tab "Quẻ", gid=457287668).
// Sheet yêu cầu "Anyone with the link -> Viewer". Mỗi dòng 1 quẻ: id | food | description.
// Cách reload giống restaurants: load 1 lần lúc khởi động app (singleton, song song),
// luôn fetch lại sheet ở mỗi lần vào app; localStorage chỉ là cache bootstrap/fallback
// tạm thời (không có TTL). KHÔNG còn mock hardcode: nếu sheet lỗi truy cập thì giữ cache
// cũ; nếu sheet hợp lệ nhưng rỗng thì xóa list (hiện trống), không nhảy về dữ liệu cũ.
import { useEffect, useState } from 'react'

const SHEET_ID = '10R4BBfOjX5eX1tf4NkDenVb6Io5DITLwj-MizM2v0t4'
const SHEET_GID = '457287668'
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:`
const CACHE_KEY = 'fortunes-live'

const HEADER_KEYS = {
  id: 'id',
  food: 'food',
  description: 'description',
}

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
  if (key === 'id' || key === 'stt' || key === 'ma') return 'id'
  if (key === 'food') return 'food'
  if (key === 'description' || key === 'mota' || key === 'mo ta') return 'description'
  return null
}

function buildList(body) {
  const table = body && body.table
  // body thiếu table -> sheet lỗi truy cập chứ KHÔNG hẳn là rỗng.
  if (!table) return null
  if (!Array.isArray(table.rows) || table.rows.length === 0) return []

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
      const v = cell && cell.v != null ? String(cell.v).trim() : ''
      if (v === '') return
      obj[key] = v
    })
    if (obj.id && obj.food) {
      map[obj.id] = { id: obj.id, food: obj.food, description: obj.description || '' }
    }
  }
  return map
}

function fetchJsonp() {
  return new Promise((resolve, reject) => {
    // Mỗi request 1 callback riêng (tqx responseHandler) -> không đụng slot window.google
    // nếu sau này có module khác cùng gọi sheet.
    const cbName = '__webbua_frt_' + Math.random().toString(36).slice(2)
    let done = false
    const finish = (err, body) => {
      if (done) return
      done = true
      clearTimeout(timer)
      const el = document.getElementById(cbName)
      if (el) el.remove()
      delete window[cbName]
      if (err) reject(err)
      else resolve(body)
    }
    const timer = setTimeout(() => finish(new Error('timeout')), 15000)
    window[cbName] = (body) => finish(null, body)
    const s = document.createElement('script')
    s.id = cbName
    s.src = BASE_URL + cbName + `&gid=${SHEET_GID}`
    s.onerror = () => finish(new Error('script load error'))
    document.head.appendChild(s)
  })
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const { items } = JSON.parse(raw)
      // Load bất kể độ dài (kể cả {} / [] vì sheet đã hợp lệ nhưng rỗng).
      if (items && typeof items === 'object') return items
    }
  } catch {
    // cache hỏng -> bỏ qua
  }
  return null
}

let cacheMap = readCache()
let cache = cacheMap
  ? { fortunes: cacheMap, source: 'sheet' }
  : { fortunes: {}, source: 'empty' }

const listeners = new Set()

function setData(map, src) {
  cache = { fortunes: map, source: src }
  listeners.forEach((fn) => fn(cache))
}

function startLoad() {
  fetchJsonp()
    .then(buildList)
    .then((map) => {
      // map === null: sheet lỗi truy cập -> giữ cache hiện có, không ghi đè.
      // map rỗng: sheet hợp lệ nhưng chưa có quẻ -> xóa list/cache cũ, không về hardcode.
      if (map == null) return
      if (Array.isArray(map) && map.length === 0) map = {}
      setData(map, 'sheet')
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items: map }))
      } catch {
        // bỏ qua
      }
    })
    .catch(() => {
      // sheet lỗi/timeout -> giữ cache hiện có, load lại lần vào app sau
    })
}

startLoad()

export function useFortunes() {
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