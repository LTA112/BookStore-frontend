import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:6789', // Địa chỉ backend
        changeOrigin: true, // Để đảm bảo request headers được chỉnh sửa
        rewrite: (path) => path.replace(/^\/api/, ''), // Xóa tiền tố '/api' nếu không cần
      },
    },
  },
})
