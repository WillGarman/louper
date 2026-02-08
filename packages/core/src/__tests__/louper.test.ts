import { describe, it, expect, afterEach } from 'vitest'
import { createLouper } from '../louper'
import type { LoupeInstance } from '../types'

describe('createLouper', () => {
  let instance: LoupeInstance | null = null

  afterEach(() => {
    instance?.destroy()
    instance = null
  })

  it('creates a louper instance with destroy and update methods', () => {
    instance = createLouper()
    expect(instance).toHaveProperty('destroy')
    expect(instance).toHaveProperty('update')
    expect(typeof instance.destroy).toBe('function')
    expect(typeof instance.update).toBe('function')
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
})
