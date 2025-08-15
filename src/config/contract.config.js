import { createPublicClient, http } from "viem";
import { baseSepolia, base } from "viem/chains";
import TimeLockNFTStakingABI from "../abis/stablz.json";

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
};

export const getCurrentNetwork = () => {
  const networkId = import.meta.env.VITE_NETWORK_ID || "baseSepolia";
  return NETWORKS[networkId] || NETWORKS.baseSepolia;
};

export const getPublicClient = () => {
  const network = getCurrentNetwork();
  return createPublicClient({
    chain: network.chain,
    transport: http(network.rpcUrl),
  });
};

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

export const getSupportedNetworks = () => {
  return Object.entries(NETWORKS).map(([id, network]) => ({
    id,
    name: network.name,
    chainId: network.chain.id,
    rpcUrl: network.rpcUrl,
    contractAddress: network.contractAddress,
  }));
};

export const getNetworkByChainId = (chainId) => {
  return Object.values(NETWORKS).find(
    (network) => network.chain.id === chainId
  );
};

export const getNetworkById = (networkId) => {
  return NETWORKS[networkId];
};

export const currentNetwork = getCurrentNetwork();