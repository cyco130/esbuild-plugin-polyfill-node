import type { Plugin } from "esbuild";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";

const filename =
	typeof __filename === "undefined"
		? fileURLToPath(import.meta.url)
		: __filename;
const importMetaUrl = import.meta.url ?? pathToFileURL(filename).href;

export interface PolyfillNodeOptions {
	/**
	 * Whether to inject globals.
	 *
	 * Set to `false` to disable all globals.
	 */
	globals?:
		| false
		| {
				/**
				 * Whether to inject the `global` global.
				 *
				 * It is set as an alias of `globalThis`.
				 *
				 * @default true
				 */
				global?: boolean;
				/**
				 * Whether to inject the `__dirname` global.
				 *
				 * Always defined as `/`.
				 *
				 * @default true
				 */
				__dirname?: boolean;
				/**
				 * Whether to inject the `__filename` global.
				 *
				 * Always defined as `/index.js`.
				 *
				 * @default true
				 */
				__filename?: boolean;
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
				/**
				 * Whether to inject the `navigator` global.
				 *
				 * It is used by some of the polyfills.
				 *
				 * @default false
				 */
				navigator?: boolean;
		  };
	polyfills?: {
		_stream_duplex?: boolean | "empty";
		_stream_passthrough?: boolean | "empty";
		_stream_readable?: boolean | "empty";
		_stream_transform?: boolean | "empty";
		_stream_writable?: boolean | "empty";
		assert?: boolean | "empty";
		"assert/strict"?: boolean | "empty";
		async_hooks?: boolean | "empty";
		buffer?: boolean | "empty";
		child_process?: boolean | "empty";
		cluster?: boolean | "empty";
		console?: boolean | "empty";
		constants?: boolean | "empty";
		crypto?: boolean | "empty";
		dgram?: boolean | "empty";
		diagnostics_channel?: boolean | "empty";
		dns?: boolean | "empty";
		domain?: boolean | "empty";
		events?: boolean | "empty";
		fs?: boolean | "empty";
		"fs/promises"?: boolean | "empty";
		http?: boolean | "empty";
		http2?: boolean | "empty";
		https?: boolean | "empty";
		module?: boolean | "empty";
		net?: boolean | "empty";
		os?: boolean | "empty";
		path?: boolean | "empty";
		perf_hooks?: boolean | "empty";
		process?: boolean | "empty";
		punycode?: boolean | "empty";
		querystring?: boolean | "empty";
		readline?: boolean | "empty";
		repl?: boolean | "empty";
		stream?: boolean | "empty";
		string_decoder?: boolean | "empty";
		sys?: boolean | "empty";
		timers?: boolean | "empty";
		"timers/promises"?: boolean | "empty";
		tls?: boolean | "empty";
		tty?: boolean | "empty";
		url?: boolean | "empty";
		util?: boolean | "empty";
		v8?: boolean | "empty";
		vm?: boolean | "empty";
		wasi?: boolean | "empty";
		worker_threads?: boolean | "empty";
		zlib?: boolean | "empty";
	};
}

export function polyfillNode(options: PolyfillNodeOptions = {}): Plugin {
	const { globals = {}, polyfills = {} } = options;

	const {
		global = true,
		__dirname = true,
		__filename = true,
		buffer = true,
		process = true,
		navigator = false,
	} = globals || {
		global: false,
		__dirname: false,
		__filename: false,
		buffer: false,
		process: false,
		navigator: false,
	};

	polyfills.fs = polyfills.fs ?? "empty";
	polyfills.crypto = polyfills.crypto ?? "empty";
	polyfills.dns = polyfills.dns ?? "empty";
	polyfills.dgram = polyfills.dgram ?? "empty";
	polyfills.cluster = polyfills.cluster ?? "empty";
	polyfills.repl = polyfills.repl ?? "empty";
	polyfills.tls = polyfills.tls ?? "empty";

	const moduleNames = [...jspmPolyiflls];
	const filter = new RegExp(`^(node:)?(${moduleNames.join("|")})$`);

	return {
		name: "node-polyfills",

		async setup(build) {
			const fsResolved = await resolveImport(`@jspm/core/nodelibs/fs`);

			build.onResolve({ filter }, async ({ path }) => {
				const [, , moduleName] = path.match(filter)!;

				const polyfill =
					polyfills[moduleName as keyof typeof polyfills] ?? true;

				if (polyfill === false) {
					return;
				} else if (polyfill === "empty") {
					return { path: resolve(dirname(filename), "../polyfills/empty.js") };
				} else if (!jspmPolyiflls.has(moduleName)) {
					throw new Error("Cannot find polyfill for " + moduleName);
				}

				const resolved = resolve(fsResolved, `../../browser/${moduleName}.js`);

				return { path: resolved };
			});

			if (globals) {
				build.initialOptions.inject = build.initialOptions.inject || [];

				if (global) {
					resolve(dirname(filename), "../polyfills/global.js");
				}

				if (__dirname) {
					build.initialOptions.inject.push(
						resolve(dirname(filename), "../polyfills/__dirname.js"),
					);
				}

				if (__filename) {
					resolve(dirname(filename), "../polyfills/__filename.js");
				}

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

				if (navigator) {
					build.initialOptions.inject.push(
						resolve(dirname(filename), "../polyfills/navigator.js"),
					);
				}
			}
		},
	};
}

export interface PolyfillNodeForDenoOptions {
	stdVersion?: string;
	globals?: boolean;
	polyfills?: {
		assert?: boolean | "empty";
		"assert/strict"?: boolean | "empty";
		buffer?: boolean | "empty";
		child_process?: boolean | "empty";
		console?: boolean | "empty";
		constants?: boolean | "empty";
		crypto?: boolean | "empty";
		domain?: false | "empty";
		events?: boolean | "empty";
		fs?: boolean | "empty";
		"fs/promises"?: boolean | "empty";
		http?: boolean | "empty";
		https?: boolean | "empty";
		module?: boolean | "empty";
		net?: boolean | "empty";
		os?: boolean | "empty";
		path?: boolean | "empty";
		perf_hooks?: boolean | "empty";
		process?: boolean | "empty";
		punycode?: false | "empty";
		querystring?: boolean | "empty";
		readline?: boolean | "empty";
		stream?: boolean | "empty";
		string_decoder?: boolean | "empty";
		sys?: boolean | "empty";
		timers?: boolean | "empty";
		"timers/promises"?: boolean | "empty";
		tty?: boolean | "empty";
		url?: boolean | "empty";
		util?: boolean | "empty";
		vm?: false | "empty";
		worker_threads?: boolean | "empty";
		zlib?: false | "empty";
	};
}

export function polyfillNodeForDeno(
	options: PolyfillNodeForDenoOptions = {},
): Plugin {
	const { stdVersion = "0.177.0", globals = true, polyfills = {} } = options;

	const moduleNames = [...new Set([...denoPolyfills])];

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

			build.onResolve({ filter }, async ({ path }) => {
				const [, , moduleName] = path.match(filter)!;

				const polyfill =
					polyfills[moduleName as keyof typeof polyfills] ?? true;

				if (polyfill === false) {
					return;
				} else if (polyfill === "empty") {
					return {
						path: resolve(dirname(filename), "../polyfills/empty.js"),
					};
				} else {
					if (!denoPolyfills.has(moduleName)) {
						throw new Error("Cannot find the Deno polyfill for " + moduleName);
					}

					return {
						path: `https://deno.land/std@${stdVersion}/node/${moduleName}.ts`,
						external: true,
					};
				}
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

const jspmPolyiflls = new Set([
	"_stream_duplex",
	"_stream_passthrough",
	"_stream_readable",
	"_stream_transform",
	"_stream_writable",
	"assert",
	"assert/strict",
	"async_hooks",
	"buffer",
	"child_process",
	"cluster",
	"console",
	"constants",
	"crypto",
	"dgram",
	"diagnostics_channel",
	"dns",
	"domain",
	"events",
	"fs",
	"fs/promises",
	"http",
	"http2",
	"https",
	"module",
	"net",
	"os",
	"path",
	"perf_hooks",
	"process",
	"punycode",
	"querystring",
	"readline",
	"repl",
	"stream",
	"string_decoder",
	"sys",
	"timers",
	"timers/promises",
	"tls",
	"tty",
	"url",
	"util",
	"v8",
	"vm",
	"wasi",
	"worker_threads",
	"zlib",
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
