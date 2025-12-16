import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/pmtiles-viewer-beta/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000, // Increase the warning limit to 1000 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate MapLibre GL into its own chunk
          'maplibre-gl': ['maplibre-gl'],
          // Separate PMTiles into its own chunk
          'pmtiles': ['pmtiles']
          // Note: Removed empty ui-libs and css-framework chunks as they're not being used
        }
      }
    }
  },
  server: {
    host: 'localhost', // Force localhost to avoid network IP usage which breaks CORS
    port: 5173,
    strictPort: true
  }
})
