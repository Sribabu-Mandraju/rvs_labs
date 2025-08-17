"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { FaDownload, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { useCollectTokensNuclear } from "../../../interactions/StableZ_interactions";
import { ethers } from "ethers";

const CollectFundsForm = ({ onSuccess, allowedTokens, chainId }) => {
  const [collectType, setCollectType] = useState("token");
  const [selectedTokenIndex, setSelectedTokenIndex] = useState("");
  const [amount, setAmount] = useState("");
  const {
    collectTokensNuclear,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useCollectTokensNuclear();

  // Helper function to get selected token data
  const selectedTokenData = useMemo(() => {
    if (
      selectedTokenIndex === "" ||
      !allowedTokens ||
      !Array.isArray(allowedTokens) ||
      parseInt(selectedTokenIndex) < 0 ||
      parseInt(selectedTokenIndex) >= allowedTokens.length
    )
      return null;
    return allowedTokens[parseInt(selectedTokenIndex)];
  }, [selectedTokenIndex, allowedTokens]);

  // Memoize token options for dropdown
  const tokenOptions = useMemo(() => {
    if (!allowedTokens || !Array.isArray(allowedTokens)) {
      return [];
    }
    return allowedTokens.map((token, index) => ({
      index: index,
      address: token.address,
      name: token.name,
      symbol: token.symbol,
    }));
  }, [allowedTokens]);

  // Reset form when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setSelectedTokenIndex("");
      setAmount("");
    }
  }, [isConfirmed]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (collectType === "token") {
      if (selectedTokenIndex === "") {
        toast.error("Please select a token", {
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

      if (!amount || Number.parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount", {
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
        // Get token decimals for the selected token
        const decimals = selectedTokenData?.decimals || 18;

        // Validate amount conversion
        if (isNaN(Number(amount)) || Number(amount) <= 0) {
          toast.error("Please enter a valid amount greater than 0", {
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

        // Convert amount to wei using token-specific decimals
        const amountInWei = BigInt(
          Math.floor(Number(amount) * 10 ** decimals)
        ).toString();

        // Validate the converted amount
        if (BigInt(amountInWei) <= 0n) {
          toast.error("Converted amount is too small", {
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

        // Validate token address
        if (
          !selectedTokenData.address ||
          !ethers.isAddress(selectedTokenData.address)
        ) {
          toast.error("Invalid token address", {
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

        await collectTokensNuclear(selectedTokenData.address, amountInWei);
        onSuccess();
      } catch (err) {
        // Error handling is managed by the hook's toast notifications
        console.error("Error collecting tokens:", err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
        <div className="flex items-center text-yellow-400 mb-2">
          <FaExclamationTriangle className="mr-2" />
          <span className="font-medium text-sm">Warning</span>
        </div>
        <p className="text-yellow-300 text-xs">
          These are emergency functions. Use with caution as they directly
          withdraw funds from the contract.
        </p>
      </div>

      {/* <div>
        <label className="block text-gray-300 text-xs font-medium mb-1">Collection Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCollectType("token")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
              collectType === "token" ? "bg-yellow-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Collect Tokens
          </button>
        </div>
      </div> */}

      {collectType === "token" && (
        <>
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">
              Select Token
            </label>
            <select
              value={selectedTokenIndex}
              onChange={(e) => setSelectedTokenIndex(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors text-sm"
              disabled={isPending || isConfirming || !allowedTokens?.length}
            >
              <option value="">Choose a token...</option>
              {allowedTokens?.map((token, index) => (
                <option key={index} value={index}>
                  {token.name} {token.symbol ? `(${token.symbol})` : ""} -{" "}
                  {token.address?.slice(0, 6)}...{token.address?.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">
              Amount
            </label>
            <input
              type="number"
              step={
                selectedTokenData?.decimals
                  ? `0.${"0".repeat(selectedTokenData.decimals - 1)}1`
                  : "0.000001"
              }
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors text-sm"
              disabled={isPending || isConfirming}
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={
          isPending ||
          isConfirming ||
          (collectType === "token" && (selectedTokenIndex === "" || !amount))
        }
        className="w-full flex items-center justify-center px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
      >
        {isPending || isConfirming ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Collecting Tokens...
          </>
        ) : (
          <>
            <FaDownload className="mr-2" />
            Collect Tokens
          </>
        )}
      </button>
    </form>
  );
};

export default CollectFundsForm;
