import type { LoupeOptions, LoupeInstance, LoupeState } from './types'
import { DEFAULTS } from './types'
import { createShadowContainer, destroyShadowContainer, updateShadowStyles } from './shadow'
import { cloneDocument } from './dom'
import { bindEvents } from './events'
import { createRenderer } from './renderer'

export function createLouper(userOpts: LoupeOptions = {}): LoupeInstance {
  let opts = { ...DEFAULTS, ...userOpts }
  const state: LoupeState = {
    active: false,
    mouseX: 0,
    mouseY: 0,
    scrollX: 0,
    scrollY: 0,
  }

  const container = createShadowContainer(opts)
  const renderer = createRenderer(container, state, opts)

  const unbindEvents = bindEvents(opts.hotkey, state, {
    onActivate() {
      renderer.setZoomLevel(opts.zoomLevel)
      cloneDocument(container)
      container.host.classList.add('louper-active')
      renderer.scheduleUpdate()
    },
    onDeactivate() {
      container.host.classList.remove('louper-active')
      // Clear clone after fade-out completes
      setTimeout(() => {
        if (!state.active) {
          container.cloneContainer.innerHTML = ''
        }
      }, opts.fadeOutDuration)
    },
    onMouseMove() {
      renderer.scheduleUpdate()
    },
    onZoom(deltaY: number) {
      const current = renderer.getZoomLevel()
      const next = Math.min(
        opts.maxZoom,
        Math.max(opts.minZoom, current * (1 - deltaY * opts.zoomSensitivity)),
      )
      renderer.setZoomLevel(next)
      renderer.scheduleUpdate()
    },
  })

  function destroy() {
    unbindEvents()
    renderer.destroy()
    destroyShadowContainer(container)
  }

  function update(newOpts: Partial<LoupeOptions>) {
    opts = { ...opts, ...newOpts }
    updateShadowStyles(container, opts)
  }

  return { destroy, update }
}
