import { describe, it, expect, vi, afterEach } from 'vitest'
import { bindEvents } from '../events'
import type { LoupeState } from '../types'

function makeState(): LoupeState {
  return { active: false, mouseX: 0, mouseY: 0, scrollX: 0, scrollY: 0 }
}

function makeCallbacks(overrides = {}) {
  return {
    onActivate: vi.fn(),
    onDeactivate: vi.fn(),
    onMouseMove: vi.fn(),
    onZoom: vi.fn(),
    ...overrides,
  }
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
    cleanup = bindEvents('Alt', state, makeCallbacks({ onActivate }))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    expect(onActivate).toHaveBeenCalledOnce()
    expect(state.active).toBe(true)
  })

  it('calls onDeactivate when hotkey is released', () => {
    const state = makeState()
    const onDeactivate = vi.fn()
    cleanup = bindEvents('Alt', state, makeCallbacks({ onDeactivate }))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }))
    expect(onDeactivate).toHaveBeenCalledOnce()
    expect(state.active).toBe(false)
  })

  it('does not activate on wrong key', () => {
    const state = makeState()
    const onActivate = vi.fn()
    cleanup = bindEvents('Alt', state, makeCallbacks({ onActivate }))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }))
    expect(onActivate).not.toHaveBeenCalled()
  })

  it('tracks mouse position', () => {
    const state = makeState()
    cleanup = bindEvents('Alt', state, makeCallbacks())

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 42, clientY: 84 }))
    expect(state.mouseX).toBe(42)
    expect(state.mouseY).toBe(84)
  })

  it('calls onMouseMove only when active', () => {
    const state = makeState()
    const onMouseMove = vi.fn()
    cleanup = bindEvents('Alt', state, makeCallbacks({ onMouseMove }))

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 20 }))
    expect(onMouseMove).not.toHaveBeenCalled()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 40 }))
    expect(onMouseMove).toHaveBeenCalledWith(30, 40)
  })

  it('deactivates on window blur (Alt+Tab guard)', () => {
    const state = makeState()
    const onDeactivate = vi.fn()
    cleanup = bindEvents('Alt', state, makeCallbacks({ onDeactivate }))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    window.dispatchEvent(new Event('blur'))
    expect(onDeactivate).toHaveBeenCalledOnce()
    expect(state.active).toBe(false)
  })

  it('calls onZoom with deltaY when wheel is used while active', () => {
    const state = makeState()
    const onZoom = vi.fn()
    cleanup = bindEvents('Alt', state, makeCallbacks({ onZoom }))

    // Not active - should not fire
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))
    expect(onZoom).not.toHaveBeenCalled()

    // Activate, then wheel
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: -50 }))
    expect(onZoom).toHaveBeenCalledWith(-50)
  })

  it('cleans up all listeners on unbind', () => {
    const state = makeState()
    const onActivate = vi.fn()
    cleanup = bindEvents('Alt', state, makeCallbacks({ onActivate }))

    cleanup()
    cleanup = null

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    expect(onActivate).not.toHaveBeenCalled()
  })
})
