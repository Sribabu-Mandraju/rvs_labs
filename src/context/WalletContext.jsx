import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { toast } from "react-toastify";
import {getCurrentNetwork} from "../config/contract.config.js"

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize Coinbase Wallet SDK
  const coinbaseWallet = new CoinbaseWalletSDK({
    appName: "Your App Name", // Replace with your app's name
    appLogoUrl: "https://your-app-logo-url.com/logo.png", // Replace with your app's logo URL (optional)
    darkMode: true,
  });

  // Initialize wallet connection
  useEffect(() => {
    const initWallet = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Check if already connected
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();

            setAccount(accounts[0]);
            setSigner(signer);
            setChainId(network.chainId);
            setIsConnected(true);

            // Detect wallet type
            if (window.ethereum.isCoinbaseWallet) {
              setWalletType("coinbase");
            } else if (window.ethereum.isMetaMask) {
              setWalletType("metamask");
            }
          }

          // Set up event listeners
          window.ethereum.on("accountsChanged", handleAccountsChanged);
          window.ethereum.on("chainChanged", handleChainChanged);
        } catch (error) {
          console.error("Error initializing wallet:", error);
          toast.error("Error initializing wallet: " + error.message);
        }
      }
    };

    initWallet();

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
    try {
      if (accounts.length === 0) {
        // User disconnected
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        if (provider) {
          const signer = await provider.getSigner();
          setSigner(signer);
        }
      }
    } catch (error) {
      console.error("Error handling account change:", error);
      toast.error("Error handling account change: " + error.message);
    }
  };

  const handleChainChanged = async () => {
    try {
      if (provider) {
        const network = await provider.getNetwork();
        setChainId(network.chainId);
        toast.info(`Network changed to ${network.name}`);
      }
    } catch (error) {
      console.error("Error handling chain change:", error);
      toast.error("Error handling chain change: " + error.message);
    }
  };

  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        // Network not added, add it
        const network = getCurrentNetwork();
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              blockExplorerUrls: [network.chain.blockExplorers?.default?.url],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  };

  const connectWallet = async (walletType) => {
    try {
      setIsConnecting(true);
      let ethersProvider;

      const { rpcUrl, chain } = getCurrentNetwork(); // Get current network details

      if (walletType === "metamask") {
        if (!window.ethereum || !window.ethereum.isMetaMask) {
          toast.error("Please install MetaMask!");
          return;
        }
        ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setWalletType("metamask");
      } else if (walletType === "coinbase") {
        try {
          const provider = coinbaseWallet.makeWeb3Provider(rpcUrl, chain.id);
          ethersProvider = new ethers.BrowserProvider(provider);
          setWalletType("coinbase");
        } catch (sdkError) {
          console.error("Coinbase Wallet SDK error:", sdkError);
          toast.error("Failed to initialize Coinbase Wallet. Please try again.");
          return;
        }
      } else {
        throw new Error("Unsupported wallet type");
      }

      // Request account access
      const accounts = await ethersProvider.send("eth_requestAccounts", []);

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const signer = await ethersProvider.getSigner();
      const network = await ethersProvider.getNetwork();

      // Ensure the wallet is on the correct network
      if (Number(network.chainId) !== chain.id) {
        await switchNetwork(chain.id);
      }

      setAccount(accounts[0]);
      setProvider(ethersProvider);
      setSigner(signer);
      setChainId(network.chainId);
      setIsConnected(true);

      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        toast.error("Please connect your wallet to continue");
      } else {
        toast.error("Error connecting wallet: " + error.message);
      }
      disconnectWallet();
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setWalletType(null);
    setIsConnected(false);
    toast.info("Wallet disconnected");
  };

  const value = {
    account,
    provider,
    signer,
    chainId,
    walletType,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};