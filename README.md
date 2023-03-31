# esbuild-plugin-polyfill-node

[ESBuild](https://esbuild.github.io/) plugin to polyfill Node.js built-ins and globals, geared towards edge environments and Deno (including Deno Deploy). It consists of two plugins: `polyfillNode`, which should work for most cases, and `polyfillNodeForDeno` which targets Deno and Deno Deploy specifically.

## Installation

```sh
npm install esbuild-plugin-polyfill-node
```

## `polyfillNode`

### Usage

```js
import { build } from "esbuild";
import { polyfillNode } from "esbuild-plugin-polyfill-node";

build({
	entryPoints: ["src/index.js"],
	bundle: true,
	outfile: "dist/bundle.js",
	plugins: [
		polyfillNode({
			// Options (optional)
		}),
	],
});
```

### Options

- `globals.buffer`: Whether to inject the `Buffer` global. Disable it to prevent code like `if (typeof Buffer !== "undefined")` from pulling in the (quite large) `buffer-es6` polyfill. Default: `true`.
- `globals.process`: Whether to inject the `process` global. Disable it to prevent `process.env.NODE_ENV` from pulling in the `process-es6` polyfill. You can use the `define` option to replace `process.env.NODE_ENV` instead. Default: `true`.
- `polyfills`: Polyfills to inject. It's an object where the keys are the names of the polyfills and the values are `false`, `true`, or `"empty"`. `false` disables the polyfill, `true` enables it, and `"empty"` injects an empty polyfill.

### Implemented polyfills

Polyfills are provided by the [`@jspm/core`](https://github.com/jspm/jspm-core/) package.

- `_stream_duplex`
- `_stream_passthrough`
- `_stream_readable`
- `_stream_transform`
- `_stream_writable`
- `assert`
- `assert/strict`
- `async_hooks`
- `buffer`
- `child_process`
- `cluster`
- `console`
- `constants`
- `crypto`
- `dgram`
- `diagnostics_channel`
- `dns`
- `domain`
- `events`
- `fs`
- `fs/promises`
- `http`
- `http2`
- `https`
- `module`
- `net`
- `os`
- `path`
- `perf_hooks`
- `process`
- `punycode`
- `querystring`
- `readline`
- `repl`
- `stream`
- `string_decoder`
- `sys`
- `timers`
- `timers/promises`
- `tls`
- `tty`
- `url`
- `util`
- `v8`
- `vm`
- `wasi`
- `worker_threads`
- `zlib`

¹ All except `crypto` and `fs` polyfills are on by default. `crypto` and `fs` have to be explicitly enabled. Otherwise, they will be replaced with empty stubs.

### Globals

- `global` (aliased to `globalThis`)
- `process`¹ (imports the `process` module)
- `Buffer`¹ (imports the `buffer` module)
- `__dirname` (always `"/"`)
- `__filename` (always `"/index.js"`)

¹ `process` and `Buffer` shims can be disabled by passing `globals.process: false` and `globals.buffer: false` to the plugin options.

## `polyfillNodeForDeno`

This plugin uses Deno's [`std/node`](https://deno.land/std@0.177.0/node) library to polyfill Node builtins and globals.

Note that the `std/node` library has been removed from Deno in version 0.178.0 because now Deno has builtin support for Node builtin modules (e.g. `node:fs`). This plugin is still useful for deploying to Deno Deploy, which doesn't support them yet.

### Usage

```js
import { build } from "esbuild";
import { polyfillNodeForDeno } from "esbuild-plugin-polyfill-node";

build({
	entryPoints: ["src/index.js"],
	bundle: true,
	outfile: "dist/bundle.js",
	plugins: [
		polyfillNodeForDeno({
			// Options (optional)
		}),
	],
});
```

### Options

- `stdVersion`: Version of the Deno standard library to use. Default: `"0.177.0"`.
- `globals`: Whether to inject global polyfills (`process`, `Buffer`, `setImmediate`, `clearImmediate`, `__dirname`, and `__filename`). Default: `true`.
- `polyfills`: Polyfills to inject. It's an object where the keys are the names of the polyfills and the values are `false`, `true`, `"npm"` or `"empty"`. `false` disables the polyfill, `true` enables it (default where exists), `"npm"` injects a polyfill from the NPM (default for `"domain"`, `"punycode"`, `"vm"`, and `"zlib"`), and `"empty"` injects an empty polyfill (default for [missing polyfills](#empty-stubs)).

## Credits

- [Fatih Aygün](https://github.com/cyco130), under the [MIT license](./LICENSE)
- Loosely based on [rollup-plugin-polyfill-node](https://github.com/FredKSchott/rollup-plugin-polyfill-node)
