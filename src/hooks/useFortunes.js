// Đọc list quẻ/món ăn từ Google Sheets công khai (tab "Quẻ", gid=457287668).
// Sheet yêu cầu "Anyone with the link -> Viewer". Mỗi dòng 1 quẻ: id | food | description.
// Cách reload giống restaurants: load 1 lần lúc khởi động app (singleton, song song),
// luôn fetch lại sheet ở mỗi lần vào app; localStorage chỉ là cache bootstrap/fallback
// tạm thời (không có TTL). Giữ fallback dữ liệu mock nếu sheet lỗi. id là key ổn định
// (1..58) dùng chung với mocks & link quán, nên không cần map theo intent như restaurants.
import { useEffect, useState } from 'react'
import { FORTUNES } from '../data/fortunes.js'

const SHEET_ID = '10R4BBfOjX5eX1tf4NkDenVb6Io5DITLwj-MizM2v0t4'
const SHEET_GID = '457287668'
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`
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
  if (!table || !Array.isArray(table.rows) || table.rows.length === 0) return []

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
      const v = cell && cell.v != null ? cell.v : ''
      if (v === '' || v == null) return
      obj[key] = key === 'id' ? String(v).trim() : String(v).trim()
    })
    if (obj.id && obj.food) {
      map[obj.id] = { id: obj.id, food: obj.food, description: obj.description || '' }
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
let source = 'mock'
let cache = cacheMap ? { fortunes: cacheMap, source: 'sheet' } : { fortunes: { ...FORTUNES }, source: 'mock' }

const listeners = new Set()

function setData(map, src) {
  cache = { fortunes: map, source: src }
  listeners.forEach((fn) => fn(cache))
}

function fetchJsonp() {
  return new Promise((resolve, reject) => {
    const id = 'sheet-fortunes-cb'
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
