"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { useUpdateMaxCap } from "../../../interactions/StableZ_interactions";
import { ethers } from "ethers";

const UpdateMaxCapForm = ({ onSuccess, allowedTokens, chainId }) => {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState("");
  const [newCap, setNewCap] = useState("");
  const {
    updateMaxCap,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useUpdateMaxCap();

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

  // Get token decimals for calculations
  const decimals = selectedTokenData?.decimals || 18;

  // Reset form when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setSelectedTokenIndex("");
      setNewCap("");
    }
  }, [isConfirmed]);

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    if (!newCap || Number.parseFloat(newCap) <= 0) {
      toast.error("Please enter a valid cap amount", {
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

      // Validate cap conversion
      if (isNaN(Number(newCap)) || Number(newCap) <= 0) {
        toast.error("Please enter a valid cap amount greater than 0", {
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

      // Convert cap to wei using token-specific decimals
      const capInWei = BigInt(
        Math.floor(Number(newCap) * 10 ** decimals)
      ).toString();

      // Validate the converted cap
      if (BigInt(capInWei) <= 0n) {
        toast.error("Converted cap is too small", {
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

      await updateMaxCap(selectedTokenData.address, capInWei);
      onSuccess();
    } catch (err) {
      // Error handling is managed by the hook's toast notifications
      console.error("Error updating max cap:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
        <div className="flex items-center text-blue-400 mb-2">
          <FaInfoCircle className="mr-2" />
          <span className="font-medium text-sm">Info</span>
        </div>
        <p className="text-blue-300 text-xs">
          Update the maximum cap for allowed tokens. The new cap must be greater
          than the current deposited balance.
        </p>
      </div>

      <div>
        <label className="block text-gray-300 text-xs font-medium mb-1">
          Select Token
        </label>
        <select
          value={selectedTokenIndex}
          onChange={(e) => setSelectedTokenIndex(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
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
          New Max Cap
        </label>
        <input
          type="number"
          step="0.000001"
          min="0"
          value={newCap}
          onChange={(e) => setNewCap(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
          disabled={isPending || isConfirming}
        />
        {/* Cap Preview */}
        {selectedTokenData && (
          <div className="mt-2 p-3 bg-gray-700 rounded-lg border border-gray-600">
            {/* <div className="flex justify-between text-xs">
              <span className="text-gray-400">Current Max Cap:</span>
              <span className="text-white">
                {selectedTokenData.currentCap
                  ? `${(
                      Number(selectedTokenData.currentCap) /
                      10 ** (selectedTokenData.decimals || 18)
                    ).toLocaleString()} ${
                      selectedTokenData.name ||
                      selectedTokenData.symbol ||
                      "tokens"
                    }`
                  : "Not available"}
              </span>
            </div> */}
            {newCap && !isNaN(Number(newCap)) && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-400">New Max Cap:</span>
                <span className="text-blue-400 font-medium">
                  {Number(newCap).toLocaleString()}{" "}
                  {selectedTokenData.name ||
                    selectedTokenData.symbol ||
                    "tokens"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={
          isPending || isConfirming || selectedTokenIndex === "" || !newCap
        }
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
      >
        {isPending || isConfirming ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Updating Max Cap...
          </>
        ) : (
          <>
            <FaEdit className="mr-2" />
            Update Max Cap
          </>
        )}
      </button>
    </form>
  );
};

export default UpdateMaxCapForm;
