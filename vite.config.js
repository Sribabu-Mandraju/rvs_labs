import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@coinbase/wallet-sdk'], // Explicitly include Coinbase Wallet SDK
  },
  resolve: {
    alias: {
      // Ensure proper resolution of dependencies if needed
      '@coinbase/wallet-sdk': '@coinbase/wallet-sdk',
    },
  },
});