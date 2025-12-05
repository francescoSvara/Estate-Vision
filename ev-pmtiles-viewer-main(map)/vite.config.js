import { defineConfig } from 'vite'

export default defineConfig({
  base: '/pmtiles-viewer/',
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
    host: '0.0.0.0',
    port: 5173
  }
})