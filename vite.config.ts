import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // Library build configuration
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'MasterDataManagement',
          formats: ['es', 'cjs'],
          fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs',
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            'react-router-dom',
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
            'ag-grid-react',
            'ag-grid-community',
          ],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react-router-dom': 'ReactRouterDOM',
              '@mui/material': 'MaterialUI',
              'ag-grid-react': 'AgGridReact',
              'ag-grid-community': 'AgGridCommunity',
            },
          },
        },
      },
    }
  }

  // Development configuration
  return {
    plugins: [react()],
  }
})
