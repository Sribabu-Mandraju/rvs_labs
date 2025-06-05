import React, { useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useWallet } from "../context/WalletContext";
import {
  FaSpinner,
  FaArrowLeft,
  FaPercentage,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import TimeLockNFTStakingABI from "../abis/stablz.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_STABLEZ_CONTRACT;

const SetROIPage = () => {
  const navigate = useNavigate();
  const { account, signer } = useWallet();
  const [roi3m, setRoi3m] = useState("");
  const [roi6m, setRoi6m] = useState("");
  const [roi12m, setRoi12m] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState({
    status: "",
    message: "",
    hash: "",
  });

  const handleUpdateROIs = async () => {
    if (!account || !signer) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (
      !roi3m ||
      !roi6m ||
      !roi12m ||
      isNaN(roi3m) ||
      isNaN(roi6m) ||
      isNaN(roi12m)
    ) {
      toast.error("Please enter valid ROI percentages.");
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

      // Convert ROIs to basis points (1% = 100 basis points)
      const roi3mBps = Math.round(parseFloat(roi3m) * 100);
      const roi6mBps = Math.round(parseFloat(roi6m) * 100);
      const roi12mBps = Math.round(parseFloat(roi12m) * 100);

      const tx = await stakingContract.setROIs(roi3mBps, roi6mBps, roi12mBps);
      setTxStatus({
        status: "confirming",
        message: "Transaction submitted! Waiting for confirmation...",
        hash: tx.hash,
      });

      toast.info(
        <div>
          <p>Transaction submitted!</p>
          <a
            href={`https://sepolia.basescan.org/tx/${tx.hash}`}
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
        message: "ROIs updated successfully!",
        hash: tx.hash,
      });
      toast.success("ROIs updated successfully!");

      // Reset form
      setRoi3m("");
      setRoi6m("");
      setRoi12m("");
    } catch (err) {
      console.error("Error updating ROIs:", err);
      let errorMessage = "Failed to update ROIs";
      if (err.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (err.code === -32603) {
        errorMessage =
          "Transaction failed: Insufficient gas or invalid parameters";
      } else if (err.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      }

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

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">
              Update ROI Rates
            </h1>
            <p className="text-gray-400 text-sm">
              Set new ROI percentages for different lock periods
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="space-y-3">
              {/* 3 Months ROI */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-yellow-500/10 p-1.5 rounded-lg">
                    <FaCalendarAlt className="text-yellow-400 text-sm" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    3 Months ROI
                  </h3>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={roi3m}
                    onChange={(e) => setRoi3m(e.target.value)}
                    placeholder="Enter ROI percentage"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaPercentage className="text-sm" />
                  </div>
                </div>
              </div>

              {/* 6 Months ROI */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-yellow-500/10 p-1.5 rounded-lg">
                    <FaCalendarAlt className="text-yellow-400 text-sm" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    6 Months ROI
                  </h3>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={roi6m}
                    onChange={(e) => setRoi6m(e.target.value)}
                    placeholder="Enter ROI percentage"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaPercentage className="text-sm" />
                  </div>
                </div>
              </div>

              {/* 12 Months ROI */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-yellow-500/10 p-1.5 rounded-lg">
                    <FaCalendarAlt className="text-yellow-400 text-sm" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    12 Months ROI
                  </h3>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={roi12m}
                    onChange={(e) => setRoi12m(e.target.value)}
                    placeholder="Enter ROI percentage"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaPercentage className="text-sm" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleUpdateROIs}
                disabled={isSubmitting || !roi3m || !roi6m || !roi12m}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 text-sm ${
                  isSubmitting || !roi3m || !roi6m || !roi12m
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-[1.02]"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  "Update ROI Rates"
                )}
              </button>

              {/* Transaction Status */}
              {txStatus.status && (
                <div
                  className={`p-3 rounded-lg ${
                    txStatus.status === "error"
                      ? "bg-red-500/10 border border-red-500/20"
                      : txStatus.status === "success"
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-yellow-500/10 border border-yellow-500/20"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {txStatus.status === "pending" ||
                    txStatus.status === "confirming" ? (
                      <FaSpinner className="animate-spin text-yellow-400 mt-0.5 text-sm" />
                    ) : txStatus.status === "success" ? (
                      <FaCheckCircle className="text-green-400 mt-0.5 text-sm" />
                    ) : (
                      <FaTimesCircle className="text-red-400 mt-0.5 text-sm" />
                    )}
                    <div>
                      <p
                        className={`text-xs ${
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
                          href={`https://sepolia.basescan.org/tx/${txStatus.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300 text-xs mt-0.5 flex items-center"
                        >
                          <FaExternalLinkAlt className="mr-1 text-xs" />
                          View on BaseScan
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetROIPage;
