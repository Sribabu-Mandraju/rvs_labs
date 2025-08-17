"use client";

import { useState, useMemo, useEffect } from "react";
import { FaCoins, FaSpinner } from "react-icons/fa";
import { useApproveAndDepositFunds } from "../../../interactions/StableZ_interactions";
import toast from "react-hot-toast";

const DepositFundsForm = ({ onSuccess, allowedTokens, chainId }) => {
  const [selectedToken, setSelectedToken] = useState("");
  const [amount, setAmount] = useState("");

  // Memoize token options for dropdown
  const tokenOptions = useMemo(() => {
    if (!allowedTokens || !Array.isArray(allowedTokens)) {
      return [];
    }
    return allowedTokens.map((token) => ({
      address: token.address,
      name: token.name,
    }));
  }, [allowedTokens]);

  // Helper function to get selected token data
  const selectedTokenData = useMemo(() => {
    if (!selectedToken || !allowedTokens) return null;
    return allowedTokens.find((token) => token.address === selectedToken);
  }, [selectedToken, allowedTokens]);

  // Calculate amountInWei based on token decimals
  const amountInWei =
    amount && selectedTokenData
      ? BigInt(
          Math.floor(Number(amount) * 10 ** (selectedTokenData.decimals || 18))
        ).toString()
      : "0";

  const {
    initiateDeposit,
    needsApproval,
    isApprovePending,
    isApproveConfirming,
    isDepositPending,
    isDepositConfirming,
    isDepositConfirmed,
    approveError,
    depositError,
    refetchAllowance,
  } = useApproveAndDepositFunds(selectedToken, amountInWei);

  // Handle successful deposit
  useEffect(() => {
    if (isDepositConfirmed) {
      toast.success("Deposit completed!", { id: "deposit-complete" });
      setSelectedToken("");
      setAmount("");
      onSuccess();
    }
  }, [isDepositConfirmed, onSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedToken) {
      toast.error("Please select a token", { id: "token-error" });
      return;
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount", { id: "amount-error" });
      return;
    }

    try {
      await initiateDeposit(selectedToken, amountInWei);
      await refetchAllowance(); // Ensure allowance is updated
    } catch (err) {
      console.error("Transaction error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Select Token
        </label>
        <select
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
          disabled={
            isApprovePending ||
            isApproveConfirming ||
            isDepositPending ||
            isDepositConfirming ||
            !tokenOptions.length
          }
        >
          <option value="">Choose a token...</option>
          {allowedTokens.map((token, index) => (
            <option key={index} value={token.address}>
              {token.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
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
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
          disabled={
            isApprovePending ||
            isApproveConfirming ||
            isDepositPending ||
            isDepositConfirming
          }
        />
        <p className="text-gray-400 text-xs mt-1">
          Amount of tokens to deposit for covering staking rewards
        </p>
      </div>

      {!allowedTokens || allowedTokens.length === 0 ? (
        <div className="flex items-center justify-center">
          <FaSpinner className="animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">No Token Data Available...</span>
        </div>
      ) : (
        <button
          type="submit"
          disabled={
            isApprovePending ||
            isApproveConfirming ||
            isDepositPending ||
            isDepositConfirming ||
            !selectedToken ||
            !amount
          }
          className="w-full flex items-center justify-center px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isApprovePending || isApproveConfirming ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Approving...
            </>
          ) : isDepositPending || isDepositConfirming ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Depositing Funds...
            </>
          ) : (
            <>
              <FaCoins className="mr-2" />
              {needsApproval ? "Approve and Deposit" : "Deposit Funds"}
            </>
          )}
        </button>
      )}
    </form>
  );
};

export default DepositFundsForm;
