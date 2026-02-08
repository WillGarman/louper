import { describe, it, expect } from 'vitest'
import { generateStyles } from '../styles'

describe('generateStyles', () => {
  it('generates CSS with default values', () => {
    const css = generateStyles({})
    expect(css).toContain('width: 300px')
    expect(css).toContain('height: 300px')
    expect(css).toContain('border-radius: 50%')
    expect(css).toContain('border: 3px solid white')
    expect(css).toContain('pointer-events: none')
  })

  it('respects custom radius', () => {
    const css = generateStyles({ radius: 200 })
    expect(css).toContain('width: 400px')
    expect(css).toContain('height: 400px')
  })

  it('respects custom border options', () => {
    const css = generateStyles({ borderWidth: 5, borderColor: 'red' })
    expect(css).toContain('border: 5px solid red')
  })

  it('respects custom fade duration', () => {
    const css = generateStyles({ fadeOutDuration: 500 })
    expect(css).toContain('transition: opacity 500ms')
  })
})
