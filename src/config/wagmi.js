// import { createConfig, http } from 'wagmi';
// import { base, baseSepolia } from 'wagmi/chains';
// import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// const projectId = 'ca703cec4e1cc82b7e8a1342fed93c90';

// export const wagmiConfig = createConfig({
//   chains: [baseSepolia, base],
//   connectors: [
//     injected({ target: 'metaMask' }),
//     walletConnect({ projectId, showQrModal: true }), // Enable QR code for mobile
//     coinbaseWallet({
//       appName: 'My Awesome DApp', // Update this
//       darkMode: true,
//     }),
//   ],
//   transports: {
//     [baseSepolia.id]: http(import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'),
//     [base.id]: http(import.meta.env.VITE_BASE_RPC || 'https://mainnet.base.org'),
//   },
// });

import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import {
  injected,
  walletConnect,
  coinbaseWallet,
  safe,
} from "wagmi/connectors";
import { createWeb3Modal } from "@web3modal/wagmi/react";

const projectId = "ca703cec4e1cc82b7e8a1342fed93c90"; // Your WalletConnect project ID

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected({ target: "metaMask" }), // MetaMask and other injected wallets
    walletConnect({ projectId, showQrModal: false }), // WalletConnect (QR code handled by Web3Modal)
    coinbaseWallet({ appName: "My Web3 Dapp", darkMode: true }),
    safe({ appName: "My Web3 Dapp" }), // Safe wallet (if applicable)
  ],
  transports: {
    [base.id]: http(
      import.meta.env.VITE_BASE_MAINNET || "https://mainnet.base.org"
    ),
    [baseSepolia.id]: http(
      import.meta.env.VITE_BASE_SEPOLIA ||
        "https://base-sepolia.g.alchemy.com/v2/lzIxPpJ8bHtK938K6Bnet"
    ),
  },
});

// Initialize Web3Modal for wallet selection
createWeb3Modal({
  wagmiConfig,
  projectId,
  defaultChain: base, // Default to Base Sepolia for testing
  enableAnalytics: true, // Optional: enable analytics
  // chains,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent-color": "#facc15", // Yellow-400 for button background
    "--w3m-background-color": "#1f2937", // Gray-800 for modal background
    "--w3m-text-color": "#000", // Black text for button
    "--w3m-border-radius-master": "8px", // Rounded corners
    "--w3m-button-border-radius": "8px", // Button-specific border radius
    "--w3m-button-background-color":
      "linear-gradient(to right, #facc15, #f59e0b)", // Yellow gradient
    "--w3m-button-hover-background-color":
      "linear-gradient(to right, #f59e0b, #d97706)", // Hover gradient
    "--w3m-button-text-color": "#000", // Black text on button
    "--w3m-button-box-shadow": "0 4px 6px rgba(0, 0, 0, 0.1)", // Shadow
    "--w3m-button-hover-box-shadow": "0 4px 12px rgba(250, 204, 21, 0.25)", // Hover shadow
  },
});

// // Create Web3Modal instance with customized theme
// export const web3Modal = createWeb3Modal({
//   wagmiConfig,
//   projectId,
//   chains,
//   themeMode: 'dark',
//   themeVariables: {
//     '--w3m-accent-color': '#facc15', // Yellow-400 for button background
//     '--w3m-background-color': '#1f2937', // Gray-800 for modal background
//     '--w3m-text-color': '#000', // Black text for button
//     '--w3m-border-radius-master': '8px', // Rounded corners
//     '--w3m-button-border-radius': '8px', // Button-specific border radius
//     '--w3m-button-background-color': 'linear-gradient(to right, #facc15, #f59e0b)', // Yellow gradient
//     '--w3m-button-hover-background-color': 'linear-gradient(to right, #f59e0b, #d97706)', // Hover gradient
//     '--w3m-button-text-color': '#000', // Black text on button
//     '--w3m-button-box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)', // Shadow
//     '--w3m-button-hover-box-shadow': '0 4px 12px rgba(250, 204, 21, 0.25)', // Hover shadow
//   },
// });
