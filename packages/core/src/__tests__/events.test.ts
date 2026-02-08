import { describe, it, expect, vi, afterEach } from 'vitest'
import { bindEvents } from '../events'
import type { LoupeState } from '../types'

function makeState(): LoupeState {
  return { active: false, mouseX: 0, mouseY: 0, scrollX: 0, scrollY: 0 }
}

describe('bindEvents', () => {
  let cleanup: (() => void) | null = null

  afterEach(() => {
    cleanup?.()
    cleanup = null
  })

  it('calls onActivate when hotkey is pressed', () => {
    const state = makeState()
    const onActivate = vi.fn()
    cleanup = bindEvents('Alt', state, {
      onActivate,
      onDeactivate: vi.fn(),
      onMouseMove: vi.fn(),
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    expect(onActivate).toHaveBeenCalledOnce()
    expect(state.active).toBe(true)
  })

  it('calls onDeactivate when hotkey is released', () => {
    const state = makeState()
    const onDeactivate = vi.fn()
    cleanup = bindEvents('Alt', state, {
      onActivate: vi.fn(),
      onDeactivate,
      onMouseMove: vi.fn(),
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }))
    expect(onDeactivate).toHaveBeenCalledOnce()
    expect(state.active).toBe(false)
  })

  it('does not activate on wrong key', () => {
    const state = makeState()
    const onActivate = vi.fn()
    cleanup = bindEvents('Alt', state, {
      onActivate,
      onDeactivate: vi.fn(),
      onMouseMove: vi.fn(),
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }))
    expect(onActivate).not.toHaveBeenCalled()
  })

  it('tracks mouse position', () => {
    const state = makeState()
    cleanup = bindEvents('Alt', state, {
      onActivate: vi.fn(),
      onDeactivate: vi.fn(),
      onMouseMove: vi.fn(),
    })

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 42, clientY: 84 }))
    expect(state.mouseX).toBe(42)
    expect(state.mouseY).toBe(84)
  })

  it('calls onMouseMove only when active', () => {
    const state = makeState()
    const onMouseMove = vi.fn()
    cleanup = bindEvents('Alt', state, {
      onActivate: vi.fn(),
      onDeactivate: vi.fn(),
      onMouseMove,
    })

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 20 }))
    expect(onMouseMove).not.toHaveBeenCalled()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 40 }))
    expect(onMouseMove).toHaveBeenCalledWith(30, 40)
  })

  it('deactivates on window blur (Alt+Tab guard)', () => {
    const state = makeState()
    const onDeactivate = vi.fn()
    cleanup = bindEvents('Alt', state, {
      onActivate: vi.fn(),
      onDeactivate,
      onMouseMove: vi.fn(),
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    window.dispatchEvent(new Event('blur'))
    expect(onDeactivate).toHaveBeenCalledOnce()
    expect(state.active).toBe(false)
  })

  it('cleans up all listeners on unbind', () => {
    const state = makeState()
    const onActivate = vi.fn()
    cleanup = bindEvents('Alt', state, {
      onActivate,
      onDeactivate: vi.fn(),
      onMouseMove: vi.fn(),
    })

    cleanup()
    cleanup = null

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    expect(onActivate).not.toHaveBeenCalled()
  })
})
