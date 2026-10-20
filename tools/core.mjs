// Core icons: agent and task, globe and link, drive and database, and the status glyphs ok, error, warning, unknown and info
import { ink, g1, g2, g3, g4, g5, g6, white, b1, b2, b3, b4, b5, b6, gr1, gr2, gr3, a2, a3, r2, r3, p2, p3, p4, n2, n3, n4, n5, r, circle, tri, diag, S, F, S1, write } from './lib.mjs'

const icons = {
  'agents/agent': {
    16: [
      F(ink, r(7, 0, 2, 2), r(2, 2, 12, 12)),
      F(r3, r(7, 0, 2, 1)),
      S(b5, r(3, 3, 10, 10)),
      F(ink, r(5, 6, 2, 2), r(9, 6, 2, 2), r(6, 10, 4, 1)),
    ],
    32: [
      F(ink, r(14, 0, 4, 3), r(15, 3, 2, 2), r(4, 5, 24, 24)),
      F(r3, r(15, 1, 2, 1)),
      S(b5, r(5, 6, 22, 22)),
      F(ink, r(10, 13, 4, 4), r(18, 13, 4, 4), r(12, 21, 8, 2)),
      F(white, r(11, 14, 1, 1), r(19, 14, 1, 1)),
    ],
  },
  'agents/task': {
    16: [
      F(ink, r(2, 1, 12, 14)),
      S(n2, r(3, 2, 10, 12)),
      S(white, r(4, 4, 8, 9)),
      F(ink, r(5, 0, 6, 3)),
      F(g3, r(6, 1, 4, 1)),
      F(gr2, diag(5, 8, 3, 1, 1, 2) + diag(8, 9, 3, 1, -1, 2)),
    ],
    32: [
      F(ink, r(4, 3, 24, 27)),
      S(n2, r(5, 4, 22, 25)),
      S(white, r(7, 8, 18, 19)),
      F(ink, r(10, 1, 12, 5)),
      S1(g3, r(11, 2, 10, 3)),
      F(gr2, diag(10, 17, 5, 1, 1, 3) + diag(15, 20, 8, 1, -1, 3)),
    ],
  },
  'network/globe': {
    16: [
      F(ink, circle(12, 2, 2)),
      S(b4, circle(10, 3, 3)),
      F(b2, r(3, 7, 10, 1), r(7, 3, 1, 10)),
      F(gr3, r(4, 4, 3, 2), r(9, 9, 3, 2), r(5, 10, 2, 1), r(9, 4, 2, 1)),
    ],
    32: [
      F(ink, circle(26, 3, 3)),
      S(b4, circle(24, 4, 4)),
      F(b2, r(4, 15, 24, 2), r(15, 4, 2, 24)),
      F(gr3, r(7, 8, 6, 4), r(9, 12, 3, 2), r(19, 18, 6, 5), r(21, 23, 3, 2), r(18, 7, 4, 2), r(7, 19, 4, 3)),
    ],
  },
  'network/link': {
    16: [
      F(ink, 'M1 5h8v6h-8zM3 7h4v2h-4z'),
      S(g4, 'M2 6h6v4h-6zM3 7h4v2h-4z'),
      F(ink, 'M7 5h8v6h-8zM9 7h4v2h-4z'),
      S(g4, 'M8 6h6v4h-6zM9 7h4v2h-4z'),
    ],
    32: [
      F(ink, 'M2 11h14v10h-14zM6 15h6v2h-6z'),
      S1(g4, 'M3 12h12v8h-12zM5 14h8v4h-8z'),
      F(ink, 'M16 11h14v10h-14zM20 15h6v2h-6z'),
      S1(g4, 'M17 12h12v8h-12zM19 14h8v4h-8z'),
    ],
  },
  'storage/drive': {
    16: [
      F(ink, r(1, 3, 14, 10)),
      S(g4, r(2, 4, 12, 8)),
      F(g3, r(3, 6, 6, 1)),
      F(g2, r(3, 9, 8, 1)),
      F(gr3, r(12, 9, 1, 1)),
    ],
    32: [
      F(ink, r(2, 7, 28, 18)),
      S(g4, r(3, 8, 26, 16)),
      F(g3, r(5, 11, 14, 2)),
      F(g2, r(5, 18, 16, 1), r(5, 20, 16, 1)),
      F(gr3, r(24, 18, 2, 2)),
      F(a3, r(24, 21, 2, 1)),
    ],
  },
  'storage/database': {
    16: [
      F(ink, r(3, 2, 10, 1), r(2, 3, 12, 10), r(3, 13, 10, 1)),
      S(p4, r(3, 3, 10, 2)),
      F(ink, r(3, 5, 10, 1)),
      S(p3, r(3, 6, 10, 7)),
      F(p2, r(3, 9, 10, 1)),
    ],
    32: [
      F(ink, r(5, 4, 22, 1), r(4, 5, 24, 22), r(5, 27, 22, 1)),
      S1(p4, r(5, 5, 22, 4)),
      F(ink, r(5, 9, 22, 1)),
      S(p3, r(5, 10, 22, 17)),
      F(p2, r(7, 15, 18, 1), r(7, 21, 18, 1)),
    ],
  },
  'status/ok': {
    16: [
      F(ink, circle(12, 2, 2)),
      S(gr2, circle(10, 3, 3)),
      F(white, diag(5, 7, 3, 1, 1, 2) + diag(8, 8, 3, 1, -1, 2)),
    ],
    32: [
      F(ink, circle(26, 3, 3)),
      S(gr2, circle(24, 4, 4)),
      F(white, diag(9, 15, 5, 1, 1, 3) + diag(14, 18, 9, 1, -1, 3)),
    ],
  },
  'status/error': {
    16: [
      F(ink, circle(12, 2, 2)),
      S(r2, circle(10, 3, 3)),
      F(white, diag(5, 4, 6, 1, 1, 2) + diag(5, 9, 6, 1, -1, 2)),
    ],
    32: [
      F(ink, circle(26, 3, 3)),
      S(r2, circle(24, 4, 4)),
      F(white, diag(10, 9, 11, 1, 1, 3) + diag(10, 19, 11, 1, -1, 3)),
    ],
  },
  'status/warning': {
    16: [
      F(ink, tri(7, 1, 7)),
      S(a3, tri(7, 3, 6, 1)),
      F(ink, r(7, 5, 2, 4), r(7, 10, 2, 2)),
    ],
    32: [
      F(ink, tri(15, 2, 14)),
      S(a3, tri(15, 4, 13, 1)),
      F(ink, r(14, 10, 4, 10), r(14, 22, 4, 4)),
    ],
  },
  'status/unknown': {
    16: [
      F(ink, circle(12, 2, 2)),
      S(a3, circle(10, 3, 3)),
      F(ink, r(6, 5, 4, 1), r(5, 6, 1, 1), r(9, 6, 1, 2), r(8, 8, 1, 1), r(7, 9, 1, 1), r(7, 11, 1, 1)),
    ],
    32: [
      F(ink, circle(26, 3, 3)),
      S(a3, circle(24, 4, 4)),
      F(ink, r(12, 8, 8, 2), r(12, 10, 2, 2), r(18, 10, 2, 3), r(15, 13, 5, 2), r(15, 15, 2, 4), r(15, 21, 2, 2)),
    ],
  },
  'status/info': {
    16: [
      F(ink, circle(12, 2, 2)),
      S(b2, circle(10, 3, 3)),
      F(white, r(7, 4, 2, 2), r(7, 7, 2, 5)),
    ],
    32: [
      F(ink, circle(26, 3, 3)),
      S(b2, circle(24, 4, 4)),
      F(white, r(14, 8, 4, 4), r(14, 14, 4, 10)),
    ],
  },
}

write(process.argv[2], icons)
