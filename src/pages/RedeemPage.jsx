import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useWallet } from "../context/WalletContext";
import { FaSpinner, FaLock, FaUnlock, FaArrowLeft } from "react-icons/fa";
import TimeLockNFTStakingABI from "../abis/stablz.json";
import { useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = import.meta.env.VITE_STABLEZ_CONTRACT;

const RedeemPage = () => {
  const navigate = useNavigate();
  const { account, signer } = useWallet();
  const [tokenId, setTokenId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState({
    status: "",
    message: "",
    hash: "",
  });
  const [depositInfo, setDepositInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDepositInfo = async (id) => {
    if (!id || !signer) return;
    setIsLoading(true);
    try {
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TimeLockNFTStakingABI,
        signer
      );
      const info = await stakingContract.getDeposit(id);
      setDepositInfo({
        amount: ethers.formatUnits(info[0], 6),
        startTimestamp: new Date(Number(info[1]) * 1000),
        periodMonths: info[2],
        unlockTimestamp: new Date(Number(info[3]) * 1000),
        originalMinter: info[4],
      });
    } catch (error) {
      console.error("Error fetching deposit info:", error);
      setDepositInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokenId) {
      fetchDepositInfo(tokenId);
    } else {
      setDepositInfo(null);
    }
  }, [tokenId, signer]);

  const handleRedeem = async () => {
    if (!account || !signer) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (!tokenId) {
      toast.error("Please enter a token ID.");
      return;
    }

    try {
      setIsSubmitting(true);
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TimeLockNFTStakingABI,
        signer
      );

      setTxStatus({
        status: "pending",
        message: "Preparing transaction...",
        hash: "",
      });

      const tx = await stakingContract.redeem(tokenId);
      setTxStatus({
        status: "confirming",
        message: "Transaction submitted! Waiting for confirmation...",
        hash: tx.hash,
      });

      toast.info(
        <div>
          <p>Transaction submitted!</p>
          <a
            href={`https://basescan.org/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300"
          >
            View on BaseScan
          </a>
        </div>
      );

      await tx.wait();
      setTxStatus({
        status: "success",
        message: "Redeem successful!",
        hash: tx.hash,
      });
      toast.success("Redeem successful!");
      setTokenId("");
      setDepositInfo(null);
    } catch (err) {
      console.error("Error redeeming:", err);
      const errorMessage =
        err.code === 4001
          ? "Transaction rejected by user"
          : err.code === -32603
          ? "Transaction failed: Insufficient gas or invalid parameters"
          : err.message.includes("user rejected")
          ? "Transaction rejected by user"
          : err.message.includes("insufficient funds")
          ? "Insufficient funds for gas"
          : "Failed to redeem";

      setTxStatus({
        status: "error",
        message: errorMessage,
        hash: err.transaction?.hash || "",
      });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUnlocked = depositInfo && new Date() >= depositInfo.unlockTimestamp;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-auto">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
              Redeem Your Stake
            </h1>
            <p className="text-gray-400 text-lg">
              Unlock your staked usdt and claim your rewards
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Redeem Form */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                    Redeem Your Stake
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Token ID
                      </label>
                      <input
                        type="number"
                        value={tokenId}
                        onChange={(e) => setTokenId(e.target.value)}
                        placeholder="Enter token ID to redeem"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        disabled={isSubmitting}
                      />
                    </div>

                    <button
                      onClick={handleRedeem}
                      disabled={isSubmitting || !tokenId || !isUnlocked}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                        isSubmitting || !tokenId || !isUnlocked
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105"
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Processing...
                        </div>
                      ) : (
                        "Redeem"
                      )}
                    </button>
                  </div>
                </div>

                {txStatus.status && (
                  <div
                    className={`p-4 rounded-lg ${
                      txStatus.status === "error"
                        ? "bg-red-500/10 border border-red-500/20"
                        : txStatus.status === "success"
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-yellow-500/10 border border-yellow-500/20"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {txStatus.status === "pending" ||
                      txStatus.status === "confirming" ? (
                        <FaSpinner className="animate-spin text-yellow-400 mt-1" />
                      ) : txStatus.status === "success" ? (
                        <FaLock className="text-green-400 mt-1" />
                      ) : (
                        <FaUnlock className="text-red-400 mt-1" />
                      )}
                      <div>
                        <p
                          className={`text-sm ${
                            txStatus.status === "error"
                              ? "text-red-400"
                              : txStatus.status === "success"
                              ? "text-green-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {txStatus.message}
                        </p>
                        {txStatus.hash && (
                          <a
                            href={`https://basescan.org/tx/${txStatus.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-400 hover:text-yellow-300 text-xs mt-1 block"
                          >
                            View on BaseScan
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Deposit Info & Status */}
              <div className="lg:col-span-7 space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <FaSpinner className="animate-spin text-yellow-400 text-2xl" />
                  </div>
                ) : depositInfo ? (
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                      Deposit Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-gray-900/50 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-1">
                            Amount
                          </div>
                          <div className="text-xl font-semibold text-white">
                            {depositInfo.amount} usdt
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-1">
                            Lock Period
                          </div>
                          <div className="text-xl font-semibold text-white">
                            {depositInfo.periodMonths} Months
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gray-900/50 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-1">
                            Start Date
                          </div>
                          <div className="text-xl font-semibold text-white">
                            {depositInfo.startTimestamp.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-1">
                            Unlock Date
                          </div>
                          <div className="text-xl font-semibold text-white">
                            {depositInfo.unlockTimestamp.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 bg-gray-900/50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">Status</div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isUnlocked
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {isUnlocked ? "Unlocked" : "Locked"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-lg p-6 text-center text-gray-400">
                    Enter a token ID to view deposit information
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemPage;
