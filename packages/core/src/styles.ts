import type { LoupeOptions } from './types'
import { DEFAULTS } from './types'

export function generateStyles(opts: LoupeOptions): string {
  const o = { ...DEFAULTS, ...opts }
  const diameter = o.radius * 2

  return `
    :host {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 2147483647;
      pointer-events: none;
      width: ${diameter}px;
      height: ${diameter}px;
      border-radius: 50%;
      border: ${o.borderWidth}px solid ${o.borderColor};
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      opacity: 0;
      transition: opacity ${o.fadeOutDuration}ms ease-out;
      will-change: transform, opacity;
    }

    :host(.louper-active) {
      opacity: 1;
      transition: none;
    }

    .louper-clone-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 50%;
    }

    .louper-clone-container {
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: 0 0;
      will-change: transform;
    }
  `
}
