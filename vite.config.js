import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dirs: ['src/'],
      extensions: ['vue'],
      deep: true,
      directives: true,
      importPathTransform: v => v,
      allowOverrides: false,
      include: [/\.vue$/, /\.vue\?vue/],
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
      version: 3
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})
