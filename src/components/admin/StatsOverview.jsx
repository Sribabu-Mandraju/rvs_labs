import {
  FaCoins,
  FaUsers,
  FaLock,
  FaChartLine,
  FaCube,
  FaWallet,
  FaShieldAlt,
  FaNetworkWired,
} from "react-icons/fa";
import { ethers } from "ethers";

const StatsCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = "yellow",
  trend,
  trendValue,
}) => {
  const colorClasses = {
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
    red: "from-red-500/20 to-red-600/20 border-red-500/30",
    indigo: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30",
  };

  const iconColors = {
    yellow: "text-yellow-400",
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
    red: "text-red-400",
    indigo: "text-indigo-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-4 lg:p-6 border hover:shadow-2xl transition-all duration-500 transform hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 lg:p-4 rounded-xl bg-gray-800/50 ${iconColors[color]} shadow-lg`}
        >
          <Icon className="text-lg lg:text-xl" />
        </div>
        {trend && (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
              trend === "up"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            <FaCube
              className={`text-xs ${trend === "down" ? "rotate-180" : ""}`}
            />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
          {value}
        </h3>
        <p className="text-gray-300 text-sm lg:text-base font-medium">
          {title}
        </p>
        {subtitle && (
          <p className="text-gray-400 text-xs lg:text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

const StatsOverview = ({ adminData }) => {
  // Calculate total balance with proper decimal handling
  const totalBalance = adminData.depositedBalances.reduce(
    (sum, balance, index) => {
      try {
        // Get the corresponding token info to get the correct decimals
        const tokenInfo = adminData.allowedTokensWithNames[index];
        const decimals = tokenInfo?.decimals
          ? parseInt(tokenInfo.decimals)
          : 18; // Default to 18 if not specified

        const balanceValue = Number.parseFloat(
          ethers.formatUnits(balance.balance, decimals)
        );
        return sum + balanceValue;
      } catch (error) {
        console.warn(
          "Error formatting balance for token:",
          balance.token,
          error
        );
        return sum; // Return current sum if there's an error
      }
    },
    0
  );

  // Calculate total max cap with proper decimal handling
  const totalMaxCap = adminData.allowedTokensWithNames.reduce((sum, token) => {
    try {
      const decimals = token?.decimals ? parseInt(token.decimals) : 18;
      const maxCapValue = Number.parseFloat(
        ethers.formatUnits(token.maxCap, decimals)
      );
      return sum + maxCapValue;
    } catch (error) {
      console.warn(
        "Error formatting max cap for token:",
        token?.address,
        error
      );
      return sum;
    }
  }, 0);

  const utilizationRate =
    totalMaxCap > 0 ? (totalBalance / totalMaxCap) * 100 : 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          icon={FaCoins}
          title="Total NFTs Minted"
          value={adminData.totalNFTsMinted}
          subtitle="Active staking positions"
          color="yellow"
          trend="up"
          trendValue="+12%"
        />
        <StatsCard
          icon={FaLock}
          title="Allowed Tokens"
          value={adminData.allowedTokensWithNames.length}
          subtitle="Supported assets"
          color="blue"
        />
        <StatsCard
          icon={FaWallet}
          title="Total Balance"
          value={`$${totalBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Current deposited value"
          color="green"
        />
        <StatsCard
          icon={FaChartLine}
          title="Utilization Rate"
          value={`${utilizationRate.toFixed(1)}%`}
          subtitle="Capacity usage"
          color="purple"
        />
      </div>

      {/* Enhanced Contract Information */}
      {/* <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-gray-700/50 shadow-2xl">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-6 flex items-center">
          <FaShieldAlt className="mr-3 text-yellow-400 text-xl lg:text-2xl" />
          Contract Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors">
            <p className="text-gray-400 text-sm font-medium mb-2">
              Contract Owner
            </p>
            <p className="text-white font-mono text-sm lg:text-base truncate bg-gray-700/50 p-2 rounded-lg">
              {adminData.owner}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors">
            <p className="text-gray-400 text-sm font-medium mb-2">
              Total Positions
            </p>
            <p className="text-white text-lg lg:text-2xl font-bold">
              {adminData.totalNFTsMinted}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors">
            <p className="text-gray-400 text-sm font-medium mb-2">Network</p>
            <div className="flex items-center space-x-2">
              <FaNetworkWired className="text-blue-400" />
              <span className="text-white font-medium">Base Sepolia</span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Allowed Tokens Overview */}
      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-gray-700/50 shadow-2xl">
        <h3 className="text-lg lg:text-xl font-bold text-white mb-6 flex items-center">
          <FaCoins className="mr-2 text-yellow-400" />
          Allowed Tokens
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {adminData.allowedTokensWithNames.map((token, index) => {
            try {
              const decimals = token?.decimals ? parseInt(token.decimals) : 18;
              const maxCapValue = Number.parseFloat(
                ethers.formatUnits(token.maxCap, decimals)
              );

              // Find corresponding deposited balance
              const depositedBalance = adminData.depositedBalances.find(
                (bal) => bal.token === token.address
              );
              const balanceValue = depositedBalance
                ? Number.parseFloat(
                    ethers.formatUnits(depositedBalance.balance, decimals)
                  )
                : 0;

              const utilizationPercentage =
                maxCapValue > 0 ? (balanceValue / maxCapValue) * 100 : 0;

              return (
                <div
                  key={token.address}
                  className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:shadow-lg"
                >
                  {/* Token Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                        <FaCoins className="text-yellow-400 text-sm" />
                      </div>
                      <span className="text-white font-semibold text-sm lg:text-base">
                        {token.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
                      {decimals} decimals
                    </span>
                  </div>

                  {/* Token Address */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">
                      Contract Address
                    </p>
                    <p className="text-xs font-mono text-gray-300 bg-gray-700/50 p-2 rounded-lg break-all">
                      {token.address}
                    </p>
                  </div>

                  {/* Market Cap */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">
                      Maximum Market Cap
                    </p>
                    <p className="text-lg font-bold text-green-400">
                      $
                      {maxCapValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Current Balance & Utilization */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-400">Current Balance</p>
                      <p className="text-xs text-gray-400">
                        {utilizationPercentage.toFixed(1)}% utilized
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white mb-2">
                      $
                      {balanceValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(utilizationPercentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Raw Values Info */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Raw Max Cap: {token.maxCap}</p>
                    <p>Raw Balance: {depositedBalance?.balance || "0"}</p>
                    <p>Scaling Factor: 10^{decimals}</p>
                  </div>
                </div>
              );
            } catch (error) {
              console.warn(
                "Error rendering token card for:",
                token?.name,
                error
              );
              return (
                <div
                  key={token?.address || index}
                  className="bg-gray-800/50 rounded-xl p-4 border border-red-500/30"
                >
                  <div className="text-red-400 text-sm">
                    Error loading {token?.name || "token"} data
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Token Distribution Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-gray-700/50 shadow-2xl">
          <h3 className="text-lg lg:text-xl font-bold text-white mb-4 flex items-center">
            <FaCoins className="mr-2 text-yellow-400" />
            Token Distribution
          </h3>
          <div className="space-y-3">
            {adminData.depositedBalances.length > 0 ? (
              adminData.depositedBalances.map((balance, index) => {
                try {
                  const tokenInfo = adminData.allowedTokensWithNames[index];
                  const decimals = tokenInfo?.decimals
                    ? parseInt(tokenInfo.decimals)
                    : 18;
                  const balanceValue = Number.parseFloat(
                    ethers.formatUnits(balance.balance, decimals)
                  );
                  const maxCapValue = tokenInfo
                    ? Number.parseFloat(
                        ethers.formatUnits(tokenInfo.maxCap, decimals)
                      )
                    : 0;
                  const percentage =
                    maxCapValue > 0 ? (balanceValue / maxCapValue) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm lg:text-base">
                          {tokenInfo?.name || "Unknown Token"}
                        </span>
                        <span className="text-yellow-400 font-bold text-sm lg:text-base">
                          $
                          {balanceValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{percentage.toFixed(1)}% utilized</span>
                        <span>Max: ${maxCapValue.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.warn(
                    "Error rendering token distribution for index:",
                    index,
                    error
                  );
                  return (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50"
                    >
                      <div className="text-red-400 text-sm">
                        Error loading token data
                      </div>
                    </div>
                  );
                }
              })
            ) : (
              <div className="text-center py-8">
                <FaCoins className="text-4xl text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No tokens deposited yet</p>
              </div>
            )}
          </div>
        </div> */}

        {/* <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-gray-700/50 shadow-2xl">
          <h3 className="text-lg lg:text-xl font-bold text-white mb-4 flex items-center">
            <FaCube className="mr-2 text-green-400" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Capacity</span>
                <span className="text-white font-bold">
                  ${totalMaxCap.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Maximum staking capacity across all tokens
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">
                  Average Position Size
                </span>
                <span className="text-white font-bold">
                  $
                  {adminData.totalNFTsMinted > 0
                    ? (totalBalance / adminData.totalNFTsMinted).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )
                    : "0.00"}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Mean value per staking position
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Active Tokens</span>
                <span className="text-white font-bold">
                  {
                    adminData.depositedBalances.filter((b) => {
                      try {
                        const index = adminData.depositedBalances.indexOf(b);
                        const tokenInfo =
                          adminData.allowedTokensWithNames[index];
                        const decimals = tokenInfo?.decimals
                          ? parseInt(tokenInfo.decimals)
                          : 18;
                        const balanceValue = Number.parseFloat(
                          ethers.formatUnits(b.balance, decimals)
                        );
                        return balanceValue > 0;
                      } catch (error) {
                        return false;
                      }
                    }).length
                  }
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Tokens with active deposits
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default StatsOverview;
