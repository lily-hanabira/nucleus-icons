// Emoji objects: hearts in every colour, sparkles, flame, tick, eyes, star, ribbon, trident, wilted flower, water pistol, meteor, eraser,
// jack o lantern, love letter, skulls, pile of poo, ghost, goblin, aliens and robot
import { ink, g1, g2, g3, g4, g5, g6, white, b2, b3, b4, b5, gr1, gr2, gr3, gr4, a1, a2, a3, a4, r1, r2, r3, r4, p1, p2, p3, n1, n2, n3, r, diag, S, F, H, write, tones } from './lib.mjs'

// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i)

// Pixel art helper. rows is a string grid, '#' is ink, '.' is empty.
// Enclosed empty cells (not reachable from the border through non ink cells) become the inside surface.
// Other letters map to extra layers painted on top: [kind, fill] or [kind, fill, light, dark] for a custom bevel.
const pix = (size, x0, y0, rows, inside, map = {}) => {
  const grid = new Uint8Array(size * size)
  const cells = {}, inkCells = []
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    const px = x0 + x, py = y0 + y
    if (c === '#' || c === '_') grid[py * size + px] = 1
    if (c === '#') inkCells.push([px, py])
    else if (c !== '.' && c !== '_') (cells[c] ||= []).push([px, py])
  }))
  const seen = new Uint8Array(size * size)
  const stack = []
  for (const i of range(0, size)) stack.push([i, 0], [i, size - 1], [0, i], [size - 1, i])
  while (stack.length) {
    const [x, y] = stack.pop()
    if (x < 0 || y < 0 || x >= size || y >= size) continue
    const i = y * size + x
    if (seen[i] || grid[i]) continue
    seen[i] = 1
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }
  const enclosed = new Uint8Array(size * size)
  for (const i of range(0, size * size)) if (!seen[i] && !grid[i]) enclosed[i] = 1
  const layers = []
  const inkD = inkCells.map(([x, y]) => r(x, y, 1, 1))
  if (inkD.length) layers.push(F(ink, ...inkD))
  if (inside) layers.push(...surface(size, enclosed, ...[].concat(inside)))
  for (const [c, spec] of Object.entries(map)) {
    if (!cells[c]) continue
    const d = cells[c].map(([x, y]) => r(x, y, 1, 1))
    const [kind, fill, light, dark] = spec
    if (kind === 'S') {
      const m = new Uint8Array(size * size)
      for (const [x, y] of cells[c]) m[y * size + x] = 1
      layers.push(...surface(size, m, fill, light, dark))
    } else layers.push((kind === 'H' ? H : F)(fill, ...d))
  }
  return layers
}

// Bevelled surface from a mask as flat layers so the ramp neighbours can be overridden
const surface = (size, m, fill, light, dark) => {
  const t = light ? { light, dark } : tones(fill)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
  const base = [], hi = [], lo = []
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (!at(x, y)) continue
    const up = at(x, y - 1), down = at(x, y + 1), left = at(x - 1, y), right = at(x + 1, y)
    const shade = !down || (!right && up)
    const highlight = !shade && (!up || !left)
    const bucket = shade ? lo : highlight ? hi : base
    bucket.push(r(x, y, 1, 1))
  }
  const out = []
  if (base.length) out.push(F(fill, ...base))
  if (hi.length) out.push(F(t.light, ...hi))
  if (lo.length) out.push(F(t.dark, ...lo))
  return out
}

// Heart shape, glint w on the upper left lobe
const heart16 = [
  '.###....###.',
  '#...#..#...#',
  '#.w..##....#',
  '#..........#',
  '#..........#',
  '#..........#',
  '.#........#.',
  '..#......#..',
  '...#....#...',
  '....#..#....',
  '.....##.....',
]
// Heart grid at 32
const heart32 = [
  '....######........######....',
  '..##......##....##......##..',
  '.#..........#..#..........#.',
  '#...ww.......##............#',
  '#...w......................#',
  '#..........................#',
  '#..........................#',
  '#..........................#',
  '#..........................#',
  '#..........................#',
  '#..........................#',
  '.#........................#.',
  '.#........................#.',
  '..#......................#..',
  '...#....................#...',
  '....#..................#....',
  '.....#................#.....',
  '......#..............#......',
  '.......#............#.......',
  '........#..........#........',
  '.........#........#.........',
  '..........#......#..........',
  '...........#....#...........',
  '............#..#............',
  '.............##.............',
]
// Heart at both sizes in a colour with an optional vertical shift
const heart = (fill, light, dark, dy = 0) => ({
  16: pix(16, 2, 2 + dy, heart16, [fill, light, dark], { w: ['F', white] }),
  32: pix(32, 2, 3 + dy, heart32, [fill, light, dark], { w: ['F', white] }),
})

// Diagonal bandage strip running down right, w white wide with ink edges and end caps
const strip = (x, y, n, w) => {
  const k = [r(x + 1, y - 1, w, 1), r(x + n, y + n, w, 1)], wd = []
  for (const i of range(0, n)) {
    k.push(r(x + i, y + i, 1, 1), r(x + i + w + 1, y + i, 1, 1))
    wd.push(r(x + i + 1, y + i, w, 1))
  }
  return [F(ink, ...k), F(white, ...wd)]
}
// Flames licking over the heart
const flames = {
  16: pix(16, 6, 1, [
    '.##.',
    '#aa#',
    '#aa#',
    '#bb#',
    '.bb.',
  ], null, { a: ['S', a3], b: ['F', a2] }),
  32: pix(32, 10, 2, [
    '.....##.....',
    '....#aa#....',
    '...#aaaa#...',
    '..#aabbaa#..',
    '.#aabbbbaa#.',
    '#aaabbbbaaa#',
    '.#aaabbaaa#.',
  ], null, { a: ['S', a3], b: ['F', a2] }),
}

// Geometry masks. fn takes pixel centres, the outline is the mask dilated by one pixel
const mask = (size, fn) => {
  const m = new Uint8Array(size * size)
  for (const y of range(0, size)) for (const x of range(0, size)) if (fn(x + 0.5, y + 0.5)) m[y * size + x] = 1
  return m
}
// Mask grown by one pixel
const dilate = (size, m) => {
  const out = new Uint8Array(m)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
  for (const y of range(0, size)) for (const x of range(0, size)) if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) out[y * size + x] = 1
  return out
}
// Mask to a path of row runs
const path = (size, m) => {
  const d = []
  for (const y of range(0, size)) for (const x of range(0, size)) if (m[y * size + x]) d.push(r(x, y, 1, 1))
  return d
}
// Pixels in the first mask and not the second
const minus = (a, b) => a.map((v, i) => v && !b[i] ? 1 : 0)
// Pixels in either mask
const plus = (a, b) => a.map((v, i) => v || b[i] ? 1 : 0)
// Ink outline around a mask plus its surface
const outlined = (size, m, fill, light, dark) => [F(ink, ...path(size, minus(dilate(size, m), m))), ...surface(size, m, fill, light, dark)]
// Thick segment from a to b, t wide
const seg = (ax, ay, bx, by, t) => (x, y) => {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy
  const u = l2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)) : 0
  return Math.hypot(x - ax - u * dx, y - ay - u * dy) <= t
}
// Ellipse predicate
const ell = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1
// Point in polygon predicate
const poly = pts => (x, y) => {
  let inside = false
  for (const i of range(0, pts.length)) {
    const [xi, yi] = pts[i], [xj, yj] = pts[(i + pts.length - 1) % pts.length]
    if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
// Predicate combinators
const any = (...fs) => (x, y) => fs.some(f => f(x, y))
const all = (...fs) => (x, y) => fs.every(f => f(x, y))
const not = f => (x, y) => !f(x, y)
// Four point sparkle
const sparkle4 = (cx, cy, R) => (x, y) => Math.abs(x - cx) ** (2 / 3) + Math.abs(y - cy) ** (2 / 3) <= R ** (2 / 3)
// Five point star
const star5 = (cx, cy, R, ri, rot = -Math.PI / 2) => poly(Array.from({ length: 10 }, (_, i) => {
  const a = rot + i * Math.PI / 5, rad = i % 2 ? ri : R
  return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]
}))

const icons = {
  'emoji/heart': heart(r2),
  'emoji/heart-white': heart(white, white, g5),
  'emoji/heart-black': heart(g1, g2, g1),
  'emoji/heart-pink': heart(r4, r4, r3),
  'emoji/heart-mending': { 16: [...heart(r2)[16], ...strip(7, 2, 2, 1), ...strip(11, 2, 2, 1)], 32: [...heart(r2)[32], ...strip(16, 5, 6, 2), ...strip(21, 5, 6, 2)] },
  'emoji/heart-fire': { 16: [...heart(r2, null, null, 1)[16], ...flames[16]], 32: [...heart(r2, null, null, 2)[32], ...flames[32]] },
}

// Predicate cut off above row y0
const clip = (f, y0) => (x, y) => y >= y0 && f(x, y)
// Teardrop: disc with a point above it
const drop = (cx, cy, R, tip) => any(ell(cx, cy, R, R), poly([[cx - 0.5, tip], [cx + 0.5, tip], [cx + R, cy], [cx - R, cy]]))
// Ribbon from three thick segments and a clipped fourth
const ribbon = (size, t, a, b, c, d, cut) => [
  ...outlined(size, mask(size, any(seg(...a, t), seg(...b, t), seg(...c, t))), r2),
  ...outlined(size, mask(size, clip(seg(...d, t), cut)), r2),
]
Object.assign(icons, {
  'emoji/sparkles': {
    16: [
      H(a3, r(12, 2, 1, 3), r(11, 3, 3, 1), r(12, 11, 1, 3), r(11, 12, 3, 1)),
      ...outlined(16, mask(16, sparkle4(6.5, 9.5, 4.4)), a3),
    ],
    32: [
      H(a3, ...path(32, mask(32, sparkle4(25, 7, 2.6))), ...path(32, mask(32, sparkle4(26, 21, 1.6)))),
      ...outlined(32, mask(32, sparkle4(12.5, 18.5, 9.4)), a3),
    ],
  },
  'emoji/flame': {
    16: [
      ...outlined(16, mask(16, drop(8, 10, 3.5, 2)), r2),
      ...surface(16, mask(16, drop(8, 11, 2, 6)), a3),
      F(a4, r(7, 11, 2, 2)),
    ],
    32: [
      ...outlined(32, mask(32, drop(16, 21, 7.5, 3)), r2),
      ...surface(32, mask(32, drop(16, 23, 4.5, 11)), a3),
      F(a4, ...path(32, mask(32, drop(16, 25, 2, 19)))),
    ],
  },
  'emoji/green-tick': {
    16: outlined(16, mask(16, any(seg(3.5, 8.5, 6.5, 11.5, 1.5), seg(6.5, 11.5, 12.5, 4.5, 1.5))), gr2),
    32: outlined(32, mask(32, any(seg(6.5, 17, 13, 24, 2.5), seg(13, 24, 26, 9.5, 2.5))), gr2),
  },
  'emoji/eyes': {
    16: [
      ...outlined(16, mask(16, any(ell(4.5, 8, 2.5, 3.5), ell(10.5, 8, 2.5, 3.5))), white),
      F(ink, r(4, 7, 2, 2), r(10, 7, 2, 2)),
    ],
    32: [
      ...outlined(32, mask(32, any(ell(9, 16, 5.5, 8.5), ell(23, 16, 5.5, 8.5))), white),
      F(ink, r(9, 14, 4, 4), r(23, 14, 4, 4)),
      F(white, r(9, 14, 1, 1), r(23, 14, 1, 1)),
    ],
  },
  'emoji/star': {
    16: outlined(16, mask(16, star5(8, 8.6, 6.6, 2.9)), a3),
    32: outlined(32, mask(32, star5(16, 17.2, 13.6, 6)), a3),
  },
  'emoji/ribbon': {
    16: ribbon(16, 1.1, [8, 3, 5, 7.5], [8, 3, 11, 7.5], [5, 7.5, 11, 13], [11, 7.5, 5, 13], 9),
    32: ribbon(32, 2.2, [16, 5, 10, 13], [16, 5, 22, 13], [10, 13, 23, 27], [22, 13, 9, 27], 15),
  },
})

Object.assign(icons, {
  'emoji/trident': {
    16: pix(16, 3, 1, [
      '.....#.....',
      '.#..#a#..#.',
      '#a#.#a#.#a#',
      '#a#.#a#.#a#',
      '#a#.#a#.#a#',
      '#aa##a##aa#',
      '.#aaaaaaa#.',
      '..###s###..',
      '....#s#....',
      '....#s#....',
      '....#s#....',
      '....#s#....',
      '....#s#....',
      '....###....',
    ], null, { a: ['S', a3], s: ['S', n3] }),
    32: pix(32, 8, 2, [
      '........#........',
      '.......#a#.......',
      '..#...#aaa#...#..',
      '.#a#..#aaa#..#a#.',
      '#aaa#.#aaa#.#aaa#',
      '#aaa#.#aaa#.#aaa#',
      '#aaa#.#aaa#.#aaa#',
      '#aaa#.#aaa#.#aaa#',
      '#aaa#.#aaa#.#aaa#',
      '#aaa#.#aaa#.#aaa#',
      '#aaa#.#aaa#.#aaa#',
      '#aaa###aaa###aaa#',
      '#aaaaaaaaaaaaaaa#',
      '.#aaaaaaaaaaaaa#.',
      '..##aaaaaaaaa##..',
      '....##aaaaa##....',
      '......#aaa#......',
      '......#sss#......',
      '......#sss#......',
      '......#sss#......',
      '......#sss#......',
      '......#sss#......',
      '......#sss#......',
      '......#sss#......',
      '......#sss#......',
      '......#sss#......',
      '......#sss#......',
      '......#####......',
    ], null, { a: ['S', a3], s: ['S', n3] }),
  },
  'emoji/wilted-flower': {
    16: pix(16, 1, 1, [
      '.....####.....',
      '....#gggg#....',
      '...#g####g#...',
      '...#g#..#g##..',
      '...#g#.#pppp#.',
      '...#g#.#pppp#.',
      '...#g#.#pppp#.',
      '.###g#.##pp##.',
      '#ll#g#..####..',
      '.#l#g###......',
      '..##g#ll#.....',
      '...#g##l#.....',
      '...#g#.##.....',
      '...###........',
    ], null, { g: ['S', gr2], l: ['S', gr3], p: ['S', n2] }),
    32: pix(32, 2, 2, [
      '.........########...........',
      '........#gggggggg#..........',
      '.......#ggg####ggg#.........',
      '......#ggg#....#ggg#........',
      '......#ggg#....#ggg#........',
      '......#ggg#....#ggg##.......',
      '......#ggg#...#pppppp#......',
      '......#ggg#..#pppppppppp#...',
      '......#ggg#..#pppppppppp#...',
      '......#ggg#..#pppppppppp#...',
      '......#ggg#..#pppppppppp#...',
      '......#ggg#..#pppppppppp#...',
      '......#ggg#...#pp#pp#pp#....',
      '......#ggg#...#pp#pp#pp#....',
      '......#ggg#....##.##.##.....',
      '....###ggg#.................',
      '..##ll#ggg#.................',
      '.#llll#ggg#.................',
      '#lllll#ggg#.................',
      '.#lll##ggg####..............',
      '..###.#ggg#lll#.............',
      '......#ggg#lllll#...........',
      '......#ggg#llllll#..........',
      '......#ggg##lllll#..........',
      '......#ggg#.##lll#..........',
      '......#ggg#...#####.........',
      '......#ggg#.................',
      '......#####.................',
    ], null, { g: ['S', gr2], l: ['S', gr3], p: ['S', n2] }),
  },
  'emoji/water-pistol': {
    16: pix(16, 1, 2, [
      '....######....',
      '...#bbbbbb#...',
      '...#bbbbbb#...',
      '.###bbbbbb###.',
      '#ggggggggggg#.',
      '#gggggggggggb#',
      '.####ggg#t###.',
      '....#ggg##....',
      '....#ggg#.....',
      '...#ggg#......',
      '...#ggg#......',
      '...#####......',
    ], null, { g: ['S', gr3], b: ['S', b4], t: ['F', a2] }),
    32: pix(32, 2, 4, [
      '.......############.........',
      '......#bbbbbbbbbbbb#........',
      '......#bbbbbbbbbbbb#........',
      '......#bbbbbbbbbbbb#........',
      '......#bbbbbbbbbbbb#........',
      '......#bbbbbbbbbbbb#........',
      '.######bbbbbbbbbbbb#####....',
      '#ggggggggggggggggggggggg####',
      '#ggggggggggggggggggggggg#bb#',
      '#ggggggggggggggggggggggg#bb#',
      '#ggggggggggggggggggggggg#bb#',
      '#ggggggggggggggggggggggg####',
      '.#########gggggg####tt##....',
      '.........#gggggg#..#tt#.....',
      '.........#gggggg#..#tt#.....',
      '.........#gggggg#..####.....',
      '........#gggggg#......#.....',
      '........#gggggg########.....',
      '........#gggggg#............',
      '.......#gggggg#.............',
      '.......#gggggg#.............',
      '.......#gggggg#.............',
      '......#gggggg#..............',
      '......#gggggg#..............',
      '......#gggggg#..............',
      '......########..............',
    ], null, { g: ['S', gr3], b: ['S', b4], t: ['S', a2] }),
  },
})

// Isometric block: front face at x,y w by h, top and right faces receding by depth, a sleeve band sw wide on the left
const isoBlock = (size, x, y, w, h, depth, sw, front, side, band) => {
  const inkD = [], f = [], t = [], sd = [], bf = [], bt = []
  const put = (arr, xx, yy) => arr.push(r(xx, yy, 1, 1))
  put(inkD, x, y)
  inkD.push(r(x, y, w, 1), r(x, y + h - 1, w, 1), r(x, y, 1, h), r(x + w - 1, y, 1, h))
  inkD.push(r(x + depth, y - depth, w, 1), r(x + w - 1 + depth, y - depth, 1, h - depth))
  for (const k of range(1, depth)) {
    put(inkD, x + k, y - k)
    put(inkD, x + w - 1 + k, y - k)
    put(inkD, x + w - 1 + k, y + h - 1 - k)
    put(inkD, x + sw + k, y - k)
    for (const xx of range(x + k + 1, x + w - 1 + k)) if (xx !== x + sw + k) put(xx < x + sw + k ? bt : t, xx, y - k)
    for (const xx of range(x + w, x + w - 1 + depth)) if (xx > x + w - 1 + k) put(sd, xx, y - k)
  }
  inkD.push(r(x + sw, y + 1, 1, h - 2))
  for (const yy of range(y + 1, y + h - 1)) for (const xx of range(x + 1, x + w - 1)) if (xx !== x + sw) put(xx < x + sw ? bf : f, xx, yy)
  for (const yy of range(y, y + h - 1)) {
    const k = y + h - 1 - yy
    for (const xx of range(x + w, x + w - 1 + depth)) if (k >= depth || xx < x + w - 1 + k) put(sd, xx, yy)
  }
  const m = arr => {
    const o = new Uint8Array(size * size)
    for (const d of arr) {
      const [, a, b] = d.match(/M(\d+) (\d+)/)
      o[b * size + +a] = 1
    }
    return o
  }
  return [F(ink, ...inkD), ...surface(size, m(f), front), ...surface(size, m(t), front), ...surface(size, m(bf), band), ...surface(size, m(bt), band), F(side, ...sd)]
}
// Bone: a bar with a pair of knobs at each end
const bone = (ax, ay, bx, by, t, k) => {
  const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy), nx = -dy / l * k * 0.8, ny = dx / l * k * 0.8
  return any(seg(ax, ay, bx, by, t), ell(ax + nx, ay + ny, k, k), ell(ax - nx, ay - ny, k, k), ell(bx + nx, by + ny, k, k), ell(bx - nx, by - ny, k, k))
}
// Closed envelope
const envelope = {
  16: [F(ink, r(1, 3, 14, 10)), S(white, r(2, 4, 12, 8)), F(ink, diag(2, 4, 6, 1, 1, 1), diag(13, 4, 6, -1, 1, 1))],
  32: [F(ink, r(2, 6, 28, 20)), S(white, r(3, 7, 26, 18)), F(g5, diag(3, 8, 13, 1, 1, 1), diag(28, 8, 13, -1, 1, 1)), F(ink, diag(3, 7, 13, 1, 1, 1), diag(28, 7, 13, -1, 1, 1))],
}
// White skull from a mask with ink features
const skullFace = (size, m, eyes, nose, teeth) => [...outlined(size, m, white, white, g5), F(ink, ...eyes, ...nose, ...teeth)]
Object.assign(icons, {
  'emoji/meteor': {
    16: [
      ...outlined(16, mask(16, poly([[13.8, 2.2], [4, 7.5], [9, 12.5]])), r2),
      ...surface(16, mask(16, poly([[13.2, 3], [6, 8], [8.5, 11]])), a3),
      ...outlined(16, mask(16, ell(6.5, 9.5, 3.5, 3.5)), g2),
      F(g1, r(5, 8, 1, 1), r(7, 10, 2, 1)),
    ],
    32: [
      ...outlined(32, mask(32, poly([[28.5, 3.5], [8, 15], [19, 25]])), r2),
      ...surface(32, mask(32, poly([[27.5, 5], [11, 15], [17, 22]])), a3),
      F(a4, ...path(32, mask(32, poly([[26, 7], [14, 16], [16, 19]])))),
      ...outlined(32, mask(32, ell(12.5, 19.5, 7.5, 7.5)), g2),
      F(g1, r(9, 16, 2, 2), r(14, 20, 3, 2), r(10, 22, 2, 1)),
    ],
  },
  'emoji/eraser': {
    16: isoBlock(16, 1, 6, 10, 8, 3, 4, r4, r3, b4),
    32: isoBlock(32, 2, 11, 21, 16, 6, 7, r4, r3, b4),
  },
  'emoji/jack-o-lantern': {
    16: pix(16, 2, 1, [
      '.....##.....',
      '....#ss#....',
      '...##ss##...',
      '.##aa##aa##.',
      '#aaRaaaaRaa#',
      '#aa#aaaa#aa#',
      '#a###aa###a#',
      '#aaRaaaaRaa#',
      '#aaRaaaaRaa#',
      '#aa#a##a#aa#',
      '#a########a#',
      '.#aRaaaaRa#.',
      '..########..',
    ], null, { a: ['S', a2], R: ['F', a3], s: ['S', gr2] }),
    32: [
      ...pix(32, 13, 3, [
        '.####.',
        '#ssss#',
        '#ssss#',
        '#ssss#',
        '#ssss#',
        '#ssss#',
        '#ssss#',
      ], null, { s: ['S', gr2] }),
      ...outlined(32, mask(32, ell(16, 19, 12.5, 9.5)), a2),
      F(a3, ...path(32, mask(32, all(ell(16, 19, 11.5, 8.5), (x, y) => x === 8.5 || x === 23.5 || (x === 15.5 && y < 13))))),
      F(ink, ...[0, 1, 2].flatMap(i => [r(10 - i, 13 + 2 * i, 2 + 2 * i, 2), r(20 - i, 13 + 2 * i, 2 + 2 * i, 2)]), r(15, 19, 2, 1), r(14, 20, 4, 1)),
      ...pix(32, 6, 22, [
        '##....##....##....##',
        '####..####..####..##',
        '####################',
        '.##################.',
        '...##############...',
      ], null, {}),
    ],
  },
  'emoji/love-letter': {
    16: [
      ...envelope[16],
      ...pix(16, 5, 6, [
        '.##.##.',
        '#rr#rr#',
        '#rrrrr#',
        '.#rrr#.',
        '..#r#..',
        '...#...',
      ], null, { r: ['S', r2] }),
    ],
    32: [
      ...envelope[32],
      ...pix(32, 11, 10, [
        '..##...##..',
        '.#rr#.#rr#.',
        '#rrrr#rrrr#',
        '#rrrrrrrrr#',
        '#rrrrrrrrr#',
        '.#rrrrrrr#.',
        '..#rrrrr#..',
        '...#rrr#...',
        '....#r#....',
        '.....#.....',
      ], null, { r: ['S', r2] }),
    ],
  },
  'emoji/skull': {
    16: pix(16, 2, 2, [
      '....####....',
      '..##wwww##..',
      '.#wwwwwwww#.',
      '#wwwwwwwwww#',
      '#w##wwww##w#',
      '#w##wwww##w#',
      '#wwww##wwww#',
      '.#wwwwwwww#.',
      '..#wwwwww#..',
      '..#w#ww#w#..',
      '..########..',
    ], null, { w: ['S', white, white, g5] }),
    32: skullFace(32,
      plus(mask(32, ell(16, 13, 10.5, 9.5)), mask(32, poly([[9.5, 18], [22.5, 18], [22.5, 26], [21, 27.5], [11, 27.5], [9.5, 26]]))),
      path(32, plus(mask(32, ell(11.5, 14, 3, 3.5)), mask(32, ell(20.5, 14, 3, 3.5)))),
      [r(14, 19, 4, 1), r(15, 20, 2, 1)],
      [r(10, 23, 12, 1), r(12, 24, 1, 3), r(15, 24, 1, 3), r(18, 24, 1, 3)]),
  },
  'emoji/skull-crossbones': {
    16: [
      ...outlined(16, mask(16, any(bone(3.5, 9.5, 12.5, 13, 0.75, 1.1), bone(12.5, 9.5, 3.5, 13, 0.75, 1.1))), white, white, g5),
      ...pix(16, 3, 1, [
        '..######..',
        '.#wwwwww#.',
        '#w##ww##w#',
        '#w##ww##w#',
        '.#wwwwww#.',
        '..#w##w#..',
        '..######..',
      ], null, { w: ['S', white, white, g5] }),
    ],
    32: [
      ...outlined(32, mask(32, any(bone(6, 19.5, 26, 27.2, 1.6, 2), bone(26, 19.5, 6, 27.2, 1.6, 2))), white, white, g5),
      ...skullFace(32,
        plus(mask(32, ell(16, 10, 8.5, 7.5)), mask(32, poly([[10.5, 14], [21.5, 14], [21.5, 20], [20, 21.5], [12, 21.5], [10.5, 20]]))),
        path(32, plus(mask(32, ell(12.5, 11, 2.5, 3)), mask(32, ell(19.5, 11, 2.5, 3)))),
        [r(15, 15, 2, 1)],
        [r(11, 17, 10, 1), r(13, 18, 1, 3), r(16, 18, 1, 3), r(19, 18, 1, 3)]),
    ],
  },
})

// Rounded rectangle predicate
const rrect = (x0, y0, x1, y1, rad) => (x, y) => {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false
  const cx = x < x0 + rad ? x0 + rad : x > x1 - rad ? x1 - rad : x
  const cy = y < y0 + rad ? y0 + rad : y > y1 - rad ? y1 - rad : y
  return Math.hypot(x - cx, y - cy) <= rad
}
// Predicate sheared sideways by k per row from cy
const shear = (f, cx, cy, k) => (x, y) => f(x + (y - cy) * k, y)
// Ring predicate
const ring = (cx, cy, R, w) => (x, y) => Math.abs(Math.hypot(x - cx, y - cy) - R) <= w
// Predicate limited to one quadrant around cx, cy
const quad = (f, sx, sy, cx, cy) => (x, y) => f(x, y) && (x - cx) * sx >= 0 && (y - cy) * sy >= 0
// Space invader grid
const invader = [
  '..#.....#..',
  '...#...#...',
  '..#######..',
  '.##.###.##.',
  '###########',
  '#.#######.#',
  '#.#.....#.#',
  '...##.##...',
]
// Invader grid scaled by k onto a mask
const invaderMask = (size, x0, y0, k) => {
  const m = new Uint8Array(size * size)
  invader.forEach((row, y) => [...row].forEach((c, x) => {
    if (c !== '#') return
    for (const dy of range(0, k)) for (const dx of range(0, k)) m[(y0 + y * k + dy) * size + x0 + x * k + dx] = 1
  }))
  return m
}
// Pile of poo: three tiers, ink seams where an upper tier sits on a lower one
const poo = (size, tiers, swirl, fill) => {
  const ms = tiers.map(t => mask(size, t))
  const top = mask(size, swirl)
  const whole = ms.reduce(plus, top)
  const seams = []
  for (const i of range(0, ms.length - 1)) {
    const upper = i === 0 ? plus(top, ms[0]) : ms[i]
    seams.push(...path(size, minus(dilate(size, upper), upper).map((v, j) => v && ms[i + 1][j] ? 1 : 0)))
  }
  return [...outlined(size, whole, fill), F(ink, ...seams)]
}
Object.assign(icons, {
  'emoji/pile-of-poo': {
    16: pix(16, 2, 1, [
      '......##....',
      '.....#pp#...',
      '....#ppp#...',
      '...##pppp#..',
      '..#pppppp##.',
      '..#ppppppp#.',
      '.##ppppppp##',
      '#pppppppppp#',
      '#pp#pppp#pp#',
      '#pppppppppp#',
      '#p#pppppp#p#',
      '#pp######pp#',
      '.##########.',
    ], null, { p: ['S', n2] }),
    32: [
      ...poo(32, [ell(16, 13, 6.5, 3.5), ell(16, 18.5, 9.5, 4), ell(16, 24.5, 12.5, 4.5)], poly([[17, 3.5], [19.5, 5], [21, 12], [12, 12]]), n2),
      F(ink, ...path(32, plus(mask(32, ell(11.5, 22, 2, 2)), mask(32, ell(20.5, 22, 2, 2))))),
      F(white, r(10, 21, 1, 1), r(19, 21, 1, 1)),
      F(ink, r(12, 25, 1, 1), r(13, 26, 6, 1), r(19, 25, 1, 1)),
    ],
  },
  'emoji/ghost': {
    16: pix(16, 1, 1, [
      '....###.......',
      '..##www##.....',
      '.#wwwwwww#....',
      '#wwwwwwwww#...',
      '#w##ww##ww###.',
      '#w##ww##wwwww#',
      '#wwwwwwwwwwww#',
      '#www##wwww###.',
      '#www##wwww#...',
      '#wwwwwwwww#...',
      '#wwwwwwwww#...',
      '#wwwwwwwww#...',
      '#w##www##w#...',
      '.#..###..#....',
    ], null, { w: ['S', white, white, g5] }),
    32: [
      ...outlined(32, mask(32, all(any(ell(16, 13, 10.5, 9.5), poly([[5.5, 12], [26.5, 12], [26.5, 27.5], [5.5, 27.5]]), ell(26, 15, 3, 3)), not(any(ell(9, 29, 3, 3), ell(16, 29, 3, 3), ell(23, 29, 3, 3))))), white, white, g5),
      F(ink, ...path(32, plus(mask(32, ell(12, 12, 2.5, 3)), mask(32, ell(20, 12, 2.5, 3)))), ...path(32, mask(32, ell(16, 20, 2.5, 3)))),
    ],
  },
  'emoji/goblin': {
    16: pix(16, 1, 1, [
      '#............#',
      '##..........##',
      '#r#........#r#',
      '#rr########rr#',
      '#rrrrrrrrrrrr#',
      '.#r#rrrrrr#r#.',
      '.#rr#rrrr#rr#.',
      '.#rr##rr##rr#.',
      '.#rrr#rr#rrr#.',
      '.#rrr#rr#rrr#.',
      '..#rr#rr#rr#..',
      '..#rr####rr#..',
      '...#rwrrwr#...',
      '....######....',
    ], null, { r: ['S', r2], w: ['F', white] }),
    32: pix(32, 2, 2, [
      '##........................##',
      '###......................###',
      '#r##....................##r#',
      '#rr##..................##rr#',
      '#rrr######........######rrr#',
      '#rrrrr################rrrrr#',
      '#rrrrrrrrrrrrrrrrrrrrrrrrrr#',
      '.#rrrrrrrrrrrrrrrrrrrrrrrr#.',
      '.#rrr##rrrrrrrrrrrrrr##rrr#.',
      '.#rrrr##rrrrrrrrrrrr##rrrr#.',
      '.#rrrrr##rrrrrrrrrr##rrrrr#.',
      '.#rrrr#eee#rrrrrr#eee#rrrr#.',
      '.#rrrr#e#e#rrrrrr#e#e#rrrr#.',
      '..#rrrr###rr#rr#rr###rrrr#..',
      '..#rrrrrrrrr#rr#rrrrrrrrr#..',
      '..#rrrrrrrrr#rr#rrrrrrrrr#..',
      '...#rrrrrrrr#rr#rrrrrrrr#...',
      '...#rrrrrrrr#rr#rrrrrrrr#...',
      '...#rrrrrrr#rrrr#rrrrrrr#...',
      '....#rrrrrr#rrrr#rrrrrr#....',
      '....#rrrrrr######rrrrrr#....',
      '....#rrrrrrrrrrrrrrrrrr#....',
      '.....#rr############rr#.....',
      '.....#rr#ww######ww#rr#.....',
      '......#rr#w#rrrr#w#rr#......',
      '.......#rr###rr###rr#.......',
      '........##rrrrrrrr##........',
      '..........########..........',
    ], null, { r: ['S', r2], e: ['F', a3], w: ['F', white] }),
  },
  'emoji/alien': {
    16: pix(16, 2, 1, [
      '...######...',
      '.##gggggg##.',
      '#gggggggggg#',
      '#gggggggggg#',
      '#g##gggg##g#',
      '#g###gg###g#',
      '#gg##gg##gg#',
      '.#gg#gg#gg#.',
      '.#gggggggg#.',
      '..#gg##gg#..',
      '...#gggg#...',
      '....#gg#....',
      '.....##.....',
    ], null, { g: ['S', gr3] }),
    32: [
      ...outlined(32, mask(32, any(ell(16, 13, 11.5, 9.5), poly([[5, 14], [27, 14], [17.5, 28.5], [14.5, 28.5]]))), gr3),
      F(ink, ...path(32, plus(mask(32, shear(ell(10.5, 16, 2.8, 5.5), 10.5, 16, -0.45)), mask(32, shear(ell(21.5, 16, 2.8, 5.5), 21.5, 16, 0.45)))), r(15, 25, 2, 1)),
    ],
  },
  'emoji/alien-monster': {
    16: [...outlined(16, invaderMask(16, 2, 3, 1), p2), F(white, r(5, 6, 1, 1), r(9, 6, 1, 1))],
    32: [...outlined(32, invaderMask(32, 5, 8, 2), p2), F(white, r(11, 14, 2, 2), r(19, 14, 2, 2))],
  },
  'emoji/robot': {
    16: pix(16, 2, 1, [
      '....####....',
      '....#aa#....',
      '.....##.....',
      '..########..',
      '.#gggggggg#.',
      '.#gEEggEEg#.',
      '##gEEggEEg##',
      '##gggggggg##',
      '.#gggggggg#.',
      '.#g######g#.',
      '.#g#g##g#g#.',
      '.#g######g#.',
      '.#gggggggg#.',
      '..########..',
    ], null, { g: ['S', g4], E: ['F', b3], a: ['S', r2] }),
    32: [
      ...outlined(32, mask(32, ell(16, 5, 2, 2)), r2),
      F(ink, r(15, 7, 2, 2)),
      ...outlined(32, plus(mask(32, rrect(3.5, 14.5, 5.5, 21.5, 1)), mask(32, rrect(26.5, 14.5, 28.5, 21.5, 1))), g3),
      ...outlined(32, mask(32, rrect(7, 9.5, 25, 27, 3)), g4),
      F(ink, r(8, 12, 6, 6), r(18, 12, 6, 6)),
      ...surface(32, mask(32, poly([[9, 13], [13, 13], [13, 17], [9, 17]])), b3),
      ...surface(32, mask(32, poly([[19, 13], [23, 13], [23, 17], [19, 17]])), b3),
      F(white, r(9, 13, 1, 1), r(19, 13, 1, 1)),
      F(ink, r(10, 20, 12, 5)),
      F(g5, r(11, 21, 10, 3)),
      F(ink, r(13, 21, 1, 3), r(16, 21, 1, 3), r(19, 21, 1, 3)),
    ],
  },
})

// Small hearts and the extra heart family
const heart7 = [
  '.##.##.',
  '#rr#rr#',
  '#rrrrr#',
  '.#rrr#.',
  '..#r#..',
  '...#...',
]
// Seven pixel heart
const mini = (size, x, y, fill) => pix(size, x, y, heart7, null, { r: ['S', fill] })
// Full heart at any position
const heart16at = (size, x, y, fill) => pix(size, x, y, heart16, fill, { w: ['F', white] })
// Ribbon bow
const bow16 = pix(16, 5, 1, ['.##.##.', '#aa#aa#', '.##.##.'], null, { a: ['S', a3] })
const bow32 = pix(32, 10, 2, [
  '..###...###..',
  '.#aaa#.#aaa#.',
  '#aaaa#k#aaaa#',
  '#aaaa#k#aaaa#',
  '.#aaa#.#aaa#.',
  '..###...###..',
], null, { a: ['S', a3], k: ['F', a2] })
Object.assign(icons, {
  'emoji/heart-yellow': heart(a3),
  'emoji/heart-green': heart(gr2),
  'emoji/heart-blue': heart(b3),
  'emoji/heart-purple': heart(p2),
  'emoji/heart-sparkling': {
    16: [...heart(r4, r4, r3, 1)[16], H(a3, r(12, 2, 1, 3), r(11, 3, 3, 1), r(3, 10, 1, 3), r(2, 11, 3, 1))],
    32: [...heart(r4, r4, r3)[32], H(a3, ...path(32, mask(32, sparkle4(26, 6, 2.6))), ...path(32, mask(32, sparkle4(6, 25, 2.6))))],
  },
  'emoji/heart-arrow': {
    16: [
      H(ink, diag(3, 12, 10, 1, -1, 1), r(2, 11, 1, 3), r(2, 13, 3, 1)),
      ...heart(r2)[16],
      H(ink, ...[0, 1, 2, 3].map(i => r(10 + i, 2 + i, 4 - i, 1))),
    ],
    32: [
      H(ink, diag(4, 26, 22, 1, -1, 2), r(3, 22, 2, 7), r(3, 27, 7, 2)),
      ...heart(r2)[32],
      H(ink, ...[0, 1, 2, 3, 4, 5, 6].map(i => r(22 + i, 4 + i, 7 - i, 1))),
    ],
  },
  'emoji/heart-ribbon': {
    16: [...heart(r2)[16], F(ink, r(3, 6, 10, 1), r(5, 9, 6, 1)), F(a3, r(3, 7, 10, 1), r(4, 8, 8, 1)), ...bow16],
    32: [...heart(r2)[32], F(ink, r(3, 13, 26, 1), r(7, 18, 18, 1)), ...surface(32, mask(32, poly([[4, 14], [28, 14], [28, 16], [27, 16], [27, 17], [26, 17], [26, 18], [6, 18], [6, 17], [5, 17], [5, 16], [4, 16]])), a3), ...bow32],
  },
  'emoji/heart-beating': {
    16: [...heart(r2)[16], H(ink, r(3, 5, 1, 1), r(2, 6, 1, 3), r(3, 9, 1, 1), r(12, 5, 1, 1), r(13, 6, 1, 3), r(12, 9, 1, 1))],
    32: [...heart(r2)[32], H(ink, r(6, 9, 1, 1), r(5, 10, 1, 1), r(4, 11, 1, 5), r(5, 16, 1, 1), r(6, 17, 1, 1), r(25, 9, 1, 1), r(26, 10, 1, 1), r(27, 11, 1, 5), r(26, 16, 1, 1), r(25, 17, 1, 1))],
  },
  'emoji/heart-revolving': {
    16: [
      H(ink, r(9, 2, 3, 1), r(12, 3, 1, 1), r(13, 4, 1, 3), r(12, 5, 1, 1), r(14, 5, 1, 1), r(4, 13, 3, 1), r(3, 12, 1, 1), r(2, 9, 1, 3), r(1, 10, 1, 1), r(3, 10, 1, 1)),
      ...mini(16, 1, 2, r2),
      ...mini(16, 8, 8, r2),
    ],
    32: [
      H(ink, ...path(32, mask(32, quad(ring(19, 11, 8, 0.6), 1, -1, 19, 11))), r(25, 12, 1, 1), r(26, 13, 1, 1), r(27, 14, 1, 1), r(28, 13, 1, 1), r(29, 12, 1, 1),
        ...path(32, mask(32, quad(ring(13, 20, 8, 0.6), -1, 1, 13, 20))), r(3, 19, 1, 1), r(4, 18, 1, 1), r(5, 17, 1, 1), r(6, 18, 1, 1), r(7, 19, 1, 1)),
      ...heart16at(32, 2, 3, r2),
      ...heart16at(32, 18, 17, r2),
    ],
  },
  'emoji/two-hearts': {
    16: [...heart(r4, r4, r3, 1)[16], ...mini(16, 8, 1, r2)],
    32: [...heart(r4, r4, r3, 2)[32], ...heart16at(32, 17, 2, r2)],
  },
})

write(process.argv[2], icons)
