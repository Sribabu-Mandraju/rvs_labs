"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaSpinner } from "react-icons/fa";
import { useAddAllowedToken } from "../../../interactions/StableZ_interactions";

const AddTokenForm = ({ onSuccess, chainId }) => {
  const [tokenAddress, setTokenAddress] = useState("");
  const { addAllowedToken, isPending, isConfirming, isConfirmed } = useAddAllowedToken();

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

    if (!tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error("Invalid address", {
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
      await addAllowedToken(tokenAddress);
    } catch (err) {
      // Errors are handled in the hook via toast notifications
    }
  };

  // Trigger onSuccess when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setTokenAddress(""); // Clear input on success
      onSuccess(); // Trigger parent callback to refetch admin data
    }
  }, [isConfirmed, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-gray-300 text-xs font-medium mb-1">
          Token Contract Address
        </label>
        <input
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="0x..."
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors text-sm"
          disabled={isPending || isConfirming}
        />
        <p className="text-gray-400 text-xs mt-1">
          Enter the contract address of the ERC20 token to allow for staking
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending || isConfirming || !tokenAddress.trim()}
        className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-lg hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
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
    </form>
  );
};

export default AddTokenForm;