import React, { useState } from "react";
import {
  FaPlus,
  FaPercentage,
  FaCoins,
  FaDownload,
  FaEdit,
  FaCog,
} from "react-icons/fa";
import AddTokenForm from "./forms/AddTokenForm";
import SetROIForm from "./forms/SetROIForm";
import DepositFundsForm from "./forms/DepositFundsForm";
import CollectFundsForm from "./forms/CollectFundsForm";
import UpdateMaxCapForm from "./forms/UpdateMaxCapForm";

const FormCard = ({
  icon: Icon,
  title,
  description,
  children,
  color = "yellow",
}) => {
  const colorClasses = {
    yellow:
      "border-yellow-500/30 hover:border-yellow-500/50 from-yellow-500/10 to-yellow-600/10",
    blue:
      "border-blue-500/30 hover:border-blue-500/50 from-blue-500/10 to-blue-600/10",
    green:
      "border-green-500/30 hover:border-green-500/50 from-green-500/10 to-green-600/10",
    red:
      "border-red-500/30 hover:border-red-500/50 from-red-500/10 to-red-600/10",
    purple:
      "border-purple-500/30 hover:border-purple-500/50 from-purple-500/10 to-purple-600/10",
  };

  const iconColors = {
    yellow: "text-yellow-400",
    blue: "text-blue-400",
    green: "text-green-400",
    red: "text-red-400",
    purple: "text-purple-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-6 lg:p-8 border transition-all duration-500 hover:shadow-2xl transform hover:scale-[1.02]`}
    >
      <div className="flex items-start space-x-4 mb-6">
        <div
          className={`p-3 lg:p-4 rounded-xl bg-gray-800/50 ${iconColors[color]} shadow-lg flex-shrink-0`}
        >
          <Icon className="text-xl lg:text-2xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

const AdminForms = ({ adminData, onSuccess, chainId }) => {
  return (
    <div className="space-y-8 lg:space-y-12">
      {/* Header */}
      <div className="text-center mb-8 lg:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4">
          <FaCog className="text-2xl text-yellow-400" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          Contract Management
        </h2>
        <p className="text-gray-400 text-lg lg:text-xl max-w-3xl mx-auto">
          Comprehensive tools to manage your TimeLock NFT Staking Contract. Add
          tokens, set rates, manage funds, and monitor performance.
        </p>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <FormCard
          icon={FaPlus}
          title="Add Allowed Token"
          description="Add new ERC20 tokens to the staking platform. Set maximum capacity and configure token parameters."
          color="yellow"
        >
          <AddTokenForm onSuccess={onSuccess} chainId={chainId} />
        </FormCard>

        <FormCard
          icon={FaPercentage}
          title="Set ROI Rates"
          description="Configure return rates for different staking periods. Update rates to attract and retain stakers."
          color="blue"
        >
          <SetROIForm onSuccess={onSuccess} />
        </FormCard>

        <FormCard
          icon={FaCoins}
          title="Deposit Funds"
          description="Add funds to cover staking rewards and ensure sufficient liquidity for user withdrawals."
          color="green"
        >
          <DepositFundsForm
            onSuccess={onSuccess}
            allowedTokens={adminData.allowedTokensWithNames}
            chainId={chainId}
          />
        </FormCard>

        <FormCard
          icon={FaDownload}
          title="Collect Funds"
          description="Emergency withdrawal function to collect tokens and ETH from the contract. Use with caution."
          color="red"
        >
          <CollectFundsForm
            onSuccess={onSuccess}
            allowedTokens={adminData.allowedTokensWithNames}
            chainId={chainId}
          />
        </FormCard>

        <FormCard
          icon={FaEdit}
          title="Update Max Cap"
          description="Modify maximum capacity for existing tokens. Adjust limits based on market conditions and demand."
          color="purple"
        >
          <UpdateMaxCapForm
            onSuccess={onSuccess}
            allowedTokens={adminData.allowedTokensWithNames}
            chainId={chainId}
          />
        </FormCard>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-gray-700/50 shadow-2xl">
        <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 flex items-center">
          <FaCog className="mr-3 text-yellow-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors cursor-pointer group">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                <FaPlus className="text-yellow-400 text-sm" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Add Token</h4>
                <p className="text-gray-400 text-xs">Quick token addition</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors cursor-pointer group">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <FaPercentage className="text-blue-400 text-sm" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Update ROI</h4>
                <p className="text-gray-400 text-xs">Adjust rates</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors cursor-pointer group">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                <FaCoins className="text-green-400 text-sm" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Add Funds</h4>
                <p className="text-gray-400 text-xs">Increase liquidity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForms;
