import esbuild from 'esbuild';

// Build inject.js as IIFE
esbuild.build({
    entryPoints: ['src/inject/index.ts'],
    bundle: true,
    outfile: 'dist/inject.js',
    format: 'iife',
    target: ['es2020'],
    minify: false,
    sourcemap: true,
    allowOverwrite: true,
}).then(() => {
    console.log('✓ inject.js bundled as IIFE');
}).catch(() => process.exit(1));

// Build content.js as IIFE
esbuild.build({
    entryPoints: ['src/content/index.ts'],
    bundle: true,
    outfile: 'dist/content.js',
    format: 'iife',
    target: ['es2020'],
    minify: false,
    sourcemap: true,
    allowOverwrite: true,
}).then(() => {
    console.log('✓ content.js bundled as IIFE');
}).catch(() => process.exit(1));

// Copying test-dapp.html removed for production build
