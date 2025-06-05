"use client";

import {
  FaHome,
  FaCode,
  FaKey,
  FaWallet,
  FaWater,
  FaCoins,
  FaUndo,
  FaHistory,
  FaShieldAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import WalletModal from "../components/WalletModal";

const Landing = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    account,
    disconnectWallet,
    isConnected,
    setUsdtAddress,
  } = useWallet();
  const navigate = useNavigate();

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };

  const handleCardClick = (route) => {
    navigate(route);
  };

  const navigationLinks = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Deposit", path: "/deposit", icon: FaCoins },
    { name: "Redeem", path: "/redeem", icon: FaUndo },
    { name: "History", path: "/user-deposits", icon: FaHistory },
    { name: "Admin", path: "/admin", icon: FaShieldAlt },
  ];

  const gridCards = [
    {
      title: "DEPOSIT",
      icon: FaCoins,
      route: "/deposit",
      description: "Stake your tokens and earn rewards",
    },
    {
      title: "REDEEM",
      icon: FaUndo,
      route: "/redeem",
      description: "Withdraw your staked tokens",
    },
    {
      title: "HISTORY",
      icon: FaHistory,
      route: "/user-deposits",
      description: "View your deposit history",
    },
    {
      title: "DEVELOPMENT",
      icon: FaCode,
      route: "/deposit",
      description: "Custom development services",
    },
    {
      title: "LICENSE KEYS",
      icon: FaKey,
      route: "/deposit",
      description: "Software licensing solutions",
    },
    {
      title: "ADMIN PANEL",
      icon: FaShieldAlt,
      route: "/admin",
      description: "Administrative controls",
    },
  ];

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden flex flex-col">
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

        {/* Mobile Menu Button & Wallet */}
        <div className="flex items-center space-x-3">
          {/* Connect Wallet Button */}
          <button
            onClick={isConnected ? disconnectWallet : handleConnectWallet}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-2 px-3 lg:px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/25 flex items-center space-x-2 text-xs lg:text-sm"
          >
            <FaWallet className="text-sm" />
            <span className="hidden sm:inline">
              {isConnected && account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : "Connect Wallet"}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-yellow-400 hover:text-yellow-300 transition-colors duration-300 p-2"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
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

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-4 lg:px-12 py-4 lg:py-8 gap-6 lg:gap-12 min-h-0">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl text-center lg:text-left flex-shrink-0">
          <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold text-yellow-400 mb-3 lg:mb-4 leading-tight">
            Welcome
          </h1>
          <h2 className="text-lg lg:text-xl xl:text-2xl text-gray-300 mb-3 lg:mb-4 font-light">
            We are River Labs IT Solutions
          </h2>
          <p className="text-sm lg:text-base text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
            We make custom pages, smart contracts, shops, websites, you name it.
            Just contact us to get started!
          </p>
        </div>

        {/* Right Content - Cards Grid */}
        <div className="flex-1 max-w-2xl w-full flex-shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {gridCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.title}
                  onClick={() => handleCardClick(card.route)}
                  className="group bg-black/30 backdrop-blur-sm border border-gray-700 hover:border-yellow-400/50 rounded-xl p-3 lg:p-4 transition-all duration-300 cursor-pointer hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/10"
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center group-hover:from-yellow-400/30 group-hover:to-yellow-600/30 transition-all duration-300">
                      <IconComponent className="text-lg lg:text-2xl text-yellow-400 group-hover:text-yellow-300" />
                    </div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-200 group-hover:text-yellow-400 transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300 hidden lg:block">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex-shrink-0 p-4 text-center">
        <p className="text-xs text-gray-500">
          © 2024 River Labs IT Solutions. All rights reserved.
        </p>
      </footer>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-16 lg:h-24 bg-gradient-to-t from-yellow-400/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-32 h-32 lg:w-48 lg:h-48 bg-yellow-400/5 rounded-full blur-3xl transform -translate-x-16 lg:-translate-x-24 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-48 h-48 lg:w-72 lg:h-72 bg-yellow-400/3 rounded-full blur-3xl transform translate-x-24 lg:translate-x-36 pointer-events-none"></div>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
};

export default Landing;
