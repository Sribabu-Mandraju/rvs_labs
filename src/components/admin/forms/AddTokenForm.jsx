"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaSpinner,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  useAddAllowedToken,
  useSingleTokenMetadata,
} from "../../../interactions/StableZ_interactions";
import { ethers } from "ethers";

const AddTokenForm = ({ onSuccess, chainId }) => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [marketCap, setMarketCap] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const {
    addAllowedToken,
    isPending,
    isConfirming,
    isConfirmed,
  } = useAddAllowedToken();

  // Fetch token metadata when address is entered
  const {
    name,
    decimals,
    symbol,
    isLoading: isMetadataLoading,
    hasError: hasMetadataError,
  } = useSingleTokenMetadata(tokenAddress, chainId);

  // Validate token address format
  const isValidAddress = tokenAddress && ethers.isAddress(tokenAddress);

  // Calculate cap in wei based on market cap and decimals
  const calculateCapInWei = () => {
    if (!marketCap || !decimals || isNaN(Number(marketCap))) return "0";
    const marketCapNumber = Number(marketCap);
    const multiplier = 10 ** decimals;
    return BigInt(Math.floor(marketCapNumber * multiplier)).toString();
  };

  const capInWei = calculateCapInWei();

  // Auto-validate token when address is entered
  useEffect(() => {
    if (isValidAddress && !isMetadataLoading) {
      setIsValidating(true);
      // Small delay to show validation state
      const timer = setTimeout(() => {
        setIsValidating(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsValidating(false);
    }
  }, [tokenAddress, isMetadataLoading, isValidAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tokenAddress.trim()) {
      toast.error("Enter a token address", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }

    if (!isValidAddress) {
      toast.error("Invalid token address format", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }

    if (hasMetadataError) {
      toast.error(
        "Failed to fetch token information. Please verify the address.",
        {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        }
      );
      return;
    }

    if (!marketCap || Number(marketCap) <= 0) {
      toast.error("Enter a valid market cap amount", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }

    try {
      await addAllowedToken(tokenAddress, capInWei);
    } catch (err) {
      // Errors are handled in the hook via toast notifications
    }
  };

  // Trigger onSuccess when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setTokenAddress(""); // Clear input on success
      setMarketCap(""); // Clear market cap input
      onSuccess(); // Trigger parent callback to refetch admin data
    }
  }, [isConfirmed, onSuccess]);

  const getTokenStatusIcon = () => {
    if (isMetadataLoading || isValidating) {
      return <FaSpinner className="animate-spin text-blue-400" />;
    }
    if (hasMetadataError) {
      return <FaExclamationTriangle className="text-red-400" />;
    }
    if (name && symbol) {
      return <FaCheckCircle className="text-green-400" />;
    }
    return <FaInfoCircle className="text-gray-400" />;
  };

  const getTokenStatusText = () => {
    if (isMetadataLoading || isValidating) {
      return "Validating token...";
    }
    if (hasMetadataError) {
      return "Invalid token address";
    }
    if (name && symbol) {
      return `${name} (${symbol})`;
    }
    return "Enter token address";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Token Address Input */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Token Contract Address
        </label>
        <div className="relative">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-all duration-200 text-sm pr-12"
            disabled={isPending || isConfirming}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getTokenStatusIcon()}
          </div>
        </div>

        {/* Token Info Display */}
        {tokenAddress && (
          <div className="mt-2 p-3 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm font-medium">
                Token Info:
              </span>
              <span className="text-gray-400 text-xs">
                {getTokenStatusText()}
              </span>
            </div>
            {name && symbol && decimals !== undefined && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white font-medium">{name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Symbol:</span>
                  <span className="text-white font-medium">{symbol}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Decimals:</span>
                  <span className="text-white font-medium">{decimals}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-gray-400 text-xs mt-2">
          Enter the contract address of the ERC20 token to allow for staking
        </p>
      </div>

      {/* Market Cap Input */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Market Cap (in token units)
        </label>
        <div className="relative">
          <input
            type="number"
            value={marketCap}
            onChange={(e) => setMarketCap(e.target.value)}
            placeholder="1000000"
            step="0.000001"
            min="0"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-all duration-200 text-sm"
            disabled={isPending || isConfirming || !name || hasMetadataError}
          />
          {symbol && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              {symbol}
            </div>
          )}
        </div>

        {/* Cap Preview */}
        {marketCap && decimals !== undefined && !isNaN(Number(marketCap)) && (
          <div className="mt-2 p-3 bg-gray-700 rounded-lg border border-gray-600">
            {/* <div className="flex justify-between text-xs">
              <span className="text-gray-400">Cap in Wei:</span>
              <span className="text-white font-mono break-all">{capInWei}</span>
            </div> */}
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-400">Token Max Cap:</span>
              <span className="text-white">
                {Number(marketCap).toLocaleString()} {symbol || "tokens"}
              </span>
            </div>
          </div>
        )}

        <p className="text-gray-400 text-xs mt-2">
          Set the maximum amount of tokens that can be staked for this token
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={
          isPending ||
          isConfirming ||
          !tokenAddress.trim() ||
          !isValidAddress ||
          hasMetadataError ||
          !marketCap ||
          Number(marketCap) <= 0 ||
          !name
        }
        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm shadow-lg hover:shadow-xl"
      >
        {isPending || isConfirming ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Adding Token...
          </>
        ) : (
          <>
            <FaPlus className="mr-2" />
            Add Token
          </>
        )}
      </button>

      {/* Validation Messages */}
      {tokenAddress && !isValidAddress && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-xs">
            Please enter a valid Ethereum address (0x followed by 40 hexadecimal
            characters)
          </p>
        </div>
      )}

      {hasMetadataError && isValidAddress && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-xs">
            Could not fetch token information. Please verify the address is a
            valid ERC20 token.
          </p>
        </div>
      )}
    </form>
  );
};

export default AddTokenForm;
