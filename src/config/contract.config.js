import { createPublicClient, http } from "viem";
import {
  baseSepolia,
  base,
  mainnet,
  sepolia,
  arbitrum,
  arbitrumSepolia,
  optimism,
  optimismSepolia,
} from "viem/chains";
import TimeLockNFTStakingABI from "../abis/stablz.json";

// Network configurations
const NETWORKS = {
  baseSepolia: {
    chain: baseSepolia,
    rpcUrl: import.meta.env.VITE_BASE_SEPOLIA_RPC || "https://sepolia.base.org",
    contractAddress: import.meta.env.VITE_STABLEZ_CONTRACT,
    name: "Base Sepolia",
  },
  base: {
    chain: base,
    rpcUrl: import.meta.env.VITE_BASE_RPC || "https://mainnet.base.org",
    contractAddress: import.meta.env.VITE_STABLEZ_CONTRACT_MAINNET,
    name: "Base",
  },
  mainnet: {
    chain: mainnet,
    rpcUrl: import.meta.env.VITE_ETH_RPC || "https://eth.llamarpc.com",
    contractAddress: import.meta.env.VITE_STABLEZ_CONTRACT_ETH,
    name: "Ethereum",
  },
  sepolia: {
    chain: sepolia,
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC || "https://rpc.sepolia.org",
    contractAddress: import.meta.env.VITE_STABLEZ_CONTRACT_SEPOLIA,
    name: "Sepolia",
  },
  arbitrum: {
    chain: arbitrum,
    rpcUrl: import.meta.env.VITE_ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc",
    contractAddress: import.meta.env.VITE_STABLEZ_CONTRACT_ARBITRUM,
    name: "Arbitrum",
  },
  arbitrumSepolia: {
    chain: arbitrumSepolia,
    rpcUrl:
      import.meta.env.VITE_ARBITRUM_SEPOLIA_RPC ||
      "https://sepolia-rollup.arbitrum.io/rpc",
    contractAddress: import.meta.env.VITE_STABLEZ_CONTRACT_ARBITRUM_SEPOLIA,
    name: "Arbitrum Sepolia",
  },
  optimism: {
    chain: optimism,
    rpcUrl: import.meta.env.VITE_OPTIMISM_RPC || "https://mainnet.optimism.io",
    contractAddress: import.meta.env.VITE_STABLEZ_CONTRACT_OPTIMISM,
    name: "Optimism",
  },
  optimismSepolia: {
    chain: optimismSepolia,
    rpcUrl:
      import.meta.env.VITE_OPTIMISM_SEPOLIA_RPC ||
      "https://sepolia.optimism.io",
    contractAddress: import.meta.env.VITE_STABLEZ_CONTRACT_OPTIMISM_SEPOLIA,
    name: "Optimism Sepolia",
  },
};

// Get current network from environment or default to baseSepolia
const getCurrentNetwork = () => {
  const networkId = import.meta.env.VITE_NETWORK_ID || "baseSepolia";
  return NETWORKS[networkId] || NETWORKS.baseSepolia;
};

// Create public client for the current network
export const getPublicClient = () => {
  const network = getCurrentNetwork();
  return createPublicClient({
    chain: network.chain,
    transport: http(network.rpcUrl),
  });
};

// Get contract instance for the current network
export const getContractInstance = () => {
  const network = getCurrentNetwork();
  if (!network.contractAddress) {
    throw new Error(`Contract address not set for ${network.name}`);
  }
  return {
    address: network.contractAddress,
    abi: TimeLockNFTStakingABI,
  };
};

// Get all supported networks
export const getSupportedNetworks = () => {
  return Object.entries(NETWORKS).map(([id, network]) => ({
    id,
    name: network.name,
    chainId: network.chain.id,
    rpcUrl: network.rpcUrl,
    contractAddress: network.contractAddress,
  }));
};

// Get network by chain ID
export const getNetworkByChainId = (chainId) => {
  return Object.values(NETWORKS).find(
    (network) => network.chain.id === chainId
  );
};

// Get network by ID
export const getNetworkById = (networkId) => {
  return NETWORKS[networkId];
};

// Export current network info
export const currentNetwork = getCurrentNetwork();
