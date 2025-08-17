"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useBalance } from "wagmi";
import { useDeposit } from "../interactions/StableZUser_interactoins";
import { baseSepolia } from "wagmi/chains";
import toast from "react-hot-toast";
import axios from "axios";
import {
  FaCoins,
  FaLock,
  FaWallet,
  FaArrowLeft,
  FaBars,
  FaTimes,
  FaWater,
  FaHome,
  FaHistory,
  FaShieldAlt,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Deposit() {
  const { address, isConnected, chain } = useAccount();
  const [amount, setAmount] = useState("");
  const [periodMonths, setPeriodMonths] = useState("1");
  const [selectedToken, setSelectedToken] = useState("");
  const [publicMetaData, setPublicMetaData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    approveToken,
    deposit,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    approveError,
    isDepositPending,
    isDepositConfirming,
    isDepositConfirmed,
    depositError,
    allowance,
    tokenBalance,
    allowanceError,
    tokenBalanceError,
  } = useDeposit(selectedToken);

  // Check ETH balance for gas (0.001 ETH threshold)
  const { data: balanceData } = useBalance({ address });
  const hasEnoughGas = balanceData && balanceData.value >= 0.001 * 10 ** 18;

  // Validate inputs
  const isCorrectNetwork = chain && chain.id === baseSepolia.id;
  const isValidAmount =
    amount !== "" && Number(amount) > 0 && Number.isFinite(Number(amount));
  const isValidPeriod = ["1", "2", "3"].includes(periodMonths);
  const isValidToken =
    selectedToken !== "" &&
    publicMetaData?.allowedTokens?.some(
      (token) => token.address === selectedToken
    );

  const depositAmount = isValidAmount
    ? BigInt(Math.floor(Number(amount) * 10 ** 6))
    : BigInt(0);
  const hasEnoughBalance = tokenBalance >= depositAmount;
  const hasEnoughAllowance = allowance >= depositAmount;

  // Navigation links for header
  const navigationLinks = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Deposit", path: "/deposit", icon: FaCoins },
    { name: "History", path: "/user-deposits", icon: FaHistory },
    { name: "Admin", path: "/admin", icon: FaShieldAlt },
  ];

  // Fetch publicMetaData
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/lockTimeNFT/publicMetaData"
        );
        if (response.data.success) {
          setPublicMetaData(response.data);
          if (response.data.allowedTokens?.length > 0) {
            setSelectedToken(response.data.allowedTokens[0].address);
          }
        } else {
          toast.error("Failed to fetch public metadata.", {
            id: "metadata-error",
          });
        }
      } catch (error) {
        console.error("Error fetching publicMetaData:", error);
        toast.error("Error fetching public metadata.", {
          id: "metadata-error",
        });
      }
    };
    fetchMetaData();
  }, []);

  // Ref to track toast ID
  const toastIdRef = useRef(null);

  // Ref to store deposit parameters for auto-trigger
  const depositParamsRef = useRef(null);

  // Auto-trigger deposit after approval confirmation
  useEffect(() => {
    if (isApproveConfirmed && depositParamsRef.current) {
      const { token, amount, periodMonths } = depositParamsRef.current;
      console.log("Approval confirmed, auto-triggering deposit...", {
        token,
        amount,
        periodMonths,
      });
      deposit(token, amount, periodMonths).catch((err) => {
        console.error("Auto-deposit error:", err);
      });
      depositParamsRef.current = null;
    }
  }, [isApproveConfirmed, deposit]);

  // Handle deposit (with approval if needed)
  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet.", { id: "connect-wallet" });
      return;
    }
    if (!isCorrectNetwork) {
      toast.error("Please switch to Base Sepolia network.", {
        id: "network-error",
      });
      return;
    }
    if (!hasEnoughGas) {
      toast.error("Insufficient ETH for gas fees (minimum 0.001 ETH).", {
        id: "gas-error",
      });
      return;
    }
    if (!isValidToken) {
      toast.error("Please select a valid token.", { id: "token-error" });
      return;
    }
    if (!isValidAmount) {
      toast.error("Please enter a valid deposit amount.", {
        id: "amount-error",
      });
      return;
    }
    if (!isValidPeriod) {
      toast.error("Please select a valid lock period (1, 2, or 3 months).", {
        id: "period-error",
      });
      return;
    }
    if (!hasEnoughBalance) {
      toast.error(
        `Insufficient token balance (need ${
          Number(depositAmount) / 10 ** 6
        } tokens).`,
        {
          id: "balance-error",
        }
      );
      return;
    }
    if (allowanceError) {
      toast.error(
        `Error checking allowance: ${allowanceError.message.slice(0, 100)}...`,
        { id: "allowance-error" }
      );
      return;
    }
    if (tokenBalanceError) {
      toast.error(
        `Error checking token balance: ${tokenBalanceError.message.slice(
          0,
          100
        )}...`,
        {
          id: "balance-error",
        }
      );
      return;
    }

    try {
      if (!hasEnoughAllowance) {
        console.log(
          "Calling approveToken with amount:",
          depositAmount.toString()
        );
        depositParamsRef.current = {
          token: selectedToken,
          amount: depositAmount,
          periodMonths: Number(periodMonths),
        };
        await approveToken(depositAmount);
      } else {
        console.log("Calling deposit with token, amount, periodMonths:", {
          token: selectedToken,
          amount: depositAmount.toString(),
          periodMonths,
        });
        await deposit(selectedToken, depositAmount, Number(periodMonths));
      }
    } catch (err) {
      console.error("Transaction error:", err);
    }
  };

  // Toast notifications for transaction states
  useEffect(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }
    if (isApprovePending) {
      toastIdRef.current = toast.loading("Approving token...");
    } else if (isDepositPending) {
      toastIdRef.current = toast.loading("Depositing token...");
    } else if (isApproveConfirming) {
      toastIdRef.current = toast.loading("Confirming token approval...");
    } else if (isDepositConfirming) {
      toastIdRef.current = toast.loading("Confirming deposit...");
    } else if (isApproveConfirmed && depositParamsRef.current) {
      toastIdRef.current = toast.loading(
        "Approval confirmed, initiating deposit..."
      );
    } else if (isDepositConfirmed) {
      toastIdRef.current = toast.success("Token deposited successfully!");
    } else if (approveError) {
      const isCancelled =
        approveError.code === 4001 ||
        /rejected|denied|cancelled/i.test(approveError.message);
      toastIdRef.current = toast.error(
        isCancelled
          ? "Approval transaction cancelled"
          : `Approval error: ${approveError.message.slice(0, 100)}...`
      );
    } else if (depositError) {
      const isCancelled =
        depositError.code === 4001 ||
        /rejected|denied|cancelled/i.test(depositError.message);
      toastIdRef.current = toast.error(
        isCancelled
          ? "Deposit transaction cancelled"
          : `Deposit error: ${depositError.message.slice(0, 100)}...`
      );
    }
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [
    isApprovePending,
    isDepositPending,
    isApproveConfirming,
    isDepositConfirming,
    isApproveConfirmed,
    isDepositConfirmed,
    approveError,
    depositError,
  ]);

  // Format amount for display
  const formatAmount = (value) =>
    value > 0 ? (Number(value) / 10 ** 6).toFixed(2) : "0.00";

  // Get token name for display
  const getTokenName = (tokenAddress) => {
    const token = publicMetaData?.allowedTokens?.find(
      (t) => t.address === tokenAddress
    );
    return token ? token.name : "Tokens";
  };

  // Calculate potential rewards
  const calculateRewards = () => {
    if (!isValidAmount || !publicMetaData) return "0.00";
    const roiMap = {
      1: publicMetaData.roi1m,
      2: publicMetaData.roi2m,
      3: publicMetaData.roi3m,
    };
    const roi = Number(roiMap[periodMonths] || 0) / 100;
    const rewards = Number(amount) * (roi / 100);
    return rewards.toFixed(4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/2 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 bg-black/20 backdrop-blur-xl border-b border-gray-700/50">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-all duration-300 group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Home</span>
            </button>

            {/* Desktop Navigation */}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-yellow-400">Navigation</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <nav className="space-y-2">
              {navigationLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-gray-300 hover:text-yellow-400 transition-all duration-300 px-4 py-3 rounded-xl hover:bg-yellow-400/10 group"
                  >
                    <IconComponent className="text-lg group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400/10 rounded-2xl mb-6">
            <FaCoins className="text-2xl text-yellow-400" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Stake Your Tokens
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Earn rewards by staking your tokens with our secure TimeLock NFT
            system
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Wallet Status Card */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                  <FaWallet className="text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Wallet Status
                </h3>
              </div>

              {isConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FaCheckCircle className="text-green-400 text-sm" />
                    <span className="text-sm text-gray-300">Connected</span>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Address</p>
                    <p className="text-sm font-mono text-white">
                      {address?.slice(0, 8)}...{address?.slice(-6)}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">ETH Balance</p>
                    <p className="text-sm text-white">
                      {balanceData
                        ? (Number(balanceData.value) / 10 ** 18).toFixed(4)
                        : "0.0000"}{" "}
                      ETH
                    </p>
                  </div>
                  {!isCorrectNetwork && (
                    <div className="flex items-center space-x-2 text-red-400">
                      <FaExclamationTriangle className="text-sm" />
                      <span className="text-sm">Switch to Base Sepolia</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaExclamationTriangle className="text-yellow-400 text-2xl mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Please connect your wallet
                  </p>
                </div>
              )}
            </div>

            {/* ROI Information */}
            {publicMetaData && (
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                    <FaChartLine className="text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    ROI Rates
                  </h3>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      period: "1 Month",
                      roi: publicMetaData.roi1m,
                      icon: "🚀",
                    },
                    {
                      period: "2 Months",
                      roi: publicMetaData.roi2m,
                      icon: "💎",
                    },
                    {
                      period: "3 Months",
                      roi: publicMetaData.roi3m,
                      icon: "👑",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm text-gray-300">
                          {item.period}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-yellow-400">
                        {(Number(item.roi) / 100).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center Column - Deposit Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                  <FaLock className="text-yellow-400 text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Stake Tokens
                  </h2>
                  <p className="text-gray-400">
                    Lock your tokens to earn rewards
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Token Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Select Token
                  </label>
                  <div className="relative">
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="w-full p-4 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="">Choose a token</option>
                      {publicMetaData?.allowedTokens?.map((token) => (
                        <option key={token.address} value={token.address}>
                          {token.name}
                        </option>
                      ))}
                    </select>
                    <FaCoins className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {selectedToken && (
                    <p className="text-xs text-gray-400">
                      Balance: {formatAmount(tokenBalance)}{" "}
                      {getTokenName(selectedToken)}
                    </p>
                  )}
                </div>

                {/* Lock Period */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Lock Period
                  </label>
                  <div className="relative">
                    <select
                      value={periodMonths}
                      onChange={(e) => setPeriodMonths(e.target.value)}
                      className="w-full p-4 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="1">
                        1 Month (
                        {(Number(publicMetaData?.roi1m || 0) / 100).toFixed(2)}%
                        ROI)
                      </option>
                      <option value="2">
                        2 Months (
                        {(Number(publicMetaData?.roi2m || 0) / 100).toFixed(2)}%
                        ROI)
                      </option>
                      <option value="3">
                        3 Months (
                        {(Number(publicMetaData?.roi3m || 0) / 100).toFixed(2)}%
                        ROI)
                      </option>
                    </select>
                    <FaClock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2 mb-8">
                <label className="block text-sm font-medium text-gray-300">
                  Deposit Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-4 pr-20 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 text-lg"
                    placeholder="0.00"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    {getTokenName(selectedToken)}
                  </div>
                </div>
                {/* {isValidAmount && (
                  <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaInfoCircle className="text-yellow-400 text-sm" />
                      <span className="text-sm font-medium text-yellow-400">Estimated Rewards</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      +{calculateRewards()} {getTokenName(selectedToken)}
                    </p>
                    <p className="text-xs text-gray-400">
                      After {periodMonths} month{periodMonths !== "1" ? "s" : ""} lock period
                    </p>
                  </div>
                )} */}
              </div>

              {/* Action Button */}
              <button
                onClick={handleDeposit}
                disabled={
                  isApprovePending ||
                  isApproveConfirming ||
                  isDepositPending ||
                  isDepositConfirming ||
                  !hasEnoughBalance ||
                  !hasEnoughGas ||
                  !isConnected ||
                  !isCorrectNetwork ||
                  !isValidAmount ||
                  !isValidPeriod ||
                  !isValidToken ||
                  allowanceError ||
                  tokenBalanceError
                }
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                  isApprovePending ||
                  isApproveConfirming ||
                  isDepositPending ||
                  isDepositConfirming ||
                  !hasEnoughBalance ||
                  !hasEnoughGas ||
                  !isConnected ||
                  !isCorrectNetwork ||
                  !isValidAmount ||
                  !isValidPeriod ||
                  !isValidToken ||
                  allowanceError ||
                  tokenBalanceError
                    ? "bg-gray-600 cursor-not-allowed opacity-50 text-gray-300"
                    : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isApprovePending || isApproveConfirming
                  ? "Processing Approval..."
                  : isDepositPending || isDepositConfirming
                  ? "Processing Deposit..."
                  : hasEnoughAllowance
                  ? "Stake Tokens"
                  : "Approve & Stake"}
              </button>

              {/* Status Messages */}
              {!isConnected && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FaExclamationTriangle className="text-red-400" />
                    <span className="text-sm text-red-400">
                      Please connect your wallet to continue
                    </span>
                  </div>
                </div>
              )}

              {isConnected && !isCorrectNetwork && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FaExclamationTriangle className="text-yellow-400" />
                    <span className="text-sm text-yellow-400">
                      Please switch to Base Sepolia network
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Staking Information Dashboard */}
        {publicMetaData && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Platform Overview
              </h2>
              <p className="text-gray-400">
                Current staking statistics and information
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Allowed Tokens */}
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center">
                    <FaCoins className="text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Supported Tokens
                  </h3>
                </div>
                <div className="space-y-2">
                  {publicMetaData.allowedTokens.map((token, index) => (
                    <div
                      key={token.address}
                      className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg"
                    >
                      <span className="text-sm text-gray-300">
                        {token.name}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {token.address.slice(0, 6)}...{token.address.slice(-4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Deposited */}
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center">
                    <FaWater className="text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Total Value Locked
                  </h3>
                </div>
                <div className="space-y-2">
                  {publicMetaData.depositedBalances.map((bal, index) => (
                    <div
                      key={bal.token}
                      className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg"
                    >
                      <span className="text-sm text-gray-300">{bal.name}</span>
                      <span className="text-sm font-semibold text-white">
                        {formatAmount(bal.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Stats */}
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl md:col-span-2 lg:col-span-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-400/10 rounded-xl flex items-center justify-center">
                    <FaChartLine className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Platform Stats
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Max ROI</span>
                    <span className="text-sm font-semibold text-green-400">
                      {Math.max(
                        Number(publicMetaData.roi1m),
                        Number(publicMetaData.roi2m),
                        Number(publicMetaData.roi3m)
                      ) / 100}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Lock Periods</span>
                    <span className="text-sm font-semibold text-white">
                      1-3 Months
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Security</span>
                    <span className="text-sm font-semibold text-yellow-400">
                      NFT Locked
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!publicMetaData && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <span className="text-lg text-gray-400">
                Loading platform data...
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700/50 bg-black/20 backdrop-blur-xl mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 River Labs IT Solutions. All rights reserved.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Secure staking powered by blockchain technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Deposit;
