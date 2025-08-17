import { FaCoins, FaUsers, FaLock, FaChartLine } from 'react-icons/fa';
import { ethers } from 'ethers';

const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'yellow' }) => {
  const colorClasses = {
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  };

  const iconColors = {
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm rounded-lg p-3 border hover:shadow-lg transition-shadow duration-300`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-md bg-gray-800/50 ${iconColors[color]}`}>
          <Icon className="text-base" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">{value}</h3>
        <p className="text-gray-300 text-sm font-medium">{title}</p>
        {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
      </div>
    </div>
  );
};

const StatsOverview = ({ adminData }) => {
  const totalBalance = adminData.depositedBalances.reduce((sum, balance) => {
    return sum + Number.parseFloat(ethers.formatUnits(balance.balance, 6));
  }, 0);

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={FaCoins}
          title="NFTs Minted"
          value={adminData.totalNFTsMinted}
          subtitle="Active positions"
          color="yellow"
        />
        <StatsCard
          icon={FaLock}
          title="Allowed Tokens"
          value={adminData.allowedTokensWithNames.length}
          subtitle="Supported assets"
          color="blue"
        />
        {/* <StatsCard
          icon={FaChartLine}
          title="Total Deposits"
          value={adminData.deposits.length}
          subtitle="All time"
          color="green"
        /> */}
        <StatsCard
          icon={FaUsers}
          title="Total Balance"
          value={`$${totalBalance.toFixed(2)}`}
          subtitle="USD value"
          color="purple"
        />
      </div>

      {/* Contract Information */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:shadow-lg transition-shadow duration-300">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center">
          <FaLock className="mr-2 text-yellow-400 text-base" />
          Contract Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-800/50 rounded-md p-3">
            <p className="text-gray-400 text-xs font-medium mb-1">Contract Owner</p>
            <p className="text-white font-mono text-xs truncate">{adminData.owner}</p>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3">
            <p className="text-gray-400 text-xs font-medium mb-1">Total Positions</p>
            <p className="text-white text-lg font-bold">{adminData.totalNFTsMinted}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-base font-bold text-white mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {adminData.deposits.length > 0 ? (
              adminData.deposits
                .slice(-3)
                .reverse()
                .map((deposit) => (
                  <div
                    key={deposit.tokenId}
                    className="flex items-center justify-between p-2 bg-gray-800/50 rounded-md hover:bg-gray-700/50 transition-colors"
                  >
                    <div>
                      <p className="text-white text-xs font-medium">Token #{deposit.tokenId}</p>
                      <p className="text-gray-400 text-xs">{deposit.tokenName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 text-xs font-medium">
                        {Number.parseFloat(ethers.formatUnits(deposit.amount, 6)).toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-xs">{deposit.periodMonths}M lock</p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-400 text-xs">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-base font-bold text-white mb-3">Token Distribution</h3>
          <div className="space-y-2">
            {adminData.depositedBalances.length > 0 ? (
              adminData.depositedBalances.map((balance, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-800/50 rounded-md hover:bg-gray-700/50 transition-colors"
                >
                  <div>
                    <p className="text-white text-xs font-medium">{balance.tokenName}</p>
                    <p className="text-gray-400 text-xs font-mono">
                      {balance.token.slice(0, 6)}...{balance.token.slice(-4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 text-xs font-bold">
                      {Number.parseFloat(ethers.formatUnits(balance.balance, 6)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-xs">No deposited balances</p>
            )}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default StatsOverview; 