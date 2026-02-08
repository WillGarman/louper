<p align="center">
  <strong>Louper</strong>
  <br>
  A tiny magnifying loupe for inspecting any part of your UI.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/louper"><img src="https://img.shields.io/npm/v/louper" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/louper"><img src="https://img.shields.io/bundlephobia/minzip/louper" alt="bundle size"></a>
  <a href="https://github.com/willgarman/louper/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/louper" alt="license"></a>
</p>

---

Hold <kbd>Option</kbd> and hover to magnify. Scroll to zoom from 1x to 10x. That's it.

Zero dependencies. Works with any framework. Renders inside a closed Shadow DOM so it never touches your styles.

## Install

Drop in a script tag -- no build step, no config:

```html
<script src="https://unpkg.com/louper/dist/auto.global.js"></script>
```

Or install from npm:

```bash
npm install louper
```

```js
import { createLouper } from 'louper'

const loupe = createLouper()

// later
loupe.destroy()
```

## Options

All optional. Sensible defaults for everything.

```js
const loupe = createLouper({
  zoomLevel: 2,          // starting zoom
  radius: 150,           // lens radius in px
  borderWidth: 3,        // lens border width in px
  borderColor: 'white',  // lens border color
  hotkey: 'Alt',         // activation key — or false to disable
})
```

## API

```js
loupe.activate()              // show the loupe
loupe.deactivate()            // hide the loupe
loupe.update({ radius: 200 }) // change options on the fly
loupe.destroy()               // remove everything, clean up listeners
```

## Script tag options

When using the script tag, pass options as `data-*` attributes:

```html
<script
  src="https://unpkg.com/louper/dist/auto.global.js"
  data-zoom="3"
  data-radius="120"
  data-border-width="2"
  data-border-color="black"
  data-hotkey="Shift"
></script>
```

## Development

```bash
pnpm install
pnpm dev          # watch mode
open examples/vanilla/index.html
```

Run tests with `pnpm test`.

## Inspiration

Inspired by a tool shown by [Adam Wathan](https://x.com/adamwathan/status/2019826659159937318) on the Tailwind CSS team.

## License

MIT
