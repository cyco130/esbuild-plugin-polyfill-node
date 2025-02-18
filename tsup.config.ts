import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: ["src/index.ts"],
		format: ["esm", "cjs"],
		target: "node14",
		dts: true,
		shims: true
	},
]);
