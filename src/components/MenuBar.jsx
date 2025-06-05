import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCode,
  FaKey,
  FaUsers,
  FaWallet,
  FaWater,
  FaBars,
  FaTimes,
  FaChartLine,
  FaCog,
  FaInfoCircle,
} from "react-icons/fa";
import { useWallet } from "../context/WalletContext";
import WalletModal from "./WalletModal";

const MenuBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { account, disconnectWallet, isConnected } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".menu-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const menuItems = [
    { name: "Home", icon: FaHome, path: "/" },
    { name: "Development", icon: FaCode, path: "/deposit" },
    { name: "License Keys", icon: FaKey, path: "/license" },
    { name: "Contact", icon: FaUsers, path: "/contact" },
    { name: "Dashboard", icon: FaChartLine, path: "/dashboard" },
    { name: "Admin", icon: FaCog, path: "/admin" },
    { name: "About", icon: FaInfoCircle, path: "/about" },
  ];

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-black/30 backdrop-blur-sm border border-gray-700 hover:border-yellow-400/50 transition-all duration-300"
      >
        {isOpen ? (
          <FaTimes className="text-yellow-400 text-xl" />
        ) : (
          <FaBars className="text-yellow-400 text-xl" />
        )}
      </button>

      {/* Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Menu Content */}
        <div
          className={`menu-container fixed top-0 right-0 h-full w-64 bg-gray-900/95 backdrop-blur-md transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Logo */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border-2 border-yellow-400 rounded-lg flex items-center justify-center">
                <FaWater className="text-yellow-400 text-lg" />
              </div>
              <span className="text-yellow-400 font-semibold">River Labs</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      location.pathname === item.path
                        ? "bg-yellow-400/20 text-yellow-400"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-yellow-400"
                    }`}
                  >
                    <item.icon className="text-lg" />
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Wallet Button */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={isConnected ? disconnectWallet : handleConnectWallet}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-yellow-400/25 flex items-center justify-center space-x-2"
            >
              <FaWallet className="text-base" />
              <span>
                {isConnected && account
                  ? `${account.slice(0, 6)}...${account.slice(-4)}`
                  : "Connect Wallet"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};

export default MenuBar;