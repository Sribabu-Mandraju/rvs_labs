import React, { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaShieldAlt,
  FaNetworkWired,
  FaEthereum,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

// Map chainId to chain name
const chains = [base, baseSepolia];
const getChainName = (chainId) => {
  const chain = chains.find((c) => c.id === chainId);
  return chain ? chain.name : "Unknown Network";
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isConnected || !address) {
        setError("Please connect your wallet");
        toast.error("Please connect your wallet");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://lock-nft.onrender.com//lockTimeNFT/adminMetaData?userAddress=${address}`
        );
        const data = await response.json();
        if (data.success) {
          setAdminData(data);
          setError(null);
        } else {
          setError(data.error);
          toast.error(data.error);
        }
      } catch (err) {
        const errorMessage = "Failed to fetch admin data";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error fetching admin data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected && address) {
      fetchAdminData();
    }
  }, [address, isConnected]);

  if (!isConnected || error === "Access restricted to contract owner") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-800">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <FaShieldAlt className="text-6xl text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h1>
            <p className="text-gray-400">
              You must be the contract owner to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </button>
          <div className="flex items-center text-gray-400 text-sm">
            <FaNetworkWired className="mr-2" />
            {getChainName(chainId)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm">
              View contract metadata and staking details
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center">
              <FaEthereum className="animate-spin text-yellow-400 text-4xl" />
            </div>
          ) : adminData ? (
            <div className="space-y-6">
              {/* Contract Overview */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Contract Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Owner Address</p>
                    <p className="text-white text-sm truncate">
                      {adminData.owner}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total NFTs Minted</p>
                    <p className="text-white text-sm">
                      {adminData.totalNFTsMinted}
                    </p>
                  </div>
                </div>
              </div>

              {/* Allowed Tokens */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Allowed Tokens
                </h2>
                {adminData.allowedTokens.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {adminData.allowedTokens.map((token, index) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between"
                      >
                        <span className="text-white text-sm truncate">
                          {token}
                        </span>
                        <a
                          href={`https://sepolia.basescan.org/address/${token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300 text-sm"
                        >
                          <FaExternalLinkAlt />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No allowed tokens</p>
                )}
              </div>

              {/* Deposited Balances */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Deposited Balances
                </h2>
                {adminData.depositedBalances.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                      <thead className="text-xs text-gray-300 uppercase bg-gray-800/50">
                        <tr>
                          <th className="px-4 py-2">Token Address</th>
                          <th className="px-4 py-2">Token Name</th>
                          <th className="px-4 py-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminData.depositedBalances.map((balance, index) => (
                          <tr key={index} className="border-t border-gray-700">
                            <td className="px-4 py-2">
                              <a
                                href={`https://sepolia.basescan.org/address/${balance.token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-400 hover:text-yellow-300 truncate"
                              >
                                {balance.token}
                              </a>
                            </td>
                            <td className="px-4 py-2">{balance.tokenName}</td>
                            <td className="px-4 py-2">
                              {parseFloat(
                                ethers.formatUnits(balance.balance, 6)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No deposited balances</p>
                )}
              </div>

              {/* Deposits */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Deposits
                </h2>
                {adminData.deposits.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                      <thead className="text-xs text-gray-300 uppercase bg-gray-800/50">
                        <tr>
                          <th className="px-4 py-2">Token ID</th>
                          <th className="px-4 py-2">Token</th>
                          <th className="px-4 py-2">Token Name</th>
                          <th className="px-4 py-2">Amount</th>
                          <th className="px-4 py-2">Period (Months)</th>
                          <th className="px-4 py-2">Start</th>
                          <th className="px-4 py-2">Unlock</th>
                          <th className="px-4 py-2">Minter</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminData.deposits.map((deposit) => (
                          <tr
                            key={deposit.tokenId}
                            className="border-t border-gray-700"
                          >
                            <td className="px-4 py-2">{deposit.tokenId}</td>
                            <td className="px-4 py-2">
                              <a
                                href={`https://sepolia.basescan.org/address/${deposit.depositToken}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-400 hover:text-yellow-300 truncate"
                              >
                                {deposit.depositToken.slice(0, 6)}...
                                {deposit.depositToken.slice(-4)}
                              </a>
                            </td>
                            <td className="px-4 py-2">{deposit.tokenName}</td>
                            <td className="px-4 py-2">
                              {parseFloat(
                                ethers.formatUnits(deposit.amount, 6)
                              ).toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              {deposit.periodMonths}
                            </td>
                            <td className="px-4 py-2">
                              {new Date(
                                Number(deposit.startTimestamp) * 1000
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">
                              {new Date(
                                Number(deposit.unlockTimestamp) * 1000
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">
                              <a
                                href={`https://sepolia.basescan.org/address/${deposit.originalMinter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-400 hover:text-yellow-300 truncate"
                              >
                                {deposit.originalMinter.slice(0, 6)}...
                                {deposit.originalMinter.slice(-4)}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No deposits found</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400">Failed to load admin data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
