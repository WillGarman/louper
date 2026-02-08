import { generateStyles } from './styles'
import type { LoupeOptions } from './types'

export interface ShadowContainer {
  host: HTMLElement
  root: ShadowRoot
  wrapper: HTMLDivElement
  cloneContainer: HTMLDivElement
  styleEl: HTMLStyleElement
}

export function createShadowContainer(opts: LoupeOptions): ShadowContainer {
  const host = document.createElement('louper-lens')
  const root = host.attachShadow({ mode: 'closed' })

  const styleEl = document.createElement('style')
  styleEl.textContent = generateStyles(opts)
  root.appendChild(styleEl)

  const wrapper = document.createElement('div')
  wrapper.className = 'louper-clone-wrapper'

  const cloneContainer = document.createElement('div')
  cloneContainer.className = 'louper-clone-container'

  wrapper.appendChild(cloneContainer)
  root.appendChild(wrapper)

  document.body.appendChild(host)

  return { host, root, wrapper, cloneContainer, styleEl }
}

export function destroyShadowContainer(container: ShadowContainer): void {
  container.host.remove()
}

export function updateShadowStyles(container: ShadowContainer, opts: LoupeOptions): void {
  container.styleEl.textContent = generateStyles(opts)
}
