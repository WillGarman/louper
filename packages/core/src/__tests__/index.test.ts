import { describe, it, expect, afterEach } from 'vitest'
import { createLouper } from '..'
import type { LoupeInstance } from '..'

describe('createLouper', () => {
  let instance: LoupeInstance | null = null

  afterEach(() => {
    instance?.destroy()
    instance = null
  })

  it('adds a louper-lens element to the DOM', () => {
    instance = createLouper()
    expect(document.querySelector('louper-lens')).not.toBeNull()
  })

  it('removes louper-lens from DOM on destroy', () => {
    instance = createLouper()
    instance.destroy()
    instance = null
    expect(document.querySelector('louper-lens')).toBeNull()
  })

  it('accepts custom options', () => {
    instance = createLouper({ zoomLevel: 3, radius: 200 })
    expect(document.querySelector('louper-lens')).not.toBeNull()
  })

  it('activates on hotkey press', () => {
    instance = createLouper()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(true)
  })

  it('deactivates on hotkey release', () => {
    instance = createLouper()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }))
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(false)
  })

  it('ignores wrong key', () => {
    instance = createLouper()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }))
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(false)
  })

  it('deactivates on window blur', () => {
    instance = createLouper()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    window.dispatchEvent(new Event('blur'))
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(false)
  })

  it('stops responding after destroy', () => {
    instance = createLouper()
    instance.destroy()
    instance = null
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    expect(document.querySelector('louper-lens')).toBeNull()
  })

  it('activates and deactivates programmatically', () => {
    instance = createLouper()
    const host = document.querySelector('louper-lens')!
    instance.activate()
    expect(host.classList.contains('louper-active')).toBe(true)
    instance.deactivate()
    expect(host.classList.contains('louper-active')).toBe(false)
  })

  it('does not bind hotkey when hotkey is false', () => {
    instance = createLouper({ hotkey: false })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(false)
    instance.activate()
    expect(document.querySelector('louper-lens')!.classList.contains('louper-active')).toBe(true)
  })
})
