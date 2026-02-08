import { describe, it, expect } from 'vitest'
import { computeCloneTransform } from '../dom'

describe('computeCloneTransform', () => {
  it('centers the clone on cursor position at 1x zoom', () => {
    const result = computeCloneTransform(100, 200, 0, 0, 1, 150)
    // At 1x zoom: cloneX = radius - docX * zoom = 150 - 100 = 50
    expect(result.cloneX).toBe(50)
    // cloneY = 150 - 200 = -50
    expect(result.cloneY).toBe(-50)
  })

  it('accounts for scroll offset', () => {
    const result = computeCloneTransform(100, 200, 50, 100, 1, 150)
    // docX = 100 + 50 = 150, cloneX = 150 - 150 = 0
    expect(result.cloneX).toBe(0)
    // docY = 200 + 100 = 300, cloneY = 150 - 300 = -150
    expect(result.cloneY).toBe(-150)
  })

  it('scales offset with zoom level', () => {
    const result = computeCloneTransform(100, 100, 0, 0, 2, 150)
    // cloneX = 150 - 100*2 = -50
    expect(result.cloneX).toBe(-50)
    // cloneY = 150 - 100*2 = -50
    expect(result.cloneY).toBe(-50)
  })

  it('works with different radius', () => {
    const result = computeCloneTransform(0, 0, 0, 0, 2, 200)
    // At origin: cloneX = radius = 200
    expect(result.cloneX).toBe(200)
    expect(result.cloneY).toBe(200)
  })
})
