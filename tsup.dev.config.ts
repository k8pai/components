import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts', 'src/test.ts', 'src/**/*.ts'],
	format: ['esm', 'cjs'],
	dts: false,
	splitting: false,
	sourcemap: true,
	clean: true,
	outDir: 'dist',
	target: 'es2022',
});
