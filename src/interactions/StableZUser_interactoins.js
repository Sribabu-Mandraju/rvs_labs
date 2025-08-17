import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { useEffect, useRef } from "react";
import USDT_ABI from "../abis/ierc20.json";
import TimeLockNFT_ABI from "../abis/stablz.json";


const TIMELOCK_NFT_ADDRESS = "0x27f3e17C1007Cbd7961042Aaea756A2c12726593"; // Replace with your contract address


export const useDeposit = (selectedToken) => {
  const { writeContract: writeApprove, data: approveHash, error: approveError, isPending: isApprovePending } = useWriteContract();
  const { writeContract: writeDeposit, data: depositHash, error: depositError, isPending: isDepositPending } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed, data: depositReceipt } = useWaitForTransactionReceipt({ hash: depositHash });
  const { address, chain } = useAccount();
  const chainId = chain?.id || baseSepolia.id;

  // Check token allowance for TimeLockNFT
  const {
    data: allowanceData,
    error: allowanceError,
    refetch: refetchAllowance,
  } = useReadContract({
    address: selectedToken,
    abi: USDT_ABI,
    functionName: "allowance",
    args: [address, TIMELOCK_NFT_ADDRESS],
    query: { enabled: !!address && !!selectedToken },
  });

  // Check token balance
  const { data: tokenBalanceData, error: tokenBalanceError } = useReadContract({
    address: selectedToken,
    abi: USDT_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address && !!selectedToken },
  });

  const approveToken = async (amount) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }
    if (chainId !== baseSepolia.id) {
      throw new Error("Please switch to Base Sepolia network");
    }
    if (!selectedToken) {
      throw new Error("No token selected");
    }
    if (!amount || amount <= 0) {
      throw new Error("Invalid deposit amount");
    }
    try {
      console.log("Initiating token approval for TimeLockNFT...", { token: selectedToken, amount });
      await writeApprove({
        address: selectedToken,
        abi: USDT_ABI,
        functionName: "approve",
        args: [TIMELOCK_NFT_ADDRESS, BigInt(amount)],
        chainId,
      });
    } catch (error) {
      console.error("Failed to approve token:", error);
      throw error;
    }
  };

  const deposit = async (token, amount, periodMonths) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }
    if (chainId !== baseSepolia.id) {
      throw new Error("Please switch to Base Sepolia network");
    }
    if (!token) {
      throw new Error("Invalid token address");
    }
    if (!amount || amount <= 0) {
      throw new Error("Invalid deposit amount");
    }
    if (periodMonths !== 1 && periodMonths !== 2 && periodMonths !== 3) {
      throw new Error("Invalid period (must be 1, 2, or 3 months)");
    }

    try {
      console.log("Initiating deposit transaction...", { token, amount, periodMonths });
      await writeDeposit({
        address: TIMELOCK_NFT_ADDRESS,
        abi: TimeLockNFT_ABI,
        functionName: "deposit",
        args: [token, BigInt(amount), periodMonths],
        chainId,
      });
    } catch (error) {
      console.error("Failed to deposit:", error);
      throw error;
    }
  };

  // Refetch allowance after approval confirmation
  useEffect(() => {
    if (isApproveConfirmed) {
      console.log("Approval confirmed, refetching allowance...");
      refetchAllowance();
    }
  }, [isApproveConfirmed, refetchAllowance]);

  // Ref to prevent infinite logging
  const hasLogged = useRef(false);

  // Log transaction states for debugging
  useEffect(() => {
    if (
      !hasLogged.current &&
      (isApprovePending ||
        isApproveConfirming ||
        isApproveConfirmed ||
        approveError ||
        isDepositPending ||
        isDepositConfirming ||
        isDepositConfirmed ||
        depositError ||
        allowanceData ||
        tokenBalanceData)
    ) {
      console.log("Transaction states:", {
        isApprovePending,
        isApproveConfirming,
        isApproveConfirmed,
        approveError: approveError?.message,
        isDepositPending,
        isDepositConfirming,
        isDepositConfirmed,
        depositError: depositError?.message,
        allowance: allowanceData?.toString(),
        tokenBalance: tokenBalanceData?.toString(),
        selectedToken,
      });
      hasLogged.current = true;
    }
    // Reset hasLogged when a new transaction starts
    if (isApprovePending || isDepositPending) {
      hasLogged.current = false;
    }
  }, [
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    approveError,
    isDepositPending,
    isDepositConfirming,
    isDepositConfirmed,
    depositError,
    allowanceData,
    tokenBalanceData,
    selectedToken,
  ]);

  return {
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
    allowance: allowanceData || BigInt(0),
    tokenBalance: tokenBalanceData || BigInt(0),
    allowanceError,
    tokenBalanceError,
  };
};


export const useRedeem = () => {
  const { chain } = useAccount();
  const { writeContract, data: hash, isPending, error: redeemError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    onSettled(data, error) {
      if (error) {
        console.error("Transaction error:", error);
        toast.error(`Redeem failed: ${error.message.slice(0, 100)}...`, { id: "redeem-error" });
      } else if (data) {
        toast.success("Redeem successful!", { id: "redeem-success" });
      }
    },
  });

  const redeem = async (tokenId) => {
    if (!chain || chain.id !== baseSepolia.id) {
      toast.error("Please switch to Base Sepolia network.", { id: "network-error" });
      return;
    }

    try {
      await writeContract({
        address: TIMELOCK_NFT_ADDRESS,
        abi: TimeLockNFT_ABI,
        functionName: "redeem",
        args: [tokenId],
      });
    } catch (err) {
      console.error("Redeem error:", err);
      const isCancelled = err.code === 4001 || /rejected|denied|cancelled/i.test(err.message);
      toast.error(isCancelled ? "Transaction cancelled" : `Redeem error: ${err.message.slice(0, 100)}...`, {
        id: "redeem-error",
      });
    }
  };

  return {
    redeem,
    isRedeemPending: isPending,
    isRedeemConfirming: isConfirming,
    isRedeemConfirmed: isConfirmed,
    redeemError,
    redeemHash: hash,
  };
};