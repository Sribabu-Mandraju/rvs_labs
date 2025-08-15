import { useState, useEffect, useRef } from "react";
import { useAccount, useBalance } from "wagmi";
import { useDeposit } from "../interactions/StableZUser_interactoins";
import { baseSepolia } from "wagmi/chains";
import toast from "react-hot-toast";
import axios from "axios";

function Deposit() {
  const { address, isConnected, chain } = useAccount();
  const [amount, setAmount] = useState("");
  const [periodMonths, setPeriodMonths] = useState("1");
  const [selectedToken, setSelectedToken] = useState("");
  const [publicMetaData, setPublicMetaData] = useState(null);
  const {
    approveToken,
    deposit,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    approveError,
    isDepositPending,
    isDepositConfirming,
    isDepositConfirmed,
    depositError,
    allowance,
    tokenBalance,
    allowanceError,
    tokenBalanceError,
  } = useDeposit(selectedToken);

  // Check ETH balance for gas (0.001 ETH threshold)
  const { data: balanceData } = useBalance({ address });
  const hasEnoughGas = balanceData && balanceData.value >= 0.001 * 10 ** 18;

  // Validate inputs
  const isCorrectNetwork = chain && chain.id === baseSepolia.id;
  const isValidAmount = amount !== "" && Number(amount) > 0 && Number.isFinite(Number(amount));
  const isValidPeriod = ["1", "2", "3"].includes(periodMonths);
  const isValidToken = selectedToken !== "" && publicMetaData?.allowedTokens?.includes(selectedToken);
  const depositAmount = isValidAmount ? BigInt(Math.floor(Number(amount) * 10 ** 6)) : BigInt(0); // Assuming 6 decimals
  const hasEnoughBalance = tokenBalance >= depositAmount;
  const hasEnoughAllowance = allowance >= depositAmount;

  // Fetch publicMetaData
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/lockTimeNFT/publicMetaData");
        if (response.data.success) {
          setPublicMetaData(response.data);
          if (response.data.allowedTokens?.length > 0) {
            setSelectedToken(response.data.allowedTokens[0]);
          }
        } else {
          toast.error("Failed to fetch public metadata.", { id: "metadata-error" });
        }
      } catch (error) {
        console.error("Error fetching publicMetaData:", error);
        toast.error("Error fetching public metadata.", { id: "metadata-error" });
      }
    };
    fetchMetaData();
  }, []);

  // Ref to track toast ID
  const toastIdRef = useRef(null);
  // Ref to store deposit parameters for auto-trigger
  const depositParamsRef = useRef(null);

  // Auto-trigger deposit after approval confirmation
  useEffect(() => {
    if (isApproveConfirmed && depositParamsRef.current) {
      const { token, amount, periodMonths } = depositParamsRef.current;
      console.log("Approval confirmed, auto-triggering deposit...", { token, amount, periodMonths });
      deposit(token, amount, periodMonths).catch((err) => {
        console.error("Auto-deposit error:", err);
      });
      depositParamsRef.current = null;
    }
  }, [isApproveConfirmed, deposit]);

  // Handle deposit (with approval if needed)
  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet.", { id: "connect-wallet" });
      return;
    }
    if (!isCorrectNetwork) {
      toast.error("Please switch to Base Sepolia network.", { id: "network-error" });
      return;
    }
    if (!hasEnoughGas) {
      toast.error("Insufficient ETH for gas fees (minimum 0.001 ETH).", { id: "gas-error" });
      return;
    }
    if (!isValidToken) {
      toast.error("Please select a valid token.", { id: "token-error" });
      return;
    }
    if (!isValidAmount) {
      toast.error("Please enter a valid deposit amount.", { id: "amount-error" });
      return;
    }
    if (!isValidPeriod) {
      toast.error("Please select a valid lock period (1, 2, or 3 months).", { id: "period-error" });
      return;
    }
    if (!hasEnoughBalance) {
      toast.error(`Insufficient token balance (need ${Number(depositAmount) / 10 ** 6} tokens).`, { id: "balance-error" });
      return;
    }
    if (allowanceError) {
      toast.error(`Error checking allowance: ${allowanceError.message.slice(0, 100)}...`, { id: "allowance-error" });
      return;
    }
    if (tokenBalanceError) {
      toast.error(`Error checking token balance: ${tokenBalanceError.message.slice(0, 100)}...`, { id: "balance-error" });
      return;
    }

    try {
      if (!hasEnoughAllowance) {
        console.log("Calling approveToken with amount:", depositAmount.toString());
        depositParamsRef.current = { token: selectedToken, amount: depositAmount, periodMonths: Number(periodMonths) };
        await approveToken(depositAmount);
      } else {
        console.log("Calling deposit with token, amount, periodMonths:", {
          token: selectedToken,
          amount: depositAmount.toString(),
          periodMonths,
        });
        await deposit(selectedToken, depositAmount, Number(periodMonths));
      }
    } catch (err) {
      console.error("Transaction error:", err);
    }
  };

  // Toast notifications for transaction states
  useEffect(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }

    if (isApprovePending) {
      toastIdRef.current = toast.loading("Approving token...");
    } else if (isDepositPending) {
      toastIdRef.current = toast.loading("Depositing token...");
    } else if (isApproveConfirming) {
      toastIdRef.current = toast.loading("Confirming token approval...");
    } else if (isDepositConfirming) {
      toastIdRef.current = toast.loading("Confirming deposit...");
    } else if (isApproveConfirmed && depositParamsRef.current) {
      toastIdRef.current = toast.loading("Approval confirmed, initiating deposit...");
    } else if (isDepositConfirmed) {
      toastIdRef.current = toast.success("Token deposited successfully!");
    } else if (approveError) {
      const isCancelled = approveError.code === 4001 || /rejected|denied|cancelled/i.test(approveError.message);
      toastIdRef.current = toast.error(
        isCancelled ? "Approval transaction cancelled" : `Approval error: ${approveError.message.slice(0, 100)}...`
      );
    } else if (depositError) {
      const isCancelled = depositError.code === 4001 || /rejected|denied|cancelled/i.test(depositError.message);
      toastIdRef.current = toast.error(
        isCancelled ? "Deposit transaction cancelled" : `Deposit error: ${depositError.message.slice(0, 100)}...`
      );
    }

    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [
    isApprovePending,
    isDepositPending,
    isApproveConfirming,
    isDepositConfirming,
    isApproveConfirmed,
    isDepositConfirmed,
    approveError,
    depositError,
  ]);

  // Debug button disabled reasons
  useEffect(() => {
    console.log("Button disabled reasons:", {
      isApprovePending,
      isApproveConfirming,
      isDepositPending,
      isDepositConfirming,
      hasEnoughBalance,
      hasEnoughGas,
      isConnected,
      isCorrectNetwork,
      isValidAmount,
      isValidPeriod,
      isValidToken,
      allowanceError: allowanceError?.message,
      tokenBalanceError: tokenBalanceError?.message,
      selectedToken,
    });
  }, [
    isApprovePending,
    isApproveConfirming,
    isDepositPending,
    isDepositConfirming,
    hasEnoughBalance,
    hasEnoughGas,
    isConnected,
    isCorrectNetwork,
    isValidAmount,
    isValidPeriod,
    isValidToken,
    allowanceError,
    tokenBalanceError,
    selectedToken,
  ]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg bg-gray-800 rounded-xl shadow-2xl p-6 space-y-6">
        <h3 className="text-2xl font-bold text-center text-yellow-400">Deposit Tokens for Staking</h3>

        {/* Metadata Display */}
        {publicMetaData ? (
          <div className="bg-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-lg font-semibold text-gray-200">Staking Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-400">Allowed Tokens</p>
                <p className="text-sm text-gray-200">
                  {publicMetaData.allowedTokens.map((token) => (
                    <span key={token} className="block">
                      {token === "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
                        ? "USDT"
                        : `${token.slice(0, 6)}...${token.slice(-4)}`}
                    </span>
                  ))}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Total Deposited</p>
                <p className="text-sm text-gray-200">
                  {publicMetaData.depositedBalances.map((bal) => (
                    <span key={bal.token} className="block">
                      {(Number(bal.balance) / 10 ** 6).toFixed(2)}{" "}
                      {bal.token === "0x036CbD53842c5426634e7929541eC2318f3dCF7e" ? "USDT" : "tokens"}
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">ROI Rates</p>
              <div className="flex justify-between text-sm text-gray-200">
                <span>1 Month: {(Number(publicMetaData.roi1m) / 100).toFixed(2)}%</span>
                <span>2 Months: {(Number(publicMetaData.roi2m) / 100).toFixed(2)}%</span>
                <span>3 Months: {(Number(publicMetaData.roi3m) / 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-4">
            <svg
              className="animate-spin h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="ml-2 text-sm text-yellow-300">Loading metadata...</span>
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Token</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 transition duration-200"
            >
              <option value="">Select a token</option>
              {publicMetaData?.allowedTokens?.map((token) => (
                <option key={token} value={token}>
                  {token === "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
                    ? "USDT"
                    : `${token.slice(0, 6)}...${token.slice(-4)}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Deposit Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 transition duration-200"
                placeholder="Enter amount"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                {selectedToken === "0x036CbD53842c5426634e7929541eC2318f3dCF7e" ? "USDT" : "Tokens"}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Lock Period</label>
            <select
              value={periodMonths}
              onChange={(e) => setPeriodMonths(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 transition duration-200"
            >
              <option value="1">1 Month</option>
              <option value="2">2 Months</option>
              <option value="3">3 Months</option>
            </select>
          </div>
          <div className="text-sm text-gray-400">
            Your Balance: {tokenBalance > 0 ? (Number(tokenBalance) / 10 ** 6).toFixed(2) : "N/A"}{" "}
            {selectedToken === "0x036CbD53842c5426634e7929541eC2318f3dCF7e" ? "USDT" : "tokens"}
          </div>
        </div>

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={
            isApprovePending ||
            isApproveConfirming ||
            isDepositPending ||
            isDepositConfirming ||
            !hasEnoughBalance ||
            !hasEnoughGas ||
            !isConnected ||
            !isCorrectNetwork ||
            !isValidAmount ||
            !isValidPeriod ||
            !isValidToken ||
            allowanceError ||
            tokenBalanceError
          }
          className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-300 ${
            isApprovePending ||
            isApproveConfirming ||
            isDepositPending ||
            isDepositConfirming ||
            !hasEnoughBalance ||
            !hasEnoughGas ||
            !isConnected ||
            !isCorrectNetwork ||
            !isValidAmount ||
            !isValidPeriod ||
            !isValidToken ||
            allowanceError ||
            tokenBalanceError
              ? "bg-gray-600 cursor-not-allowed opacity-50"
              : "bg-yellow-500 hover:bg-yellow-600 shadow-lg hover:shadow-xl"
          }`}
        >
          {isApprovePending || isApproveConfirming
            ? "Processing Approval..."
            : isDepositPending || isDepositConfirming
            ? "Processing Deposit..."
            : "Deposit"}
        </button>
      </div>
    </div>
  );
}

export default Deposit;