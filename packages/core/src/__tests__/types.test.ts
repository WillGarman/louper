import { describe, it, expect } from 'vitest'
import { DEFAULTS } from '../types'

describe('DEFAULTS', () => {
  it('has sensible default values', () => {
    expect(DEFAULTS.zoomLevel).toBe(2)
    expect(DEFAULTS.radius).toBe(150)
    expect(DEFAULTS.borderWidth).toBe(3)
    expect(DEFAULTS.borderColor).toBe('white')
    expect(DEFAULTS.hotkey).toBe('Alt')
    expect(DEFAULTS.fadeOutDuration).toBe(200)
  })
})
