import React from "react";
import { FaWallet, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { useWallet } from "../context/WalletContext";

const WalletModal = ({ isOpen, onClose }) => {
  const { connectWallet, isConnecting, chainId, isConnected } = useWallet();

  const handleWalletConnect = async (walletType) => {
    try {
      await connectWallet(walletType);
      if (isConnected) {
        onClose();
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet";
      case 5:
        return "Goerli Testnet";
      case 11155111:
        return "Sepolia Testnet";
      default:
        return `Chain ID: ${chainId}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            Connect Wallet
          </h2>
          <p className="text-gray-400">Choose your preferred wallet</p>
        </div>

        {/* Network Warning */}
        {chainId && chainId !== 1 && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="text-yellow-400" />
              <p className="text-yellow-400 text-sm">
                Connected to {getNetworkName(chainId)}
              </p>
            </div>
          </div>
        )}

        {/* Wallet Options */}
        <div className="space-y-4">
          <button
            onClick={() => handleWalletConnect("metamask")}
            disabled={isConnecting}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 flex items-center justify-between transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <img src="/metamask-fox.svg" alt="MetaMask" className="w-8 h-8" />
              <span className="text-white font-medium">MetaMask</span>
            </div>
            <FaWallet className="text-yellow-400" />
          </button>

          <button
            onClick={() => handleWalletConnect("coinbase")}
            disabled={isConnecting}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 flex items-center justify-between transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <img
                src="/coinbase-wallet.svg"
                alt="Coinbase Wallet"
                className="w-8 h-8"
              />
              <span className="text-white font-medium">Coinbase Wallet</span>
            </div>
            <FaWallet className="text-yellow-400" />
          </button>
        </div>

        {/* Loading state */}
        {isConnecting && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent"></div>
            <p className="text-gray-400 mt-2">Connecting...</p>
          </div>
        )}

        {/* Help text */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            By connecting your wallet, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
