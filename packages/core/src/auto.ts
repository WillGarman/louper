import { louper, type LoupeOptions } from '.'

function getScriptOptions(): LoupeOptions {
  const el = document.currentScript as HTMLScriptElement | null
  if (!el) return {}
  const { zoom, radius, borderWidth, borderColor, hotkey } = el.dataset
  const opts: LoupeOptions = {}
  if (zoom) opts.zoomLevel = Number(zoom)
  if (radius) opts.radius = Number(radius)
  if (borderWidth) opts.borderWidth = Number(borderWidth)
  if (borderColor) opts.borderColor = borderColor
  if (hotkey) opts.hotkey = hotkey as LoupeOptions['hotkey']
  return opts
}

const instance = louper(getScriptOptions())
;(window as any).__louper = instance
