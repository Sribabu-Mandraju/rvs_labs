import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useWallet } from "../context/WalletContext";
import {
  FaLock,
  FaUnlock,
  FaClock,
  FaCoins,
  FaCalendarAlt,
  FaHourglassHalf,
  FaExternalLinkAlt,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = "https://lock-nft.onrender.com/market/owned-nfts";

const UserDeposits = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const [deposits, setDeposits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      if (!account) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}?address=${account}`);
        const data = await response.json();

        const formattedDeposits = data.nfts.map((nft) => ({
          tokenId: nft.tokenId,
          amount: ethers.formatUnits(nft.deposit.amount, 6),
          startTimestamp: Number(nft.deposit.startTimestamp),
          unlockTimestamp: Number(nft.deposit.unlockTimestamp),
          isLocked: nft.isLocked,
          periodMonths: nft.deposit.periodMonths,
          originalMinter: nft.deposit.originalMinter,
          tokenURI: nft.tokenURI,
          timeRemaining: Number(nft.timeRemaining),
        }));

        setDeposits(formattedDeposits);
      } catch (error) {
        console.error("Error fetching deposits:", error);
        toast.error("Failed to fetch deposits");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeposits();
  }, [account]);

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeRemaining = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const decodeTokenURI = (uri) => {
    try {
      if (uri.startsWith("data:application/json;base64,")) {
        const base64 = uri.replace("data:application/json;base64,", "");
        const json = atob(base64);
        return JSON.parse(json);
      }
      return null;
    } catch (error) {
      console.error("Error decoding token URI:", error);
      return null;
    }
  };

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
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
              Your Deposits
            </h1>
            <p className="text-gray-400">
              View and manage your staked USDC positions
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <FaSpinner className="animate-spin text-yellow-400 text-3xl" />
            </div>
          ) : deposits.length === 0 ? (
            <div className="text-center p-6 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 max-w-md mx-auto">
              <FaCoins className="text-yellow-400 text-3xl mx-auto mb-3" />
              <p className="text-gray-400">No deposits found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {deposits.map((deposit) => {
                const tokenData = decodeTokenURI(deposit.tokenURI);
                return (
                  <div
                    key={deposit.tokenId}
                    className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/10"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="bg-yellow-500/10 p-1.5 rounded-lg">
                          <FaCoins className="text-yellow-400 text-lg" />
                        </div>
                        <span className="text-lg font-bold text-yellow-400">
                          #{deposit.tokenId}
                        </span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          deposit.isLocked
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-green-500/10 text-green-400 border border-green-500/20"
                        }`}
                      >
                        {deposit.isLocked ? (
                          <div className="flex items-center space-x-1">
                            <FaLock className="text-xs" />
                            <span>Locked</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <FaUnlock className="text-xs" />
                            <span>Ready</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div className="bg-gray-800/50 rounded-lg p-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 flex items-center space-x-1.5 text-sm">
                            <FaCoins className="text-yellow-400" />
                            <span>Amount</span>
                          </span>
                          <span className="text-white font-semibold">
                            {deposit.amount} USDC
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 flex items-center space-x-1.5 text-sm">
                            <FaHourglassHalf className="text-yellow-400" />
                            <span>Period</span>
                          </span>
                          <span className="text-white font-semibold">
                            {deposit.periodMonths}m
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 flex items-center space-x-1.5 text-sm">
                            <FaCalendarAlt className="text-yellow-400" />
                            <span>Start</span>
                          </span>
                          <span className="text-white text-sm">
                            {formatDate(deposit.startTimestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 flex items-center space-x-1.5 text-sm">
                            <FaCalendarAlt className="text-yellow-400" />
                            <span>Unlock</span>
                          </span>
                          <span className="text-white text-sm">
                            {formatDate(deposit.unlockTimestamp)}
                          </span>
                        </div>
                      </div>

                      {deposit.isLocked && (
                        <div className="bg-gray-800/50 rounded-lg p-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 flex items-center space-x-1.5 text-sm">
                              <FaClock className="text-yellow-400" />
                              <span>Remaining</span>
                            </span>
                            <div className="flex items-center space-x-1 text-yellow-400 font-medium text-sm">
                              <span>
                                {formatTimeRemaining(deposit.timeRemaining)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-gray-500 bg-gray-800/50 p-2 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span>Minter:</span>
                          <span className="text-gray-400">
                            {deposit.originalMinter.slice(0, 4)}...
                            {deposit.originalMinter.slice(-4)}
                          </span>
                        </div>
                      </div>

                      <a
                        href={deposit.tokenURI}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-1.5 w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 p-2 rounded-lg transition-colors duration-300 text-xs"
                      >
                        <FaExternalLinkAlt className="text-xs" />
                        <span>View Details</span>
                      </a>

                      {tokenData && (
                        <div className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded-lg">
                          <p className="line-clamp-2">
                            {tokenData.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDeposits;
