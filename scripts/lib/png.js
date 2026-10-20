// Minimal encoder for 8 bit indexed PNGs with a transparent palette entry.
import { deflateSync, crc32 } from 'node:zlib'

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(data, crc32(typeBuf)))
  return Buffer.concat([len, typeBuf, data, crc])
}

// indices: one palette index per pixel, row major
// palette: array of [r, g, b], index 0 is written as fully transparent
export function encodeIndexedPng(indices, width, height, palette) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 3 // colour type: indexed
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  const plte = Buffer.from(palette.flat())
  const trns = Buffer.from([0])

  // Each scanline gets a leading filter byte of 0 (no filtering)
  const raw = Buffer.alloc((width + 1) * height)
  for (const y of Array(height).keys()) {
    raw.set(indices.subarray(y * width, (y + 1) * width), y * (width + 1) + 1)
  }

  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('PLTE', plte),
    chunk('tRNS', trns),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}
