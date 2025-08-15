"use client";

import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { FaCoins, FaSpinner } from "react-icons/fa";
import { useApproveAndDepositFunds } from "../../../interactions/StableZ_interactions";
import { useTokenMetadata } from "../../../interactions/StableZ_interactions";

const DepositFundsForm = ({ onSuccess, allowedTokens, chainId }) => {
  const [selectedToken, setSelectedToken] = useState("");
  const [amount, setAmount] = useState("");

  // Fetch token metadata using custom hook
  const tokenMetadata = useTokenMetadata(allowedTokens, chainId);

  // Memoize token options for dropdown
  const tokenOptions = useMemo(() => {
    if (!allowedTokens || !Array.isArray(allowedTokens)) {
      return [];
    }
    return allowedTokens.map((token) => ({
      address: token,
      name: tokenMetadata[token]?.name || "Loading...",
    }));
  }, [allowedTokens, tokenMetadata]);

  // Initialize the hook with tokenAddress and amountInWei
  const amountInWei = amount && selectedToken
    ? (BigInt(Math.floor(Number(amount) * 10 ** (tokenMetadata[selectedToken]?.decimals || 18)))).toString()
    : "0";

  const {
    approveTokens,
    depositFunds,
    needsApproval,
    isPending,
    isConfirming,
    isConfirmed,
    transactionStep,
    error,
    refetchAllowance,
  } = useApproveAndDepositFunds(selectedToken, amountInWei);

  const handleApprove = async () => {
    try {
      await approveTokens();
      // Refetch allowance to update needsApproval
      await refetchAllowance();
    } catch (err) {
      console.error("Error approving tokens:", err);
    }
  };

  const handleDeposit = async () => {
    try {
      await depositFunds();
      setSelectedToken("");
      setAmount("");
      onSuccess();
    } catch (err) {
      console.error("Error depositing funds:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedToken) {
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

    if (needsApproval) {
      await handleApprove();
    } else {
      await handleDeposit();
    }
  };

  // Handle loading state for metadata
  const isLoadingMetadata = allowedTokens?.some(
    (token) => !tokenMetadata[token] || tokenMetadata[token].name === "Loading..."
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Select Token</label>
        <select
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
          disabled={isPending || isConfirming || isLoadingMetadata || !tokenOptions.length}
        >
          <option value="">Choose a token...</option>
          {tokenOptions.map((token, index) => (
            <option key={index} value={token.address}>
              {token.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Amount</label>
        <input
          type="number"
          step={
            tokenMetadata[selectedToken]?.decimals
              ? `0.${"0".repeat(tokenMetadata[selectedToken].decimals - 1)}1`
              : "0.000001"
          }
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
          disabled={isPending || isConfirming || isLoadingMetadata}
        />
        <p className="text-gray-400 text-xs mt-1">Amount of tokens to deposit for covering staking rewards</p>
      </div>

      {isLoadingMetadata ? (
        <div className="flex items-center justify-center">
          <FaSpinner className="animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading token data...</span>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isPending || isConfirming || !selectedToken || !amount || isLoadingMetadata}
          className="w-full flex items-center justify-center px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {(isPending || isConfirming) ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {transactionStep === "approve" ? "Approving..." : "Depositing Funds..."}
            </>
          ) : (
            <>
              <FaCoins className="mr-2" />
              {needsApproval ? "Approve Tokens" : "Deposit Funds"}
            </>
          )}
        </button>
      )}
    </form>
  );
};

export default DepositFundsForm;