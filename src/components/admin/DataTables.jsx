import React, { useState } from 'react';
import { FaExternalLinkAlt, FaSearch, FaFilter, FaCoins } from 'react-icons/fa';
import { ethers } from 'ethers';

const DataTable = ({ title, children, icon: Icon }) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center">
          {Icon && <Icon className="text-yellow-400 mr-3 text-xl" />}
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const filteredDeposits = adminData.deposits.filter(deposit => {
    const matchesSearch = deposit.tokenId.toString().includes(searchTerm) ||
                         deposit.tokenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.originalMinter.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPeriod = filterPeriod === 'all' || deposit.periodMonths.toString() === filterPeriod;
    
    return matchesSearch && matchesPeriod;
  });

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Contract Data</h2>
        <p className="text-gray-400">View all tokens, balances, and deposits</p>
      </div>

      {/* Allowed Tokens */}
      <DataTable title="Allowed Tokens" icon={FaFilter}>
        {adminData.allowedTokens.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Token Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {adminData.allowedTokens.map((token, index) => (
                <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-mono text-sm">{token}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ExternalLink href={`https://sepolia.basescan.org/address/${token}`}>
                      View on Explorer
                    </ExternalLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-400">
            No allowed tokens configured
          </div>
        )}
      </DataTable>

      {/* Deposited Balances */}
      <DataTable title="Deposited Balances" icon={FaCoins}>
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
                  Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {adminData.depositedBalances.map((balance, index) => (
                <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-mono text-sm">
                      {balance.token.slice(0, 8)}...{balance.token.slice(-6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">{balance.tokenName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-yellow-400 font-bold">
                      {parseFloat(ethers.formatUnits(balance.balance, 6)).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ExternalLink href={`https://sepolia.basescan.org/address/${balance.token}`}>
                      View Token
                    </ExternalLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-400">
            No deposited balances found
          </div>
        )}
      </DataTable>

      {/* Deposits with Search and Filter */}
      {/* <DataTable title="All Deposits" icon={FaSearch}>
        <div className="p-6 border-b border-gray-700 bg-gray-800/30">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by Token ID, Token Name, or Minter Address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All Periods</option>
              <option value="1">1 Month</option>
              <option value="2">2 Months</option>
              <option value="3">3 Months</option>
            </select>
          </div>
        </div>
        
        {filteredDeposits.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Token ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Unlock Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Minter
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDeposits.map((deposit) => (
                <tr key={deposit.tokenId} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-yellow-400 font-bold">#{deposit.tokenId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">{deposit.tokenName}</div>
                    <ExternalLink 
                      href={`https://sepolia.basescan.org/address/${deposit.depositToken}`}
                      className="text-xs"
                    >
                      {deposit.depositToken.slice(0, 6)}...{deposit.depositToken.slice(-4)}
                    </ExternalLink>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {parseFloat(ethers.formatUnits(deposit.amount, 6)).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                      {deposit.periodMonths}M
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                    {new Date(Number(deposit.startTimestamp) * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                    {new Date(Number(deposit.unlockTimestamp) * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ExternalLink 
                      href={`https://sepolia.basescan.org/address/${deposit.originalMinter}`}
                      className="text-sm"
                    >
                      {deposit.originalMinter.slice(0, 6)}...{deposit.originalMinter.slice(-4)}
                    </ExternalLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-400">
            {searchTerm || filterPeriod !== 'all' ? 'No deposits match your search criteria' : 'No deposits found'}
          </div>
        )}
      </DataTable> */}
    </div>
  );
};

export default DataTables;
