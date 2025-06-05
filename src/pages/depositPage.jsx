import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useWallet } from "../context/WalletContext";
import { FaSpinner, FaLock, FaUnlock, FaArrowLeft } from "react-icons/fa";
import TimeLockNFTStakingABI from "../abis/stablz.json";
import IERC20ABI from "../abis/ierc20.json";
import { useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = import.meta.env.VITE_STABLEZ_CONTRACT;
const USDT_ADDRESS = import.meta.env.VITE_USDC;

const DepositPage = () => {
  const navigate = useNavigate();
  const { account, signer } = useWallet();
  const [amount, setAmount] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState({
    status: "",
    message: "",
    hash: "",
  });
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");

  useEffect(() => {
    const fetchBalanceAndAllowance = async () => {
      if (!account || !signer) return;
      try {
        const usdtContract = new ethers.Contract(
          USDT_ADDRESS,
          IERC20ABI,
          signer
        );
        const [balance, currentAllowance] = await Promise.all([
          usdtContract.balanceOf(account),
          usdtContract.allowance(account, CONTRACT_ADDRESS),
        ]);
        setUsdcBalance(ethers.formatUnits(balance, 6));
        setAllowance(ethers.formatUnits(currentAllowance, 6));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };
    fetchBalanceAndAllowance();
  }, [account, signer]);

  const handleDeposit = async () => {
    if (!account || !signer) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      setIsSubmitting(true);
      const amountInWei = ethers.parseUnits(amount, 6);
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TimeLockNFTStakingABI,
        signer
      );
      const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20ABI, signer);

      const balance = await usdtContract.balanceOf(account);
      if (balance < amountInWei) {
        toast.error("Insufficient USDC balance.");
        return;
      }

      const currentAllowance = await usdtContract.allowance(
        account,
        CONTRACT_ADDRESS
      );
      if (currentAllowance < amountInWei) {
        setTxStatus({
          status: "pending",
          message: "Approving USDC spending...",
          hash: "",
        });
        try {
          // First reset the allowance to 0
          await usdtContract.approve(CONTRACT_ADDRESS, 0);

          // Then approve the exact amount needed
          const approveTx = await usdtContract.approve(
            CONTRACT_ADDRESS,
            amountInWei
          );
          setTxStatus({
            status: "confirming",
            message: "Approval transaction submitted!",
            hash: approveTx.hash,
          });
          await approveTx.wait();
          toast.success("Approval successful! Proceeding with deposit...");
        } catch (err) {
          throw new Error("Approval failed: " + err.message);
        }
      }

      setTxStatus({
        status: "pending",
        message: "Preparing deposit transaction...",
        hash: "",
      });
      const depositTx = await stakingContract.deposit(
        amountInWei,
        selectedPeriod
      );
      setTxStatus({
        status: "confirming",
        message: "Deposit transaction submitted!",
        hash: depositTx.hash,
      });
      await depositTx.wait();

      setTxStatus({
        status: "success",
        message: "Deposit successful!",
        hash: depositTx.hash,
      });
      toast.success("Deposit successful!");
      setAmount("");

      // Refresh balance and allowance after successful deposit
      const [newBalance, newAllowance] = await Promise.all([
        usdtContract.balanceOf(account),
        usdtContract.allowance(account, CONTRACT_ADDRESS),
      ]);
      setUsdcBalance(ethers.formatUnits(newBalance, 6));
      setAllowance(ethers.formatUnits(newAllowance, 6));
    } catch (err) {
      console.error("Error in deposit process:", err);
      const errorMessage =
        err.code === 4001
          ? "Transaction rejected by user"
          : err.code === -32603
          ? "Transaction failed: Insufficient gas or invalid parameters"
          : err.message.includes("user rejected")
          ? "Transaction rejected by user"
          : err.message.includes("insufficient funds")
          ? "Insufficient funds for gas"
          : "Failed to complete deposit process";

      setTxStatus({
        status: "error",
        message: errorMessage,
        hash: err.transaction?.hash || "",
      });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">
              Stake Your USDC
            </h1>
            <p className="text-gray-400">
              Lock your USDC and earn rewards over time
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Deposit Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Amount to Deposit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter USDC amount"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      disabled={isSubmitting}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      USDC
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Available Balance: {usdcBalance} USDC
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Lock Period
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    disabled={isSubmitting}
                  >
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                  </select>
                </div>

                <button
                  onClick={handleDeposit}
                  disabled={isSubmitting || !amount}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isSubmitting || !amount
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      {txStatus.message.includes("Approval")
                        ? "Approving..."
                        : "Processing..."}
                    </div>
                  ) : (
                    "Deposit"
                  )}
                </button>
              </div>

              {/* Right Column - Info & Status */}
              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                    Deposit Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Current Allowance</span>
                      <span className="text-white">{allowance} USDC</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Selected Period</span>
                      <span className="text-white">
                        {selectedPeriod} Months
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">ROI Rate</span>
                      <span className="text-white">
                        {selectedPeriod === 1
                          ? "10%"
                          : selectedPeriod === 2
                          ? "20%"
                          : "30%"}
                      </span>
                    </div>
                  </div>
                </div>

                {txStatus.status && (
                  <div
                    className={`p-4 rounded-lg ${
                      txStatus.status === "error"
                        ? "bg-red-500/10 border border-red-500/20"
                        : txStatus.status === "success"
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-yellow-500/10 border border-yellow-500/20"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {txStatus.status === "pending" ||
                      txStatus.status === "confirming" ? (
                        <FaSpinner className="animate-spin text-yellow-400 mt-1" />
                      ) : txStatus.status === "success" ? (
                        <FaLock className="text-green-400 mt-1" />
                      ) : (
                        <FaUnlock className="text-red-400 mt-1" />
                      )}
                      <div>
                        <p
                          className={`text-sm ${
                            txStatus.status === "error"
                              ? "text-red-400"
                              : txStatus.status === "success"
                              ? "text-green-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {txStatus.message}
                        </p>
                        {txStatus.hash && (
                          <a
                            href={`https://sepolia.basescan.org/tx/${txStatus.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-400 hover:text-yellow-300 text-xs mt-1 block"
                          >
                            View on BaseScan
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositPage;
