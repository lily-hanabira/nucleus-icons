// Inline styles for the Storybook views, kept as objects so no stylesheet is needed
export const pixel = {
  imageRendering: 'pixelated',
  display: 'block',
}

export const grid = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  fontFamily: 'Verdana, Tahoma, sans-serif',
  fontSize: '12px',
}

export const card = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  padding: '12px',
  border: '1px solid #b8bec9',
}

export const backgrounds = {
  light: { background: '#f4f6f8', color: '#1e2430' },
  dark: { background: '#3a4150', color: '#f4f6f8' },
  checker: {
    background: 'repeating-conic-gradient(#dde1e8 0 25%, #ffffff 0 50%) 0 0 / 16px 16px',
    color: '#1e2430',
  },
}

export const pair = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '12px',
}

export const swatch = {
  width: '96px',
  padding: '6px',
  border: '1px solid #b8bec9',
  background: '#ffffff',
  fontFamily: 'Consolas, monospace',
  fontSize: '11px',
}

export const chip = {
  height: '40px',
  border: '1px solid #1e2430',
  marginBottom: '4px',
}
