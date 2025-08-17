import React, { useState } from "react";
import {
  FaExternalLinkAlt,
  FaSearch,
  FaFilter,
  FaCoins,
  FaEye,
  FaChartBar,
  FaDownload,
} from "react-icons/fa";
import { ethers } from "ethers";


const DataTable = ({ title, children, icon: Icon, description }) => {
  return (
    <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
      <div className="p-6 lg:p-8 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-3 bg-gray-800/50 rounded-xl">
                <Icon className="text-yellow-400 text-xl" />
              </div>
            )}
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-white">
                {title}
              </h3>
              {description && (
                <p className="text-gray-400 text-sm mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
};

const ExternalLink = ({ href, children, className = "" }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`text-yellow-400 hover:text-yellow-300 transition-colors inline-flex items-center ${className}`}
  >
    {children}
    <FaExternalLinkAlt className="ml-1 text-xs" />
  </a>
);

const DataTables = ({ adminData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");

  // Helper function to safely format token amounts
  const formatTokenAmount = (amount, decimals = 18) => {
    try {
      // Ensure decimals is a valid number, default to 18 if invalid
      const validDecimals =
        typeof decimals === "number" && !isNaN(decimals) ? decimals : 18;
      return Number(ethers.formatUnits(amount, validDecimals)).toLocaleString();
    } catch (error) {
      console.warn("Error formatting token amount:", error);
      return "0";
    }
  };

  return (
    <div className="space-y-8 lg:space-y-12">
      {/* Header */}
      <div className="text-center mb-8 lg:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
          <FaChartBar className="text-2xl text-blue-400" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          Contract Data
        </h2>
        <p className="text-gray-400 text-lg lg:text-xl max-w-3xl mx-auto">
          Comprehensive view of all tokens, balances, and contract information.
          Monitor performance and track key metrics.
        </p>
      </div>

      {/* Allowed Tokens */}
      <DataTable
        title="Allowed Tokens"
        icon={FaFilter}
        description="All ERC20 tokens currently supported for staking"
      >
        {adminData.allowedTokensWithNames.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Token Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name & Symbol
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Max Cap
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {adminData.allowedTokensWithNames.map((token, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-mono text-sm bg-gray-800/50 p-2 rounded-lg border border-gray-600/50">
                      {token?.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <FaCoins className="text-blue-400 text-sm" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">
                          {token?.name}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {token?.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-yellow-400 font-bold text-sm">
                      {token?.maxCap
                        ? formatTokenAmount(token.maxCap, token.decimals)
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ExternalLink
                      href={`https://sepolia.basescan.org/address/${token?.address}`}
                    >
                      <span className="text-sm">View on Explorer</span>
                    </ExternalLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <FaCoins className="text-6xl text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No allowed tokens configured
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Add tokens through the Manage tab to get started
            </p>
          </div>
        )}
      </DataTable>

      {/* Deposited Balances */}
      <DataTable
        title="Deposited Balances"
        icon={FaCoins}
        description="Current token balances and utilization across all supported assets"
      >
        {adminData.depositedBalances.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Max Capacity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {adminData.depositedBalances.map((balance, index) => {
                try {
                  const tokenInfo = adminData.allowedTokensWithNames[index];
                  const decimals = tokenInfo?.decimals
                    ? parseInt(tokenInfo.decimals)
                    : 18;
                  const balanceValue = Number.parseFloat(
                    ethers.formatUnits(balance.balance, decimals)
                  );
                  const maxCapValue = tokenInfo
                    ? Number.parseFloat(
                        ethers.formatUnits(tokenInfo.maxCap, decimals)
                      )
                    : 0;
                  const utilization =
                    maxCapValue > 0 ? (balanceValue / maxCapValue) * 100 : 0;

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white font-mono text-sm bg-gray-800/50 p-2 rounded-lg border border-gray-600/50">
                          {balance.token.slice(0, 8)}...
                          {balance.token.slice(-6)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <FaCoins className="text-green-400 text-sm" />
                          </div>
                          <div className="text-white font-medium text-sm">
                            {tokenInfo?.name || "Unknown Token"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-yellow-400 font-bold text-sm">
                          $
                          {balanceValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-300 text-sm">
                          ${maxCapValue.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-700/50 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                utilization > 80
                                  ? "bg-red-500"
                                  : utilization > 60
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(utilization, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-gray-300 text-xs font-medium">
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ExternalLink
                          href={`https://sepolia.basescan.org/address/${balance.token}`}
                        >
                          <span className="text-sm">View Token</span>
                        </ExternalLink>
                      </td>
                    </tr>
                  );
                } catch (error) {
                  console.warn(
                    "Error rendering balance row for index:",
                    index,
                    error
                  );
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-red-400 text-sm">
                          Error loading data
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-red-400 text-sm">
                          Error loading data
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-red-400 text-sm">
                          Error loading data
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-red-400 text-sm">
                          Error loading data
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-red-400 text-sm">
                          Error loading data
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-red-400 text-sm">
                          Error loading data
                        </div>
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <FaCoins className="text-6xl text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No deposited balances found</p>
            <p className="text-gray-500 text-sm mt-2">
              Deposits will appear here once users start staking
            </p>
          </div>
        )}
      </DataTable>

      {/* Contract Summary */}
      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-gray-700/50 shadow-2xl">
        <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 flex items-center">
          <FaChartBar className="mr-3 text-blue-400" />
          Contract Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FaCoins className="text-blue-400 text-sm" />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">
                  Total Tokens
                </p>
                <p className="text-white font-bold text-lg">
                  {adminData.allowedTokensWithNames.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FaDownload className="text-green-400 text-sm" />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">
                  Active Balances
                </p>
                <p className="text-white font-bold text-lg">
                  {
                    adminData.depositedBalances.filter((b) => {
                      try {
                        const index = adminData.depositedBalances.indexOf(b);
                        const tokenInfo =
                          adminData.allowedTokensWithNames[index];
                        const decimals = tokenInfo?.decimals
                          ? parseInt(tokenInfo.decimals)
                          : 18;
                        const balanceValue = Number.parseFloat(
                          ethers.formatUnits(b.balance, decimals)
                        );
                        return balanceValue > 0;
                      } catch (error) {
                        return false;
                      }
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <FaEye className="text-yellow-400 text-sm" />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">Total NFTs</p>
                <p className="text-white font-bold text-lg">
                  {adminData.totalNFTsMinted}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FaFilter className="text-purple-400 text-sm" />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">Network</p>
                <p className="text-white font-bold text-sm">Base Sepolia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTables;
