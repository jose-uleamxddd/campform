import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/countrystatecity': {
        target: 'https://api.countrystatecity.in',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/countrystatecity/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('X-CAPI-KEY', '510f645572bb45d8a6678e683e170702204478ec48b38d36231be745c6677651');
          });
        }
      }
    }
  }
});
