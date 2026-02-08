import { describe, it, expect, afterEach } from 'vitest'
import { louper } from '..'
import type { LoupeInstance } from '..'

describe('louper', () => {
  let instance: LoupeInstance | null = null

  afterEach(() => {
    instance?.destroy()
    instance = null
  })

  it('adds a louper-lens element to the DOM', () => {
    instance = louper()
    expect(document.querySelector('louper-lens')).not.toBeNull()
  })

  it('removes louper-lens from DOM on destroy', () => {
    instance = louper()
    instance.destroy()
    instance = null
    expect(document.querySelector('louper-lens')).toBeNull()
  })

  it('accepts custom options', () => {
    instance = louper({ zoomLevel: 3, radius: 200 })
    expect(document.querySelector('louper-lens')).not.toBeNull()
  })

  it('activates on hotkey press', () => {
    instance = louper()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(true)
  })

  it('deactivates on hotkey release', () => {
    instance = louper()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }))
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(false)
  })

  it('ignores wrong key', () => {
    instance = louper()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }))
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(false)
  })

  it('deactivates on window blur', () => {
    instance = louper()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    window.dispatchEvent(new Event('blur'))
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(false)
  })

  it('stops responding after destroy', () => {
    instance = louper()
    instance.destroy()
    instance = null
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    expect(document.querySelector('louper-lens')).toBeNull()
  })

  it('activates and deactivates programmatically', () => {
    instance = louper()
    const host = document.querySelector('louper-lens')!
    instance.activate()
    expect(host.classList.contains('louper-active')).toBe(true)
    instance.deactivate()
    expect(host.classList.contains('louper-active')).toBe(false)
  })

  it('does not bind hotkey when hotkey is false', () => {
    instance = louper({ hotkey: false })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(false)
    instance.activate()
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(true)
  })
})
