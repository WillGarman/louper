import type { ShadowContainer } from './shadow'
import type { LoupeState } from './types'
import { computeCloneTransform } from './dom'
import { DEFAULTS } from './types'
import type { LoupeOptions } from './types'

export interface Renderer {
  scheduleUpdate: () => void
  destroy: () => void
}

export function createRenderer(
  container: ShadowContainer,
  state: LoupeState,
  opts: LoupeOptions,
): Renderer {
  let rafId: number | null = null
  let pending = false
  let currentOpts = { ...DEFAULTS, ...opts }

  function render() {
    pending = false
    rafId = null

    const { zoomLevel, radius, borderWidth } = currentOpts
    const { mouseX, mouseY, scrollX, scrollY } = state

    // Position the host centered on cursor
    const hostX = mouseX - radius - borderWidth
    const hostY = mouseY - radius - borderWidth
    container.host.style.transform = `translate(${hostX}px, ${hostY}px)`

    // Position the clone so the cursor maps to circle center
    const { cloneX, cloneY } = computeCloneTransform(
      mouseX,
      mouseY,
      scrollX,
      scrollY,
      zoomLevel,
      radius,
    )
    container.cloneContainer.style.transform = `scale(${zoomLevel}) translate(${cloneX / zoomLevel}px, ${cloneY / zoomLevel}px)`
  }

  function scheduleUpdate() {
    if (!pending) {
      pending = true
      rafId = requestAnimationFrame(render)
    }
  }

  function destroy() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
  }

  return {
    scheduleUpdate,
    destroy,
  }
}
