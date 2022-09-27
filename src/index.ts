import type { Plugin } from "esbuild";
import { fileURLToPath, pathToFileURL } from "url";
import { resolve, dirname } from "path";

const filename =
	typeof __filename === "undefined"
		? fileURLToPath(import.meta.url)
		: __filename;
const importMetaUrl = import.meta.url ?? pathToFileURL(filename).href;

export interface NodePolyfillsOptions {
	/**
	 * Whether to inject the `Buffer` global.
	 *
	 * Disable it to prevent code like `if (typeof Buffer !== "undefined")`
	 * from pulling in the (quite large) `buffer-es6` polyfill.
	 *
	 * @default true
	 */
	buffer?: boolean;

	/**
	 * Whether to inject the `process` global.
	 *
	 * Disable it to prevent `process.env.NODE_ENV` from pulling in the
	 * `process-es6` polyfill. You can use the `define` option to replace
	 * `process.env.NODE_ENV` instead.
	 *
	 * @default true
	 */
	process?: boolean;

	/**
	 * Whether to polyfill the `fs` module.
	 *
	 * This is disabled by default because the `browserify-fs` polyfill is
	 * quite large and you may want to think again before pulling it in.
	 *
	 * @default false
	 */
	fs?: boolean;

	/**
	 * Whether to polyfill the `crypto` module.
	 *
	 * This is disabled by default because the `crypto-browserify` polyfill is
	 * quite large and you may want to think again before pulling it in. Using
	 * the Web Crypto API is usually a better idea.
	 *
	 * @default false
	 */
	crypto?: boolean;
}

export function nodePolyfills(options: NodePolyfillsOptions = {}): Plugin {
	const { buffer = true, process = true, fs = false, crypto = false } = options;

	const moduleNames = Object.keys(polyfills);
	const filter = new RegExp(
		`^(node:)?(${moduleNames.join("|")}|inherits|${[...emptyShims.keys()].join(
			"|",
		)})$`,
	);

	return {
		name: "node-polyfills",

		setup(build) {
			build.onResolve({ filter }, async ({ path, importer }) => {
				const [, , moduleName] = path.match(filter)!;

				if (polyfills[moduleName]) {
					if (
						(moduleName === "fs" && !fs) ||
						(moduleName === "crypto" && !crypto)
					) {
						return {
							path: resolve(dirname(filename), "../polyfills/empty.js"),
						};
					}

					return {
						path: await resolveImport(polyfills[moduleName]),
					};
				} else if (emptyShims.has(moduleName)) {
					return {
						path: resolve(dirname(filename), "../polyfills/empty.js"),
					};
				} else if (
					moduleName === "inherits" &&
					importer === (await resolveImport("util/util.js"))
				) {
					return {
						path: resolve(dirname(filename), "../polyfills/inherits.js"),
					};
				}
			});

			build.initialOptions.inject = build.initialOptions.inject || [];
			build.initialOptions.inject.push(
				resolve(dirname(filename), "../polyfills/global.js"),
				resolve(dirname(filename), "../polyfills/__dirname.js"),
				resolve(dirname(filename), "../polyfills/__filename.js"),
			);

			if (buffer) {
				build.initialOptions.inject.push(
					resolve(dirname(filename), "../polyfills/buffer.js"),
				);
			}

			if (process) {
				build.initialOptions.inject.push(
					resolve(dirname(filename), "../polyfills/process.js"),
				);
			}
		},
	};
}

const polyfills: Record<string, string> = {
	_buffer_list: "readable-stream/lib/internal/streams/buffer_list.js",
	_stream_passthrough: "readable-stream/lib/_stream_passthrough.js",
	_stream_readable: "readable-stream/lib/_stream_readable.js",
	_stream_transform: "readable-stream/lib/_stream_transform.js",
	_stream_writable: "readable-stream/lib/_stream_writable.js",
	assert: "assert/build/assert.js",
	buffer: "buffer-es6/index.js",
	console: "console-browserify/index.js",
	crypto: "crypto-browserify/index.js",
	domain: "domain-browser/source/index.js",
	events: "events/events.js",
	fs: "browserify-fs/index.js",
	http: "stream-http/index.js",
	https: "stream-http/index.js",
	os: "os/index.js",
	path: "path/path.js",
	process: "process-es6/browser.js",
	punycode: "punycode/punycode.es6.js",
	querystring: "querystring/index.js",
	stream: "stream/index.js",
	string_decoder: "string_decoder/lib/string_decoder.js",
	sys: "util/util.js",
	timers: "timers-browserify/main.js",
	tty: "tty-browserify/index.js",
	url: "url/url.js",
	util: "util/util.js",
	vm: "vm-browserify/index.js",
	zlib: "browserify-zlib/lib/index.js",
};

const emptyShims = new Set([
	"dns",
	"dgram",
	"child_process",
	"cluster",
	"module",
	"net",
	"readline",
	"repl",
	"tls",
]);

let importMetaResolve: typeof import("import-meta-resolve").resolve;

async function resolveImport(specifier: string) {
	if (!importMetaResolve) {
		importMetaResolve = (await import("import-meta-resolve")).resolve;
	}
	const resolved = await importMetaResolve(specifier, importMetaUrl);
	return fileURLToPath(resolved);
}
