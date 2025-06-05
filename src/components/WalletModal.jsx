import React from "react";
import { FaTimes } from "react-icons/fa";
import { useWallet } from "../context/WalletContext";

const WalletModal = ({ isOpen, onClose }) => {
  const { connectWallet } = useWallet();

  const handleWalletConnect = async (walletType) => {
    try {
      await connectWallet(walletType);
      onClose(); // Auto-close modal after successful connection
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            Connect Wallet
          </h2>
          <p className="text-gray-400 text-sm">
            Choose your preferred wallet to connect
          </p>
        </div>

        {/* Wallet Options */}
        <div className="space-y-3">
          {/* MetaMask */}
          <button
            onClick={() => handleWalletConnect("metamask")}
            className="w-full flex items-center space-x-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-yellow-400/50 rounded-xl transition-all duration-300 group"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
              alt="MetaMask"
              className="w-8 h-8"
            />
            <div className="flex-1 text-left">
              <h3 className="text-white font-medium group-hover:text-yellow-400 transition-colors">
                MetaMask
              </h3>
              <p className="text-sm text-gray-400">
                Connect to your MetaMask Wallet
              </p>
            </div>
          </button>

          {/* Coinbase Wallet */}
          <button
            onClick={() => handleWalletConnect("coinbase")}
            className="w-full flex items-center space-x-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-yellow-400/50 rounded-xl transition-all duration-300 group"
          >
            <img
              src="https://www.coinbase.com/assets/wallet/coinbase-wallet-logo.png"
              alt="Coinbase Wallet"
              className="w-8 h-8 object-contain bg-white rounded-full p-1"
            />
            <div className="flex-1 text-left">
              <h3 className="text-white font-medium group-hover:text-yellow-400 transition-colors">
                Coinbase Wallet
              </h3>
              <p className="text-sm text-gray-400">
                Connect to your Coinbase Wallet
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By connecting your wallet, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
