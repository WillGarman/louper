import { createLouper } from './louper'
import type { LoupeOptions } from './types'

function getScriptOptions(): LoupeOptions {
  const script = document.currentScript as HTMLScriptElement | null
  if (!script) return {}

  const opts: LoupeOptions = {}
  const zoom = script.getAttribute('data-zoom')
  if (zoom) opts.zoomLevel = Number(zoom)

  const radius = script.getAttribute('data-radius')
  if (radius) opts.radius = Number(radius)

  const borderWidth = script.getAttribute('data-border-width')
  if (borderWidth) opts.borderWidth = Number(borderWidth)

  const borderColor = script.getAttribute('data-border-color')
  if (borderColor) opts.borderColor = borderColor

  const hotkey = script.getAttribute('data-hotkey')
  if (hotkey) opts.hotkey = hotkey as LoupeOptions['hotkey']

  const minZoom = script.getAttribute('data-min-zoom')
  if (minZoom) opts.minZoom = Number(minZoom)

  const maxZoom = script.getAttribute('data-max-zoom')
  if (maxZoom) opts.maxZoom = Number(maxZoom)

  const zoomSensitivity = script.getAttribute('data-zoom-sensitivity')
  if (zoomSensitivity) opts.zoomSensitivity = Number(zoomSensitivity)

  return opts
}

// Auto-init when script loads
const opts = getScriptOptions()
const instance = createLouper(opts)

// Expose for manual control
;(window as any).__louper = instance
