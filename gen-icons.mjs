// Generate simple PWA icons using browser-less PNG encoding
// Uses pure JS to create a colored square PNG

import { createWriteStream } from 'fs'
import { deflateSync } from 'zlib'

function crc32(buf) {
  let crc = 0xffffffff
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type)
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const body = Buffer.concat([typeBytes, data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function makePng(size, r, g, b) {
  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // color type RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // Raw pixel data: filter byte + RGB per row
  const rows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3)
    row[0] = 0  // filter none
    for (let x = 0; x < size; x++) {
      // Draw a rounded purple square with PDF icon feel
      const cx = size / 2, cy = size / 2
      const margin = size * 0.05
      const rx = size / 2 - margin
      const ry = size / 2 - margin
      const dx = Math.abs(x - cx), dy = Math.abs(y - cy)
      // Simple circle mask
      const inCircle = (dx / rx) ** 2 + (dy / ry) ** 2 <= 1
      if (inCircle) {
        row[1 + x * 3] = r
        row[1 + x * 3 + 1] = g
        row[1 + x * 3 + 2] = b
      } else {
        row[1 + x * 3] = 26
        row[1 + x * 3 + 1] = 26
        row[1 + x * 3 + 2] = 36
      }
    }
    rows.push(row)
  }
  const raw = Buffer.concat(rows)
  const compressed = deflateSync(raw)

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const icon192 = makePng(192, 108, 92, 231)
const icon512 = makePng(512, 108, 92, 231)

import { writeFileSync, mkdirSync } from 'fs'
mkdirSync('public', { recursive: true })
writeFileSync('public/pwa-192.png', icon192)
writeFileSync('public/pwa-512.png', icon512)
console.log('Icons generated: public/pwa-192.png, public/pwa-512.png')
