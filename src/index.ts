import type { Plugin } from "esbuild";
import { fileURLToPath, pathToFileURL } from "url";
import { resolve, dirname } from "path";

const filename =
	typeof __filename === "undefined"
		? fileURLToPath(import.meta.url)
		: __filename;
const importMetaUrl = import.meta.url ?? pathToFileURL(filename).href;

export interface PolyfillNodeOptions {
	globals?: {
		/**
		 * Whether to inject the `Buffer` global.
		 *
		 * Disable it to prevent code like `if (typeof Buffer !== "undefined")`
		 * from pulling in the (quite large) Buffer polyfill.
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
	};
	polyfills?: {
		// Internal modules used by implementations
		_buffer_list?: boolean | "empty";
		_stream_passthrough?: boolean | "empty";
		_stream_readable?: boolean | "empty";
		_stream_transform?: boolean | "empty";
		_stream_writable?: boolean | "empty";

		// Common modules
		assert?: boolean | "empty";
		buffer?: boolean | "empty";
		console?: boolean | "empty";
		crypto?: boolean | "empty";
		domain?: boolean | "empty";
		events?: boolean | "empty";
		fs?: boolean | "empty";
		http?: boolean | "empty";
		https?: boolean | "empty";
		os?: boolean | "empty";
		path?: boolean | "empty";
		process?: boolean | "empty";
		punycode?: boolean | "empty";
		querystring?: boolean | "empty";
		stream?: boolean | "empty";
		string_decoder?: boolean | "empty";
		sys?: boolean | "empty";
		timers?: boolean | "empty";
		tty?: boolean | "empty";
		url?: boolean | "empty";
		util?: boolean | "empty";
		vm?: boolean | "empty";
		zlib?: boolean | "empty";

		// Not available but can be replaced by an empty shim
		dns?: false | "empty";
		dgram?: false | "empty";
		cluster?: false | "empty";
		repl?: false | "empty";
		tls?: false | "empty";
	};
}

export function polyfillNode(options: PolyfillNodeOptions = {}): Plugin {
	const { globals: { buffer = true, process = true } = {}, polyfills = {} } =
		options;

	polyfills.fs = polyfills.fs ?? "empty";
	polyfills.crypto = polyfills.crypto ?? "empty";
	polyfills.dns = polyfills.dns ?? "empty";
	polyfills.dgram = polyfills.dgram ?? "empty";
	polyfills.cluster = polyfills.cluster ?? "empty";
	polyfills.repl = polyfills.repl ?? "empty";
	polyfills.tls = polyfills.tls ?? "empty";

	const moduleNames = [
		...new Set([
			...Object.keys(npmPolyfillMap),
			...emptyShims.keys(),
			...Object.keys(polyfills),
			"inherits",
		]),
	];

	const filter = new RegExp(`^(node:)?(${moduleNames.join("|")})$`);

	return {
		name: "node-polyfills",

		setup(build) {
			build.onResolve({ filter }, async ({ path, importer }) => {
				const [, , moduleName] = path.match(filter)!;

				const polyfill =
					polyfills[moduleName as keyof typeof polyfills] ?? true;

				if (polyfill === false) {
					return;
				} else if (polyfill === "empty") {
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
				} else if (!npmPolyfillMap[moduleName]) {
					throw new Error("Cannot find polyfill for " + moduleName);
				}

				return {
					path: await resolveImport(npmPolyfillMap[moduleName]),
				};
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

export interface PolyfillNodeForDenoOptions {
	stdVersion?: string;
	globals?: boolean;
	polyfills?: {
		assert?: boolean | "npm" | "empty";
		"assert/strict"?: boolean | "empty";
		buffer?: boolean | "npm" | "empty";
		child_process?: boolean | "empty";
		console?: boolean | "npm" | "empty";
		constants?: boolean | "empty";
		crypto?: boolean | "npm" | "empty";
		domain?: false | "npm" | "empty";
		events?: boolean | "npm" | "empty";
		fs?: boolean | "npm" | "empty";
		"fs/promises"?: boolean | "empty";
		http?: boolean | "npm" | "empty";
		https?: boolean | "npm" | "empty";
		module?: boolean | "empty";
		net?: boolean | "empty";
		os?: boolean | "npm" | "empty";
		path?: boolean | "npm" | "empty";
		perf_hooks?: boolean | "empty";
		process?: boolean | "npm" | "empty";
		punycode?: false | "npm" | "empty";
		querystring?: boolean | "npm" | "empty";
		readline?: boolean | "empty";
		stream?: boolean | "npm" | "empty";
		string_decoder?: boolean | "npm" | "empty";
		sys?: boolean | "npm" | "empty";
		timers?: boolean | "npm" | "empty";
		"timers/promises"?: boolean | "empty";
		tty?: boolean | "npm" | "empty";
		url?: boolean | "npm" | "empty";
		util?: boolean | "npm" | "empty";
		vm?: false | "npm" | "empty";
		worker_threads?: boolean | "empty";
		zlib?: false | "npm" | "empty";

		// Not available but can be replaced by an empty shim
		dns?: false | "empty";
		dgram?: false | "empty";
		cluster?: false | "empty";
		repl?: false | "empty";
		tls?: false | "empty";
	};
}

export function polyfillNodeForDeno(
	options: PolyfillNodeForDenoOptions = {},
): Plugin {
	const { stdVersion = "0.160.0", globals = true, polyfills = {} } = options;

	polyfills.dns = polyfills.dns ?? "empty";
	polyfills.dgram = polyfills.dgram ?? "empty";
	polyfills.cluster = polyfills.cluster ?? "empty";
	polyfills.repl = polyfills.repl ?? "empty";
	polyfills.tls = polyfills.tls ?? "empty";

	const moduleNames = [
		...new Set([
			...Object.keys(npmPolyfillMap),
			...emptyShims.keys(),
			...Object.keys(polyfills),
			"inherits",
		]),
	];

	console.log(moduleNames);

	const filter = new RegExp(`^(node:)?(${moduleNames.join("|")})$`);

	return {
		name: "node-polyfills",

		setup(build) {
			build.onResolve(
				{
					filter: /^virtual:deno-std-node-global$/,
				},
				() => ({
					path: `https://deno.land/std@${stdVersion}/node/global.ts`,
					external: true,
				}),
			);

			build.onResolve({ filter }, async ({ path, importer }) => {
				const [, , moduleName] = path.match(filter)!;

				const polyfill =
					polyfills[moduleName as keyof typeof polyfills] ?? true;

				if (polyfill === false) {
					return;
				} else if (polyfill === "empty") {
					return {
						path: resolve(dirname(filename), "../polyfills/empty.js"),
					};
				} else if (
					moduleName === "inherits" &&
					polyfills.util === "npm" &&
					importer === (await resolveImport("util/util.js"))
				) {
					return {
						path: resolve(dirname(filename), "../polyfills/inherits.js"),
					};
				} else if (polyfill === true) {
					if (!denoPolyfills.has(moduleName)) {
						throw new Error("Cannot find the Deno polyfill for " + moduleName);
					}

					return {
						path: `https://deno.land/std@${stdVersion}/node/${moduleName}.ts`,
						external: true,
					};
				}

				// npm
				if (!npmPolyfillMap[moduleName]) {
					throw new Error("Cannot find NPM polyfill for " + moduleName);
				}

				return {
					path: await resolveImport(npmPolyfillMap[moduleName]),
				};
			});

			build.onLoad({ namespace: "polyfillNodeForDeno", filter: /.*/ }, () => ({
				contents: denoGlobalsContents(stdVersion),
			}));

			if (globals) {
				build.initialOptions.footer;
				build.initialOptions.inject = build.initialOptions.inject || [];
				build.initialOptions.inject.push(
					resolve(dirname(filename), "../polyfills/global-for-deno.js"),
					resolve(dirname(filename), "../polyfills/__dirname.js"),
					resolve(dirname(filename), "../polyfills/__filename.js"),
				);
			}
		},
	};
}

const npmPolyfillMap: Record<string, string> = {
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

const denoPolyfills = new Set([
	"assert",
	"assert/strict",
	"buffer",
	"console",
	"constants",
	"crypto",
	"child_process",
	"dns",
	"events",
	"fs",
	"fs/promises",
	"http",
	"module",
	"net",
	"os",
	"path",
	"perf_hooks",
	"process",
	"querystring",
	"readline",
	"stream",
	"string_decoder",
	"sys",
	"timers",
	"timers/promises",
	"tty",
	"url",
	"util",
	"worker_threads",
]);

let importMetaResolve: typeof import("import-meta-resolve").resolve;

async function resolveImport(specifier: string) {
	if (!importMetaResolve) {
		importMetaResolve = (await import("import-meta-resolve")).resolve;
	}
	const resolved = await importMetaResolve(specifier, importMetaUrl);
	return fileURLToPath(resolved);
}

function denoGlobalsContents(stdVersion: string) {
	return `
		import "https://deno.land/std@${stdVersion}/node/global.ts";
		export const process = globalThis.process;
		export const Buffer = globalThis.Buffer;
		export const setImmediate = globalThis.setImmediate;
		export const clearImmediate = globalThis.clearImmediate;
	`;
}
