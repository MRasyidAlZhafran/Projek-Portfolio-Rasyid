import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Output langsung ke public Laravel (timpa asset lama)
    outDir: path.resolve(__dirname, '../backend/public'),
    // Jangan hapus seluruh isi public (ada index.php Laravel di sana)
    emptyOutDir: false,
  },
})
