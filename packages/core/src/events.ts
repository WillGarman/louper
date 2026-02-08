import type { LoupeState } from './types'

export type EventCallbacks = {
  onActivate: () => void
  onDeactivate: () => void
  onMouseMove: (x: number, y: number) => void
  onZoom: (deltaY: number) => void
}

export function bindEvents(
  hotkey: string,
  state: LoupeState,
  callbacks: EventCallbacks,
): () => void {
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === hotkey && !state.active) {
      state.active = true
      state.scrollX = window.scrollX
      state.scrollY = window.scrollY
      callbacks.onActivate()
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.key === hotkey && state.active) {
      state.active = false
      callbacks.onDeactivate()
    }
  }

  function onMouseMove(e: MouseEvent) {
    state.mouseX = e.clientX
    state.mouseY = e.clientY
    if (state.active) {
      callbacks.onMouseMove(e.clientX, e.clientY)
    }
  }

  function onBlur() {
    if (state.active) {
      state.active = false
      callbacks.onDeactivate()
    }
  }

  function onScroll() {
    if (state.active) {
      state.scrollX = window.scrollX
      state.scrollY = window.scrollY
      callbacks.onMouseMove(state.mouseX, state.mouseY)
    }
  }

  function onWheel(e: WheelEvent) {
    if (state.active) {
      e.preventDefault()
      callbacks.onZoom(e.deltaY)
    }
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('blur', onBlur)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('wheel', onWheel, { passive: false })

  return () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('blur', onBlur)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('wheel', onWheel)
  }
}
