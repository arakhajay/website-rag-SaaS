import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

export default defineConfig({
    plugins: [preact()],
    build: {
        outDir: 'public',
        lib: {
            entry: resolve(__dirname, 'widget/index.tsx'),
            name: 'SitebotWidget',
            fileName: (format) => `widget.bundle.js`,
            formats: ['iife'], // Compile to a single executable script
        },
        rollupOptions: {
            external: [], // No externals, bundle everything!
            output: {
                extend: true,
            },
        },
        emptyOutDir: false, // Don't delete other files in public/
    },
    define: {
        'process.env.NODE_ENV': '"production"',
    },
})
