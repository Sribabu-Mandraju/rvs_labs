"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHistory, FaHome, FaCoins, FaShieldAlt, FaBars, FaTimes, FaWater, FaLock, FaInfoCircle } from "react-icons/fa";
import axios from "axios";
import { useAccount } from "wagmi";

const UserDepositsDashboard = () => {
  const { address, isConnected, chain } = useAccount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [depositCount, setDepositCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigation links for header
  const navigationLinks = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Deposit", path: "/deposit", icon: FaCoins },
    { name: "History", path: "/user-deposits", icon: FaHistory },
    { name: "Admin", path: "/admin", icon: FaShieldAlt },
  ];

  // Fetch user deposits
  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/lockTimeNFT/userDeposits?userWalletAddress=${address}`
        );
        if (response.data.success) {
          setDeposits(response.data.deposits);
          setDepositCount(response.data.depositCount);
          // Calculate total amount (assuming 6 decimals for USDC)
          const total = response.data.deposits.reduce(
            (sum, deposit) => sum + parseInt(deposit.amount) / 1e6,
            0
          );
          setTotalAmount(total);
        } else {
          setError("Failed to fetch deposits");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  // Convert Unix timestamp to human-readable date
  const formatTimestamp = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format amount (assuming 6 decimals for USDC)
  const formatAmount = (amount) => {
    return (parseInt(amount) / 1e6).toFixed(2);
  };

  // Placeholder for Redeem button action
  const handleRedeem = (tokenId) => {
    // Future implementation for redeem action
    console.log(`Redeem clicked for tokenId: ${tokenId}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden flex flex-col">
      {/* Background overlay for texture */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-gray-800/20 to-black/60"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 lg:p-6 flex-shrink-0">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 border-2 border-yellow-400 rounded-lg flex items-center justify-center group-hover:border-yellow-300 transition-colors duration-300">
            <FaWater className="text-yellow-400 text-lg group-hover:text-yellow-300" />
          </div>
          <span className="text-yellow-400 font-bold text-lg hidden sm:block group-hover:text-yellow-300 transition-colors duration-300">
            River Labs
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navigationLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-yellow-400/10"
              >
                <IconComponent className="text-sm" />
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-yellow-400 hover:text-yellow-300 transition-colors duration-300 p-2"
          >
            {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
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
          className={`fixed top-0 right-0 h-full w-64 bg-gray-900/95 backdrop-blur-md transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="flex flex-col p-4 space-y-2">
            {navigationLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-yellow-400 transition-colors duration-300 px-3 py-3 rounded-lg hover:bg-yellow-400/10"
                >
                  <IconComponent className="text-lg" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content - Dashboard */}
      <main className="relative z-10 flex-1 px-4 lg:px-12 py-8 flex flex-col gap-6 min-h-0">
        {/* Dashboard Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">User Dashboard</h1>
          <p className="text-base text-gray-400">Manage your staked deposits and view details</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-xl p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center">
              <FaCoins className="text-xl text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Total Deposits</h3>
              <p className="text-lg font-semibold text-yellow-400">{depositCount}</p>
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-xl p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center">
              <FaLock className="text-xl text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Total Staked Amount</h3>
              <p className="text-lg font-semibold text-yellow-400">{totalAmount.toFixed(2)} USDC</p>
            </div>
          </div>
        </div>

        {/* Deposits List */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Your Deposits</h2>
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : deposits.length === 0 ? (
            <div className="text-center text-gray-400">No deposits found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deposits.map((deposit) => (
                <div
                  key={deposit.tokenId}
                  className="group bg-black/30 backdrop-blur-sm border border-gray-700 hover:border-yellow-400/50 rounded-xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/10"
                >
                  <div className="flex flex-col space-y-3">
                    {/* Token Info */}
                    <div className="flex items-center space-x-3">
                      <FaCoins className="text-yellow-400 text-lg" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-200">NFT #{deposit.tokenId}</h3>
                        <p className="text-sm text-gray-400">{deposit.tokenName}</p>
                      </div>
                    </div>
                    {/* Deposit Details */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Amount:</span> {formatAmount(deposit.amount)} USDC
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Start Date:</span> {formatTimestamp(deposit.startTimestamp)}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Lock Period:</span> {deposit.periodMonths} {deposit.periodMonths === "1" ? "Month" : "Months"}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Unlock Date:</span> {formatTimestamp(deposit.unlockTimestamp)}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Original Minter:</span>{" "}
                        {deposit.originalMinter.slice(0, 6)}...{deposit.originalMinter.slice(-4)}
                      </p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => handleRedeem(deposit.tokenId)}
                        className="flex-1 bg-yellow-400 text-black font-medium py-2 rounded-lg hover:bg-yellow-300 transition-colors duration-300"
                      >
                        Redeem
                      </button>
                      <a target="_blank"
                        href={`http://localhost:3000/lockTimeNFT/getTokenMetaData?tokenId=${deposit.tokenId}`}
                        className="flex-1 bg-gray-700 text-gray-200 font-medium py-2 rounded-lg hover:bg-gray-600 text-center transition-colors duration-300"
                      >
                        View Metadata
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex-shrink-0 p-4 text-center">
        <p className="text-xs text-gray-500">© 2025 River Labs IT Solutions. All rights reserved.</p>
      </footer>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-16 lg:h-24 bg-gradient-to-t from-yellow-400/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-32 h-32 lg:w-48 lg:h-48 bg-yellow-400/5 rounded-full blur-3xl transform -translate-x-16 lg:-translate-x-24 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-48 h-48 lg:w-72 lg:h-72 bg-yellow-400/3 rounded-full blur-3xl transform translate-x-24 lg:translate-x-36 pointer-events-none"></div>
    </div>
  );
};

export default UserDepositsDashboard;