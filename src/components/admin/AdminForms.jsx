import React, { useState } from 'react';
import { FaPlus, FaPercentage, FaCoins, FaDownload } from 'react-icons/fa';
import AddTokenForm from './forms/AddTokenForm';
import SetROIForm from './forms/SetROIForm';
import DepositFundsForm from './forms/DepositFundsForm';
import CollectFundsForm from './forms/CollectFundsForm';

const FormCard = ({ icon: Icon, title, description, children, color = 'yellow' }) => {
  const colorClasses = {
    yellow: 'border-yellow-500/30 hover:border-yellow-500/50',
    blue: 'border-blue-500/30 hover:border-blue-500/50',
    green: 'border-green-500/30 hover:border-green-500/50',
    red: 'border-red-500/30 hover:border-red-500/50'
  };

  const iconColors = {
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400'
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border ${colorClasses[color]} transition-all duration-200`}>
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-lg bg-gray-800/50 mr-4 ${iconColors[color]}`}>
          <Icon className="text-xl" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

const AdminForms = ({ adminData, onSuccess, chainId }) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Contract Management</h2>
        <p className="text-gray-400">Manage tokens, ROI rates, and contract funds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormCard
          icon={FaPlus}
          title="Add Allowed Token"
          description="Add new ERC20 tokens for staking"
          color="yellow"
        >
          <AddTokenForm onSuccess={onSuccess} chainId={chainId} />
        </FormCard>

        <FormCard
          icon={FaPercentage}
          title="Set ROI Rates"
          description="Update return rates for different periods"
          color="blue"
        >
          <SetROIForm onSuccess={onSuccess} />
        </FormCard>

        <FormCard
          icon={FaCoins}
          title="Deposit Funds"
          description="Add funds to cover staking rewards"
          color="green"
        >
          <DepositFundsForm 
            onSuccess={onSuccess} 
            allowedTokens={adminData.allowedTokens}
            chainId={chainId}
          />
        </FormCard>

        <FormCard
          icon={FaDownload}
          title="Collect Funds"
          description="Withdraw tokens and ETH from contract"
          color="red"
        >
          <CollectFundsForm 
            onSuccess={onSuccess} 
            allowedTokens={adminData.allowedTokens}
            chainId={chainId}
          />
        </FormCard>
      </div>
    </div>
  );
};

export default AdminForms;
