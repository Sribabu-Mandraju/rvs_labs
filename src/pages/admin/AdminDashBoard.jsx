import React, { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { toast } from "react-toastify";
import { FaArrowLeft, FaShieldAlt, FaNetworkWired } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Header from "../../components/admin/Header";
import StatsOverview from "../../components/admin/StatsOverview";
import AdminForms from "../../components/admin/AdminForms";
import DataTables from "../../components/admin/DataTables";
import LoadingSpinner from "../../components/admin/LoadingSpinner";

const chains = [base, baseSepolia];
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
          }
        } catch (err) {
          console.error("Error refreshing data:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  };

  if (!isConnected || error === "Access restricted to contract owner") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <Header
          onBack={() => navigate("/")}
          chainName={getChainName(chainId)}
          showBackButton={true}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <FaShieldAlt className="text-6xl text-red-500 mx-auto mb-6" />
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </button>
      </div>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Dashboard Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your TimeLock NFT Staking Contract
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-gray-700">
              {[
                { id: "overview", label: "Overview" },
                { id: "manage", label: "Manage" },
                { id: "data", label: "Data" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-yellow-500 text-black shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : adminData ? (
            <div className="space-y-8">
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

              {activeTab === "data" && <DataTables adminData={adminData} />}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 max-w-md mx-auto">
                <p className="text-gray-400 text-lg">
                  Failed to load admin data
                </p>
                <button
                  onClick={refreshData}
                  className="mt-4 px-6 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
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
