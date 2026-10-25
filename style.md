# Nucleus Icons style guide

This document defines how every icon in the set is drawn. The build enforces the
mechanical rules. The rest is judgement, and this guide is the reference for it.

## Philosophy

The set sits between two eras. It borrows the discipline of Windows 98: hard
pixels, one pixel outlines, flat fills and readable silhouettes at 16 pixels.
It borrows the mood of the Frutiger Aero years: sky blues, soft greens, clean
white surfaces and friendly rounded forms. It takes nothing from Windows XP
specifically and nothing from Vista's gloss. No glass, no lens flares, no soft
drop shadows, no gradients.

Call it 256 colour flat Frutiger. If a shape could not be drawn with a pencil
on graph paper in a fixed palette, it does not belong here.

## Canvas and sizes

Every icon exists in two hand drawn variants, and a few brand marks add a
third at 64. The 64 page of the atlas holds only the icons that have one.

| Variant | Canvas | Safe area | Outline | Purpose |
| ------- | ------ | --------- | ------- | ------- |
| 16 | 16 x 16 | 1 px margin, 14 x 14 usable | 1 px | Lists, trees, menus, status bars |
| 32 | 32 x 32 | 2 px margin, 28 x 28 usable | 1 px | Desktop, launchers, dialogs, headers |
| 64 | 64 x 64 | 2 px margin, 60 x 60 usable | 1 px | Brand marks and launcher tiles only, optional |

The 32 variant is never the 16 variant scaled up. Redraw it with more interior
detail and the same silhouette. The 16 variant is never the 32 variant shrunk.
Simplify it until every feature is at least one full pixel.

Icons may touch the margin when the silhouette needs it, for example a window
frame, but should not touch the canvas edge.

## Pixel rules

- Every coordinate is an integer. Every shape is a union of whole pixels.
- The root element carries `shape-rendering="crispEdges"`.
- Outlines are exactly one pixel wide and use `ink` (#1e2430), never pure black.
- Curves are stepped by hand. Circles use symmetric row spans. Diagonals step
  one pixel per row or per column, never fractional.
- Hollow shapes such as rings carry `fill-rule="evenodd"` with the hole as a second subpath.
- No strokes. Draw outlines as filled shapes so they rasterise identically
  everywhere.
- No gradients, filters, opacity, masks, text or embedded images.
- Fills use only colours from `src/palette.json`, written as six digit lowercase
  hex. The build rejects anything else.
- Anti aliasing is not part of the design. The build thresholds alpha at 50
  percent and snaps colours to the palette, so any soft edge becomes a hard one.
  Draw hard edges on purpose rather than leaving it to the rasteriser.

## Light and shading

Light comes from the top left. Every filled surface carries a bevel just inside
its outline, which is what gives the set its depth:

1. Base fill for the surface.
2. Highlight along the top and left edges, one step lighter on the same ramp.
3. Shade along the bottom and right edges, one step darker on the same ramp.

The bevel is exactly one pixel wide at both sizes, so a 32 icon reads as a
more detailed drawing rather than a scaled up 16. The bevel follows curves: on a circle the
highlight hugs the upper left arc and the shade the lower right arc. Where the
two meet, the top row stays light and the bottom row stays dark, exactly as a
Windows 98 button does.

Details drawn on top of a surface, such as eyes, text lines or a check mark,
sit flat and do not get their own bevel. A freestanding ink glyph with no
surface of its own, such as a toolbar letter or arrow, carries a one pixel
gray-6 halo so it stays readable on dark backgrounds. The ui domain is the one exception: its glyphs are pure ink stencils with no
outline, bevel or halo, because the host draws them onto its own control
faces. That is the full shading vocabulary.
No bevels wider than this, no inner glows, no specular dots except a single
white pixel on glass or eyes.

## Palette

The palette lives in `src/palette.json` and is the single source of truth.
It is organised as ramps. Pick a ramp for a surface and stay inside it.

| Ramp | Use |
| ---- | --- |
| ink, gray 1 to 6, white | Outlines, metal, paper, neutral surfaces |
| blue 1 to 6 | Primary brand surfaces, water, sky, information |
| teal 1 to 4 | Secondary accents, networking, data flow |
| green 1 to 4 | Success, online, nature, terminal text |
| amber 1 to 4 | Warnings, pending, lights |
| red 1 to 4 | Errors, danger, stop, recording |
| purple 1 to 4 | Storage, databases, memory |
| tan 1 to 5 | Folders, paper stock, wood, cardboard |
| pink 1 to 3 | Cherry blossom, the Bloom apps, soft accents |

New colours are added to the palette only when a ramp genuinely cannot express
a surface. Atlas index 0 is reserved for transparency, so the palette holds at
most 255 colours.

## Domains

Icons are grouped by domain. A domain is a folder under `src/icons`. Current
domains:

| Domain | Covers |
| ------ | ------ |
| system | Shell objects: folders, pages, archives, scripts, executable, terminal, briefcase, the Bastion tower |
| agents | Agent head and task clipboard |
| network | Globe, link, connected and disconnected |
| storage | Drive, database, network mount, symlink, read only, usb |
| status | State glyphs: ok, warning, error, info, unknown, speech bubbles, light bulbs |
| devices | Hardware: cpu, display, disk, ports, cards, mouse, power, optical, laptops and desktops with OS badges, a range of computers, consoles and headsets |
| control | Control panel applets: globe, security, graphics, agent, playback and find, plus system settings such as language, regional, sound, themes, fonts, displays, associations, performance, profiler and memory |
| actions | Commands: save, delete, properties, cut, copy, paste, undo, redo, next, previous |
| components | Building blocks: db, tensors, package, container, service, library, font, index, plugin, boxes, and 3d primitives, texture, material, wireframe, camera, light |
| mail | Envelopes: closed, open, send, reply, delete, attachment, urgent |
| apps | Bundled applications: monitors, editors, viewers, colour picker, theme, debugger, compiler, web, Nucleus tile, the Bloom suite |
| labels | Numbered and lettered boxes for ordering and keyed lists |
| audio | Speakers and volume states, mixer, headphones, subwoofer, surround, config, asio |
| editor | Toolbar glyphs: text formatting, alignment, lists, charts, tables, document actions, drawing tools |
| traffic | Round indicator lights in six colours |
| emoji | Faces, hearts, hands, people, animals, food, places, symbols and objects on a yellow basis |
| science | Lab glassware, instruments, maths glyphs, signal views, data and beaker actions |
| filemanager | Explorer view modes and sort orders |
| profile | Avatar portraits to pick from: people, bots, pets, sun, moon, system, help |
| ui | Black stencil glyphs for window chrome and controls |
| brand | The Bastion Nucleus mark and other brand marks, with 64 variants |

Add a domain by creating the folder and a matching `stories/<domain>.stories.js`
file so it appears in Storybook.

## Naming

- File names are `<name>.<size>.svg`, lowercase kebab case, for example
  `folder-open.16.svg` and `folder-open.32.svg`.
- Names describe the object, not the action. Prefer `document` over `open-file`.
- Variants of an object append a qualifier: `folder`, `folder-open`,
  `folder-shared`.
- The atlas id is `<domain>/<name>`.

## Source format

Hand written SVG, one `<path>` per colour layer in draw order from back to
front. Build paths from pixel rectangles using `M x y h w v h h -w z`. A
`<title>` holds the icon name. No editor metadata, no ids, no groups.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges">
  <title>info</title>
  <path fill="#1e2430" d="..."/>
  <path fill="#1f5fb8" d="..."/>
  <path fill="#ffffff" d="M7 4h2v2h-2zM7 7h2v5h-2z"/>
</svg>
```

## Review checklist

Before an icon is merged, check it at 4x in Storybook on the light, dark and
checker backgrounds.

- Silhouette reads at 1x without the label.
- Outline is continuous and one pixel wide.
- No colours outside the palette, no stray single pixels.
- Every surface has its one pixel bevel, light top left and dark bottom right.
- 16 and 32 variants read as the same object.
- `npm run check` passes.
