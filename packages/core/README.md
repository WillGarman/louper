https://github.com/user-attachments/assets/e575222a-4639-456f-953c-d728c78761e6

[Louper](https://github.com/willgarman/louper) is a tiny magnifying loupe for the web. Hold <kbd>Option/Alt</kbd> to magnify. Scroll to zoom from 1x to 10x. Zero dependencies.

## Usage

Drop in a script tag:

```html
<script src="https://unpkg.com/louper/dist/auto.global.js"></script>
```

Or install from npm:

```bash
npm install louper
```

```js
import { louper } from 'louper'

louper()
```

## API

```js
import { louper } from 'louper'

const loupe = louper({
  zoomLevel: 2,          // starting zoom (default: 2)
  radius: 150,           // lens radius in px (default: 150)
  borderWidth: 3,        // lens border in px (default: 3)
  borderColor: 'white',  // lens border color (default: 'white')
  hotkey: 'Alt',         // activation key, or false to disable (default: 'Alt')
})

loupe.activate()              // show the loupe programmatically
loupe.deactivate()            // hide the loupe
loupe.update({ radius: 200 }) // change options on the fly
loupe.destroy()               // remove everything, clean up listeners
```

## Development

```bash
pnpm install
pnpm dev
open examples/vanilla/index.html
```

## Acknowledgments

Louper takes full inspiration from a tool shown by [Adam Wathan](https://x.com/adamwathan/status/2019826659159937318) on the [Tailwind CSS](https://tailwindcss.com) team.

## License

MIT
