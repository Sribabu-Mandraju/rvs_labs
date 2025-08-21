import React, { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaShieldAlt,
  FaChartBar,
  FaUsers,
  FaCog,
  FaEye,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Header from "../../components/admin/Header";
import StatsOverview from "../../components/admin/StatsOverview";
import AdminForms from "../../components/admin/AdminForms";
import DataTables from "../../components/admin/DataTables";
import DepositsTracker from "../../components/admin/DepositsTracker";
import LoadingSpinner from "../../components/admin/LoadingSpinner";

const chains = [base];
const getChainName = (chainId) => {
  const chain = chains.find((c) => c.id === chainId);
  return chain ? chain.name : "Unknown Network";
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

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
          `https://lock-nft.onrender.com/lockTimeNFT/adminMetaData?userAddress=${address}`
        );
        const data = await response.json();

        if (data.success) {
          setAdminData(data);
          setError(null);
        } else {
          setError(data.error);
          setAdminData(null); // Ensure adminData is null for non-admin users
          toast.error(data.error);
        }
      } catch (err) {
        const errorMessage = "Failed to fetch admin data";
        setError(errorMessage);
        setAdminData(null); // Clear adminData on error
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

  const refreshData = () => {
    if (isConnected && address) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `https://lock-nft.onrender.com/lockTimeNFT/adminMetaData?userAddress=${address}`
          );
          const data = await response.json();

          if (data.success) {
            setAdminData(data);
            setError(null);
          } else {
            setError(data.error);
            setAdminData(null); // Clear adminData on error
          }
        } catch (err) {
          console.error("Error refreshing data:", err);
          setAdminData(null); // Clear adminData on error
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  };

  // Render Access Denied if wallet is not connected or user is not the contract owner
  if (!isConnected) {
    return (
      <>
        <header className="relative z-20 bg-black/80 backdrop-blur-xl border-b border-gray-700/50">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-all duration-300 group"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Back to Home</span>
              </button>
            </div>
          </div>
        </header>
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md mx-auto">
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaShieldAlt className="text-4xl text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  Access Denied
                </h1>
                <p className="text-gray-400 leading-relaxed">
                  You must be the contract owner to access this admin dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render the dashboard only for admin users (when adminData is available and no error)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Enhanced Header */}
      <div className="bg-black/60 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-10">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-yellow-400 hover:text-yellow-300 transition-all duration-300 group"
            >
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Home</span>
            </button>

            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Dashboard Header */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full mb-6">
              <FaShieldAlt className="text-3xl text-yellow-400" />
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mb-3">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-lg lg:text-xl max-w-2xl mx-auto">
              Comprehensive management interface for your TimeLock NFT Staking
              Contract
            </p>
          </div>

          {/* Enhanced Navigation Tabs */}
          <div className="flex flex-wrap justify-center mb-8 lg:mb-12">
            <div className="bg-gray-900/60 backdrop-blur-xl flex gap-1 rounded-2xl  border border-gray-700/50 shadow-xl">
              {[
                { id: "overview", label: "Overview", icon: FaChartBar },
                { id: "manage", label: "Manage", icon: FaCog },
                { id: "deposits", label: "Deposits", icon: FaUsers },
                { id: "data", label: "Data", icon: FaEye },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1 m-2 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg transform scale-105"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <tab.icon className="text-sm" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : adminData && !error ? (
            <div className="space-y-8 lg:space-y-12">
              {activeTab === "overview" && (
                <StatsOverview adminData={adminData} />
              )}

              {activeTab === "manage" && (
                <AdminForms
                  adminData={adminData}
                  onSuccess={refreshData}
                  chainId={chainId}
                />
              )}

              {activeTab === "deposits" && (
                <DepositsTracker adminData={adminData} />
              )}

              {activeTab === "data" && <DataTables adminData={adminData} />}
            </div>
          ) : (
            <div className="text-center py-12 lg:py-16">
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-gray-700/50 max-w-md mx-auto shadow-2xl">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaShieldAlt className="text-2xl text-red-500" />
                </div>
                <p className="text-gray-400 text-lg mb-6">
                  Failed to load admin data
                </p>
                <button
                  onClick={refreshData}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
