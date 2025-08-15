import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig } from './config/wagmi.js';
import '@rainbow-me/rainbowkit/styles.css';
import "./index.css"

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* <Provider store={store}> */}
          <App />
          {/* </Provider> */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  // </React.StrictMode>
);


