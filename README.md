# esbuild-plugin-polyfill-node

[ESBuild](https://esbuild.github.io/) plugin to polyfill Node.js built-ins geared towards edge environments.

## Installation

```sh
npm install esbuild-plugin-polyfill-node
```

## Usage

```js
import { build } from "esbuild";
import { nodePolyfills } from "esbuild-plugin-polyfill-node";

build({
	entryPoints: ["src/index.js"],
	bundle: true,
	outfile: "dist/bundle.js",
	plugins: [nodePolyfills()],
});
```

## Provided polyfills

- `_buffer_list` as implemented in [`readable-stream`](https://www.npmjs.com/package/readable-stream)
- `_stream_passthrough` as implemented in [`readable-stream`](https://www.npmjs.com/package/readable-stream)
- `_stream_readable` as implemented in [`readable-stream`](https://www.npmjs.com/package/readable-stream)
- `_stream_transform` as implemented in [`readable-stream`](https://www.npmjs.com/package/readable-stream)
- `_stream_writable` as implemented in [`readable-stream`](https://www.npmjs.com/package/readable-stream)
- `assert` as implemented in [`assert`](https://www.npmjs.com/package/assert)
- `buffer` as implemented in [`buffer-es6`](https://www.npmjs.com/package/buffer-es6)
- `console` as implemented in [`console-browserify`](https://www.npmjs.com/package/console-browserify)
- `domain` as implemented in [`domain-browser`](https://www.npmjs.com/package/domain-browser)
- `events` as implemented in [`events`](https://www.npmjs.com/package/events)
- `http` as implemented in [`stream-http`](https://www.npmjs.com/package/stream-http)
- `https` as implemented in [`stream-http`](https://www.npmjs.com/package/stream-http)
- `os` as implemented in [`os`](https://www.npmjs.com/package/os)
- `path` as implemented in [`path`](https://www.npmjs.com/package/path)
- `process` as implemented in [`process-es6`](https://www.npmjs.com/package/process-es6)
- `punycode` as implemented in [`punycode`](https://www.npmjs.com/package/punycode)
- `querystring` as implemented in [`querystring`](https://www.npmjs.com/package/querystring)
- `stream` as implemented in [`stream`](https://www.npmjs.com/package/stream)
- `string_decoder` as implemented in [`string_decoder`](https://www.npmjs.com/package/string_decoder)
- `sys` as implemented in [`util`](https://www.npmjs.com/package/util)
- `timers` as implemented in [`timers-browserify`](https://www.npmjs.com/package/timers-browserify)
- `tty` as implemented in [`tty-browserify`](https://www.npmjs.com/package/tty-browserify)
- `url` as implemented in [`url`](https://www.npmjs.com/package/url)
- `util` as implemented in [`util`](https://www.npmjs.com/package/util)
- `vm` as implemented in [`vm-browserify`](https://www.npmjs.com/package/vm-browserify)
- `zlib` as implemented in [`browserify-zlib`](https://www.npmjs.com/package/browserify-zlib)

## Shimmed globals

- `global` (aliased to `globalThis`)
- `process`
- `Buffer`
- `__dirname` (always `"/"`)
- `__filename` (always `"/index.js"`)

## Empty polyfills

- `dns`
- `dgram`
- `child_process`
- `cluster`
- `module`
- `net`
- `readline`
- `repl`
- `tls`
- `fs`
- `crypto`

## Credits

- [Fatih Aygün](https://github.com/cyco130), under the [MIT license](./LICENSE)
- Loosely based on [rollup-plugin-polyfill-node](https://github.com/FredKSchott/rollup-plugin-polyfill-node)
