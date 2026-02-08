import { describe, it, expect, afterEach } from 'vitest'
import { createShadowContainer, destroyShadowContainer } from '../shadow'

describe('createShadowContainer', () => {
  let container: ReturnType<typeof createShadowContainer> | null = null

  afterEach(() => {
    if (container) {
      destroyShadowContainer(container)
      container = null
    }
  })

  it('creates a host element in the document body', () => {
    container = createShadowContainer({})
    expect(document.querySelector('louper-lens')).toBe(container.host)
  })

  it('creates a shadow root with internal structure', () => {
    container = createShadowContainer({})
    expect(container.root).toBeDefined()
    expect(container.wrapper.className).toBe('louper-clone-wrapper')
    expect(container.cloneContainer.className).toBe('louper-clone-container')
  })

  it('injects styles into shadow root', () => {
    container = createShadowContainer({})
    const style = container.root.querySelector('style')
    expect(style).not.toBeNull()
    expect(style!.textContent).toContain('border-radius: 50%')
  })
})

describe('destroyShadowContainer', () => {
  it('removes the host from the DOM', () => {
    const container = createShadowContainer({})
    expect(document.querySelector('louper-lens')).not.toBeNull()
    destroyShadowContainer(container)
    expect(document.querySelector('louper-lens')).toBeNull()
  })
})
