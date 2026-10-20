// Emoji faces, first set: grinning, smiling, kissing, money, thinking, neutral, smirking, sleepy and halo faces on the shared yellow disc
import { ink, g4, white, b3, b4, b5, b6, gr2, a2, a3, r2, r3, r, circle, S, F, H, write, face, eyes, smile } from './lib.mjs'

// One pixel rect
const px = (x, y) => r(x, y, 1, 1)
// left feature plus its mirror partner dx to the right
const pair = (dx, ...rects) => rects.map(([x, y, w, h]) => r(x, y, w, h) + r(x + dx, y, w, h)).join('')
// rotate rects 180 degrees about the canvas centre
const rot = (size, ...rects) => rects.map(([x, y, w, h]) => r(size - x - w, size - y - h, w, h)).join('')
// character grid to pixel path for one character
const pix = (x0, y0, rows, ch) => rows.flatMap((row, y) => [...row].map((c, x) => c === ch ? px(x0 + x, y0 + y) : '')).join('')

// Eyes
const arcUp = {
  16: F(ink, pair(5, [5, 6, 1, 1], [4, 7, 1, 1], [6, 7, 1, 1])),
  32: F(ink, pair(9, [10, 11, 3, 1], [9, 12, 2, 1], [12, 12, 2, 1], [8, 13, 2, 1], [13, 13, 2, 1])),
}
const arcDown = {
  16: F(ink, pair(5, [4, 6, 1, 1], [6, 6, 1, 1], [5, 7, 1, 1])),
  32: F(ink, pair(9, [8, 11, 2, 1], [13, 11, 2, 1], [9, 12, 2, 1], [12, 12, 2, 1], [10, 13, 3, 1])),
}
const lines = { 16: F(ink, pair(5, [4, 7, 3, 1])), 32: F(ink, pair(9, [9, 12, 5, 2])) }
const wink = { 16: F(ink, r(5, 6, 2, 2), r(9, 7, 2, 1)), 32: F(ink, r(10, 11, 3, 3), r(18, 12, 5, 2)) }
const xEyes = {
  16: F(ink, pair(5, [4, 5, 1, 1], [6, 5, 1, 1], [5, 6, 1, 1], [4, 7, 1, 1], [6, 7, 1, 1])),
  32: F(ink, pair(9, [9, 10, 1, 2], [13, 10, 1, 2], [10, 11, 1, 2], [12, 11, 1, 2], [11, 12, 1, 2], [10, 13, 1, 2], [12, 13, 1, 2], [9, 14, 1, 2], [13, 14, 1, 2])),
}
const heartEyes = {
  16: F(r2, pair(6, [3, 6, 2, 1], [6, 6, 2, 1], [3, 7, 5, 1], [4, 8, 3, 1], [5, 9, 1, 1])),
  32: F(r2, pair(10, [8, 9, 2, 1], [12, 9, 2, 1], [7, 10, 8, 2], [8, 12, 6, 1], [9, 13, 4, 1], [10, 14, 2, 1])),
}
const dollarEyes = {
  16: F(gr2, pair(5, [5, 4, 2, 1], [4, 5, 1, 1], [5, 6, 1, 1], [6, 7, 1, 1], [4, 8, 2, 1])),
  32: F(gr2, pair(10, [10, 6, 2, 2], [9, 8, 5, 2], [8, 9, 2, 2], [9, 11, 5, 2], [12, 12, 2, 2], [9, 14, 5, 2], [10, 16, 2, 2])),
}
const sideEyes = {
  16: [F(white, pair(4, [4, 6, 2, 2])), F(ink, pair(4, [6, 6, 1, 2]))],
  32: [F(white, pair(9, [8, 11, 3, 3])), F(ink, pair(9, [11, 11, 3, 3]))],
}
const upEyes = {
  16: [F(white, pair(4, [5, 6, 2, 2])), F(ink, pair(4, [5, 5, 2, 1]))],
  32: [F(white, pair(9, [10, 11, 3, 3])), F(ink, pair(9, [10, 10, 3, 2]))],
}

// Mouths
const smallSmile = { 16: F(ink, px(5, 10), r(6, 11, 4, 1), px(10, 10)), 32: F(ink, r(10, 20, 2, 2), r(12, 22, 8, 2), r(20, 20, 2, 2)) }
const frown = { 16: F(ink, px(5, 12), r(6, 11, 4, 1), px(10, 12)), 32: F(ink, r(10, 22, 2, 2), r(12, 21, 8, 2), r(20, 22, 2, 2)) }
const flat = { 16: F(ink, r(5, 11, 6, 1)), 32: F(ink, r(11, 22, 10, 2)) }
const open = {
  16: F(ink, r(4, 10, 8, 2), r(5, 12, 6, 1)),
  32: F(ink, r(8, 19, 16, 2), r(9, 21, 14, 1), r(10, 22, 12, 1), r(11, 23, 10, 1), r(12, 24, 8, 1)),
}
const band = (c16, c32) => ({
  16: [F(ink, r(4, 10, 8, 1), px(4, 11), px(11, 11), r(5, 12, 6, 1)), F(c16, r(5, 11, 6, 1))],
  32: [F(ink, r(8, 19, 16, 2), r(8, 21, 2, 2), r(22, 21, 2, 2), r(9, 23, 14, 2), r(10, 25, 12, 1)), F(c32, r(10, 21, 12, 2))],
})
const grin = band(white, white)
const beam = {
  16: [F(ink, r(3, 10, 10, 1), px(3, 11), px(12, 11), r(4, 12, 8, 1)), F(white, r(4, 11, 8, 1))],
  32: [F(ink, r(6, 19, 20, 2), r(6, 21, 2, 3), r(24, 21, 2, 3), r(7, 24, 18, 1), r(9, 25, 14, 1)), F(white, r(8, 21, 16, 3))],
}
const laugh = {
  16: [F(ink, r(4, 10, 8, 1), px(3, 11), px(12, 11), r(4, 12, 8, 1)), F(white, r(4, 11, 8, 1)), F(r3, r(6, 12, 4, 1))],
  32: [F(ink, r(8, 18, 16, 1), r(7, 19, 1, 2), r(24, 19, 1, 2), r(7, 21, 18, 4), r(8, 25, 16, 1), r(10, 26, 12, 1)), F(white, r(8, 19, 16, 2)), F(r3, r(12, 23, 8, 2), r(13, 25, 6, 1))],
}
const pucker = (x16, x32) => ({
  16: [F(ink, r(x16 + 1, 10, 2, 1), px(x16, 11), px(x16 + 3, 11), r(x16 + 1, 12, 2, 1))],
  32: [F(ink, circle(6, x32, 19)), F(a3, r(x32 + 2, 21, 2, 2))],
})
const heart = {
  16: F(r2, px(9, 10), px(11, 10), r(9, 11, 3, 1), px(10, 12)),
  32: F(r2, r(18, 19, 2, 1), r(21, 19, 2, 1), r(17, 20, 7, 2), r(18, 22, 5, 1), r(19, 23, 3, 1), px(20, 24)),
}

// Extras
const sweat = {
  16: [F(ink, px(13, 1), px(12, 2), px(14, 2), r(11, 3, 1, 2), r(14, 3, 1, 2), r(12, 5, 2, 1)), F(b4, px(13, 2), r(12, 3, 2, 2))],
  32: [
    F(ink, r(25, 2, 2, 1), r(24, 3, 4, 2), r(23, 5, 6, 1), r(22, 6, 8, 3), r(23, 9, 6, 1), r(24, 10, 4, 1), r(25, 11, 2, 1)),
    S(b4, r(25, 3, 2, 2), r(24, 5, 4, 1), r(23, 6, 6, 3), r(24, 9, 4, 1), r(25, 10, 2, 1)),
  ],
}
// Hand grids: # is ink, a is skin
const hand32 = [
  '.####......',
  '#aaaa#.....',
  '#aaaa#.....',
  '#aaaa######',
  '#aaaaaaaaa#',
  '#aaaaaaaaa#',
  '#aaaaaaaaa#',
  '#aaaaaaaaa#',
  '#aaaaaaaaa#',
  '#aaaaaaaaa#',
  '#aaaaaaaaa#',
  '#aaaaaaaaa#',
  '.#aaaaaaa#.',
  '..#######..',
]
const hand16 = [
  '.##...',
  '.#a###',
  '#aaaa#',
  '#aaaa#',
  '#aaaa#',
  '.####.',
]
// Open mitt at column x
const mitt16 = x => [F(ink, r(x + 1, 8, 2, 1), r(x, 9, 1, 4), r(x + 3, 9, 1, 4), r(x + 1, 13, 2, 1)), F(a3, r(x + 1, 9, 2, 4))]
const mitt32 = x => [F(ink, r(x + 1, 16, 4, 1), r(x, 17, 1, 10), r(x + 5, 17, 1, 10), r(x + 1, 27, 4, 1)), S(a3, r(x + 1, 17, 4, 10)), F(a2, r(x + 2, 18, 1, 5), r(x + 4, 18, 1, 5))]

const faces = {
  'face-grinning': { 16: [eyes[16], ...grin[16]], 32: [eyes[32], ...grin[32]] },
  'face-beaming': { 16: [arcUp[16], ...beam[16]], 32: [arcUp[32], ...beam[32]] },
  'face-squinting': { 16: [xEyes[16], ...laugh[16]], 32: [xEyes[32], ...laugh[32]] },
  'face-grinning-sweat': { 16: [eyes[16], ...grin[16], ...sweat[16]], 32: [eyes[32], ...grin[32], ...sweat[32]] },
  'face-slightly-smiling': { 16: [eyes[16], smallSmile[16]], 32: [eyes[32], smallSmile[32]] },
  'face-upside-down': {
    16: [F(ink, rot(16, [5, 6, 2, 2], [9, 6, 2, 2], [5, 10, 1, 1], [6, 11, 4, 1], [10, 10, 1, 1]))],
    32: [F(ink, rot(32, [10, 11, 3, 3], [19, 11, 3, 3], [10, 20, 2, 2], [12, 22, 8, 2], [20, 20, 2, 2]))],
  },
  'face-winking': { 16: [wink[16], smile[16]], 32: [wink[32], smile[32]] },
  'face-heart-eyes': { 16: [heartEyes[16], F(ink, r(4, 11, 8, 1), r(5, 12, 6, 1))], 32: [heartEyes[32], open[32]] },
  'face-blowing-kiss': { 16: [wink[16], ...pucker(4, 8)[16], heart[16]], 32: [wink[32], ...pucker(4, 8)[32], heart[32]] },
  'face-kissing': { 16: [eyes[16], ...pucker(6, 13)[16]], 32: [eyes[32], ...pucker(6, 13)[32]] },
  'face-savoring-food': { 16: [eyes[16], smile[16], F(r3, r(9, 11, 2, 2))], 32: [eyes[32], smile[32], F(r3, r(16, 24, 5, 3), r(17, 27, 3, 1))] },
  'face-tongue': {
    16: [eyes[16], F(ink, r(4, 10, 8, 1), r(4, 11, 2, 1), r(10, 11, 2, 1), px(5, 12), px(10, 12)), F(r3, r(6, 11, 4, 2))],
    32: [eyes[32], F(ink, r(9, 19, 14, 1), r(8, 20, 16, 2), r(9, 22, 14, 1)), F(r3, r(12, 21, 8, 5)), F(ink, r(11, 22, 1, 4), r(20, 22, 1, 4), r(12, 26, 8, 1)), F(r2, r(15, 22, 2, 3))],
  },
  'face-money': { 16: [dollarEyes[16], ...band(gr2, gr2)[16]], 32: [dollarEyes[32], F(ink, r(8, 20, 16, 6)), F(gr2, r(10, 22, 12, 2))] },
  'face-open-hands': { 16: [eyes[16], smallSmile[16], ...mitt16(1), ...mitt16(11)], 32: [eyes[32], smile[32], ...mitt32(2), ...mitt32(24)] },
  'face-thinking': {
    16: [F(ink, r(4, 4, 3, 1), r(9, 3, 3, 1)), eyes[16], F(ink, r(4, 11, 4, 1)), F(a3, pix(9, 9, hand16, 'a')), F(ink, pix(9, 9, hand16, '#'))],
    32: [F(ink, r(9, 8, 5, 2), r(18, 6, 5, 2)), eyes[32], F(ink, r(8, 22, 7, 2)), S(a3, pix(18, 15, hand32, 'a')), F(ink, pix(18, 15, hand32, '#'))],
  },
  'face-zipper-mouth': {
    16: [eyes[16], F(ink, r(3, 10, 8, 3), px(11, 11), px(12, 11), px(12, 12)), F(g4, px(4, 11), px(6, 11), px(8, 11))],
    32: [eyes[32], F(ink, r(6, 20, 18, 6), r(24, 21, 2, 4), r(26, 22, 3, 4)), F(g4, r(8, 21, 2, 2), r(12, 21, 2, 2), r(16, 21, 2, 2), r(20, 21, 2, 2), r(10, 23, 2, 2), r(14, 23, 2, 2), r(18, 23, 2, 2), r(22, 23, 2, 2), r(27, 23, 1, 2))],
  },
  'face-neutral': { 16: [eyes[16], flat[16]], 32: [eyes[32], flat[32]] },
  'face-expressionless': { 16: [lines[16], flat[16]], 32: [lines[32], flat[32]] },
  'face-no-mouth': { 16: [eyes[16]], 32: [eyes[32]] },
  'face-smirking': {
    16: [...sideEyes[16], F(ink, r(5, 12, 3, 1), r(8, 11, 2, 1), px(10, 10))],
    32: [...sideEyes[32], F(ink, r(10, 24, 4, 2), r(14, 23, 4, 2), r(18, 22, 2, 2), r(20, 21, 2, 2))],
  },
  'face-rolling-eyes': { 16: [...upEyes[16], F(ink, r(6, 11, 4, 1))], 32: [...upEyes[32], F(ink, r(12, 22, 8, 2))] },
  'face-grimacing': {
    16: [eyes[16], F(ink, r(3, 10, 10, 3)), F(white, r(4, 11, 8, 1)), F(ink, px(6, 11), px(9, 11))],
    32: [eyes[32], F(ink, r(7, 18, 18, 9)), F(white, r(9, 20, 14, 2), r(9, 23, 14, 2)), F(ink, r(11, 20, 1, 5), r(14, 20, 1, 5), r(17, 20, 1, 5), r(20, 20, 1, 5))],
  },
  'face-relieved': { 16: [arcDown[16], smallSmile[16]], 32: [arcDown[32], smallSmile[32]] },
  'face-pensive': {
    16: [F(ink, r(4, 4, 3, 1), r(9, 4, 3, 1)), arcDown[16], frown[16]],
    32: [F(ink, r(8, 7, 4, 2), r(12, 8, 2, 2), r(18, 8, 2, 2), r(20, 7, 4, 2)), arcDown[32], frown[32]],
  },
  'face-sleepy': {
    16: [arcDown[16], F(ink, r(5, 11, 2, 2)), F(ink, circle(4, 9, 9)), F(b4, r(10, 10, 2, 2))],
    32: [arcDown[32], F(ink, r(10, 20, 2, 1), r(9, 21, 4, 4), r(10, 25, 2, 1)), F(ink, circle(8, 17, 15)), S(b4, circle(6, 18, 16))],
  },
  'face-sleeping': {
    16: [arcDown[16], F(ink, r(7, 11, 2, 2)), H(b3, r(11, 1, 3, 1), px(12, 2), r(11, 3, 3, 1))],
    32: [arcDown[32], F(ink, r(14, 21, 4, 4)), H(b3, r(22, 2, 6, 2), r(25, 4, 2, 1), r(24, 5, 2, 1), r(22, 6, 6, 2), r(25, 9, 4, 1), px(27, 10), px(26, 11), r(25, 12, 4, 1))],
  },
  'face-smiling-eyes': {
    16: [arcUp[16], open[16], F(r3, r(3, 9, 2, 1), r(11, 9, 2, 1))],
    32: [arcUp[32], open[32], F(r3, r(5, 16, 3, 2), r(24, 16, 3, 2))],
  },
  'face-halo': {
    16: [arcUp[16], smallSmile[16], F(ink, r(4, 1, 8, 1), px(3, 2), px(12, 2), r(4, 3, 8, 1)), F(b6, r(4, 2, 3, 1)), F(b5, r(9, 2, 3, 1))],
    32: [
      arcUp[32], smallSmile[32],
      F(ink, r(10, 2, 12, 1), r(8, 3, 2, 1), r(22, 3, 2, 1), r(7, 4, 1, 2), r(24, 4, 1, 2), r(8, 6, 2, 1), r(22, 6, 2, 1), r(10, 7, 12, 1)),
      F(b6, r(10, 3, 12, 1), r(8, 4, 4, 1), r(20, 4, 4, 1)),
      F(b5, r(8, 5, 4, 1), r(20, 5, 4, 1), r(10, 6, 12, 1)),
    ],
  },
}

const icons = {}
for (const [name, v] of Object.entries(faces)) icons[`emoji/${name}`] = { 16: [...face[16], ...v[16]], 32: [...face[32], ...v[32]] }
write(process.argv[2], icons)
