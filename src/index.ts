import type { Plugin } from "esbuild";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

export function nodePolyfills(): Plugin {
	const filename = global.__filename ?? fileURLToPath(import.meta.url);
	const moduleNames = Object.keys(polyfills);
	const filter = new RegExp(
		`^(node:)?(${moduleNames.join("|")}|inherits|${[...emptyShims.keys()].join(
			"|",
		)})$`,
	);

	return {
		name: "node-polyfills",

		setup(build) {
			build.onResolve({ filter }, ({ path, importer }) => {
				const [, , moduleName] = path.match(filter)!;

				if (polyfills[moduleName]) {
					return {
						path: resolve(
							dirname(filename),
							"../node_modules",
							polyfills[moduleName],
						),
					};
				} else if (emptyShims.has(moduleName)) {
					return {
						path: resolve(dirname(filename), "../polyfills/empty.js"),
					};
				} else if (
					moduleName === "inherits" &&
					importer ===
						resolve(dirname(filename), "../node_modules/util/util.js")
				) {
					return {
						path: resolve(dirname(filename), "../polyfills/inherits.js"),
					};
				}
			});

			build.initialOptions.inject = build.initialOptions.inject || [];
			build.initialOptions.inject.push(
				resolve(dirname(filename), "../polyfills/global.js"),
				resolve(dirname(filename), "../polyfills/process.js"),
				resolve(dirname(filename), "../polyfills/buffer.js"),
				resolve(dirname(filename), "../polyfills/__dirname.js"),
				resolve(dirname(filename), "../polyfills/__filename.js"),
			);
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
	domain: "domain-browser/source/index.js",
	events: "events/events.js",
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
	"fs",
	"crypto",
]);
