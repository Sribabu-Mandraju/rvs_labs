import { useState, useEffect, useMemo, useRef } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContract,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { toast } from "react-toastify";
import TimeLockNFTStakingABI from "../abis/stablz.json";
import { ethers } from "ethers";
import IERC20ABI from "../abis/ierc20.json";
// Replace with your deployed contract address
const TIME_LOCK_NFT_STAKING_ADDRESS =
  "0x27f3e17C1007Cbd7961042Aaea756A2c12726593";

export const useAddAllowedToken = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash });
  const { address, chain } = useAccount();
  const chainId = chain?.id || baseSepolia.id;

  const addAllowedToken = async (tokenAddress, cap) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }
    if (chainId !== baseSepolia.id) {
      throw new Error("Invalid network");
    }
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid token address");
    }
    if (!cap || cap <= 0) {
      throw new Error("Invalid cap amount");
    }

    try {
      console.log("Adding token...", { tokenAddress, cap });
      await writeContract({
        address: TIME_LOCK_NFT_STAKING_ADDRESS,
        abi: TimeLockNFTStakingABI,
        functionName: "addAllowedToken",
        args: [tokenAddress, cap],
        chainId,
      });
      toast.info("Adding token...", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (err) {
      console.error("Add token error:", err);
      let errorMessage;
      if (err.message.includes("User rejected")) {
        errorMessage = "Transaction cancelled";
      } else if (err.message.includes("Zero address")) {
        errorMessage = "Zero address not allowed";
      } else if (err.message.includes("Token already exists")) {
        errorMessage = "Token already added";
      } else if (err.message.includes("Invalid max cap")) {
        errorMessage = "Invalid cap amount";
      } else if (err.message.includes("Ownable: caller is not the owner")) {
        errorMessage = "Only owner can add tokens";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient gas fees";
      } else {
        errorMessage = "Failed to add token";
      }
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      throw new Error(errorMessage);
    }
  };

  // Handle success toast
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Token added!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  }, [isConfirmed]);

  // Log transaction states for debugging
  useEffect(() => {
    console.log("Transaction states:", {
      isPending,
      isConfirming,
      isConfirmed,
      error: error?.message,
      hash,
    });
  }, [isPending, isConfirming, isConfirmed, error, hash]);

  return {
    addAllowedToken,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: error ? error.message : null,
  };
};

export const useSetROIs = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash });
  const { address, chain } = useAccount();
  const chainId = chain?.id || baseSepolia.id;

  const setROIs = async (roi1m, roi2m, roi3m) => {
    if (!address) {
      toast.error("Connect wallet", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      throw new Error("Wallet not connected");
    }
    if (chainId !== baseSepolia.id) {
      toast.error("Switch to Base Sepolia", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      throw new Error("Invalid network");
    }
    if (
      !Number.isInteger(Number(roi1m)) ||
      !Number.isInteger(Number(roi2m)) ||
      !Number.isInteger(Number(roi3m)) ||
      Number(roi1m) < 0 ||
      Number(roi2m) < 0 ||
      Number(roi3m) < 0
    ) {
      toast.error("Invalid ROI values", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      throw new Error("Invalid ROI values");
    }

    try {
      console.log("Setting ROIs...", { roi1m, roi2m, roi3m });
      await writeContract({
        address: TIME_LOCK_NFT_STAKING_ADDRESS,
        abi: TimeLockNFTStakingABI,
        functionName: "setROIs",
        args: [BigInt(roi1m), BigInt(roi2m), BigInt(roi3m)],
        chainId,
      });
      toast.info("Setting ROIs...", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (err) {
      console.error("Set ROIs error:", err);
      let errorMessage;
      if (err.message.includes("User rejected")) {
        errorMessage = "Transaction cancelled";
      } else if (err.message.includes("Ownable: caller is not the owner")) {
        errorMessage = "Only owner can set ROIs";
      } else {
        errorMessage = "Failed to set ROIs";
      }
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      toast.success("ROIs updated!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  }, [isConfirmed]);

  useEffect(() => {
    console.log("Transaction states:", {
      isPending,
      isConfirming,
      isConfirmed,
      error: error?.message,
      hash,
    });
  }, [isPending, isConfirming, isConfirmed, error, hash]);

  return {
    setROIs,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: error ? error.message : null,
  };
};

export const useCollectTokensNuclear = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash });
  const { address, chain } = useAccount();
  const chainId = chain?.id || baseSepolia.id;

  const collectTokensNuclear = async (tokenAddress, amount) => {
    if (!address) {
      toast.error("Connect wallet", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      throw new Error("Wallet not connected");
    }
    if (chainId !== baseSepolia.id) {
      toast.error("Switch to Base Sepolia", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      throw new Error("Invalid network");
    }
    if (!ethers.isAddress(tokenAddress)) {
      toast.error("Invalid token address", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      throw new Error("Invalid token address");
    }
    if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
      toast.error("Invalid amount", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      throw new Error("Zero or invalid amount");
    }

    try {
      console.log("Collecting tokens...", { tokenAddress, amount });
      await writeContract({
        address: TIME_LOCK_NFT_STAKING_ADDRESS,
        abi: TimeLockNFTStakingABI,
        functionName: "collectTokensNuclear",
        args: [tokenAddress, BigInt(amount)],
        chainId,
      });
      toast.info("Collecting tokens...", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (err) {
      console.error("Collect tokens error:", err);
      let errorMessage;
      if (err.message.includes("User rejected")) {
        errorMessage = "Transaction cancelled";
      } else if (err.message.includes("Ownable: caller is not the owner")) {
        errorMessage = "Only owner can collect tokens";
      } else if (err.message.includes("Invalid deposit token")) {
        errorMessage = "Invalid token";
      } else if (err.message.includes("Zero amount")) {
        errorMessage = "Amount must be greater than zero";
      } else {
        errorMessage = "Failed to collect tokens";
      }
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Tokens collected!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  }, [isConfirmed]);

  useEffect(() => {
    console.log("Transaction states:", {
      isPending,
      isConfirming,
      isConfirmed,
      error: error?.message,
      hash,
    });
  }, [isPending, isConfirming, isConfirmed, error, hash]);

  return {
    collectTokensNuclear,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: error ? error.message : null,
  };
};

export const useTokenMetadata = (allowedTokens, chainId) => {
  // Initialize metadata object
  const metadata = {};

  // Guard against undefined or empty allowedTokens
  if (
    !allowedTokens ||
    !Array.isArray(allowedTokens) ||
    allowedTokens.length === 0
  ) {
    return {};
  }

  // Fetch metadata for each token
  allowedTokens.forEach((token, index) => {
    // Fetch token name
    const { data: name, error: nameError } = useReadContract({
      address: token,
      abi: IERC20ABI,
      functionName: "name",
      chainId,
      query: { enabled: !!token }, // Only fetch if token is valid
    });

    // Fetch token decimals
    const { data: decimals, error: decimalsError } = useReadContract({
      address: token,
      abi: IERC20ABI,
      functionName: "decimals",
      chainId,
      query: { enabled: !!token }, // Only fetch if token is valid
    });

    metadata[token] = {
      name: nameError
        ? `${token.slice(0, 6)}...${token.slice(-4)}`
        : name || "Loading...",
      decimals: decimalsError
        ? 18
        : decimals !== undefined
        ? Number(decimals)
        : 18,
    };

    // Log errors for debugging
    if (nameError) {
      console.error(`Error fetching name for token ${token}:`, nameError);
    }
    if (decimalsError) {
      console.error(
        `Error fetching decimals for token ${token}:`,
        decimalsError
      );
    }
  });

  return metadata;
};

// Hook to fetch metadata for a single token
export const useSingleTokenMetadata = (tokenAddress, chainId) => {
  const {
    data: name,
    error: nameError,
    isLoading: isNameLoading,
  } = useReadContract({
    address: tokenAddress,
    abi: IERC20ABI,
    functionName: "name",
    chainId,
    query: { enabled: !!tokenAddress && ethers.isAddress(tokenAddress) },
  });

  const {
    data: decimals,
    error: decimalsError,
    isLoading: isDecimalsLoading,
  } = useReadContract({
    address: tokenAddress,
    abi: IERC20ABI,
    functionName: "decimals",
    chainId,
    query: { enabled: !!tokenAddress && ethers.isAddress(tokenAddress) },
  });

  const {
    data: symbol,
    error: symbolError,
    isLoading: isSymbolLoading,
  } = useReadContract({
    address: tokenAddress,
    abi: IERC20ABI,
    functionName: "symbol",
    chainId,
    query: { enabled: !!tokenAddress && ethers.isAddress(tokenAddress) },
  });

  return {
    name: nameError ? null : name,
    decimals: decimalsError
      ? 18
      : decimals !== undefined
      ? Number(decimals)
      : 18,
    symbol: symbolError ? null : symbol,
    isLoading: isNameLoading || isDecimalsLoading || isSymbolLoading,
    hasError: nameError || decimalsError || symbolError,
  };
};

export const useApproveAndDepositFunds = (tokenAddress, amountInWei) => {
  const { address, chain } = useAccount();
  const chainId = chain?.id || baseSepolia.id;

  // Separate writeContract instances for approve and deposit
  const {
    writeContract: writeApprove,
    data: approveHash,
    error: approveError,
    isPending: isApprovePending,
    reset: resetApprove,
  } = useWriteContract();
  const {
    writeContract: writeDeposit,
    data: depositHash,
    error: depositError,
    isPending: isDepositPending,
    reset: resetDeposit,
  } = useWriteContract();

  // Track approval confirmation
  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Track deposit confirmation
  const {
    isLoading: isDepositConfirming,
    isSuccess: isDepositConfirmed,
  } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Check allowance
  const {
    data: allowance,
    error: allowanceError,
    refetch: refetchAllowance,
  } = useReadContract({
    address: tokenAddress,
    abi: IERC20ABI,
    functionName: "allowance",
    args: [address, TIME_LOCK_NFT_STAKING_ADDRESS],
    chainId,
    query: {
      enabled: !!address && !!tokenAddress && ethers.isAddress(tokenAddress),
    },
  });

  const needsApproval =
    tokenAddress && amountInWei && allowance !== undefined
      ? BigInt(allowance) < BigInt(amountInWei)
      : false;

  // Ref to store deposit parameters and toast ID
  const depositParamsRef = useRef(null);
  const toastIdRef = useRef(null);

  const approveTokens = async () => {
    if (!address) {
      toast.error("Connect wallet", { id: "connect-wallet" });
      throw new Error("Wallet not connected");
    }
    if (chainId !== baseSepolia.id) {
      toast.error("Switch to Base Sepolia", { id: "network-error" });
      throw new Error("Invalid network");
    }
    if (!ethers.isAddress(tokenAddress)) {
      toast.error("Invalid token address", { id: "token-error" });
      throw new Error("Invalid token address");
    }
    if (!Number.isInteger(Number(amountInWei)) || Number(amountInWei) <= 0) {
      toast.error("Invalid amount", { id: "amount-error" });
      throw new Error("Zero or invalid amount");
    }

    try {
      toastIdRef.current = toast.loading("Approving token...", {
        id: "approve-pending",
      });
      console.log("Approving token spend...", { tokenAddress, amountInWei });
      await writeApprove({
        address: tokenAddress,
        abi: IERC20ABI,
        functionName: "approve",
        args: [TIME_LOCK_NFT_STAKING_ADDRESS, BigInt(amountInWei)],
        chainId,
      });
    } catch (err) {
      console.error("Approval error:", err);
      const errorMessage =
        err.code === 4001 || err.message.includes("User rejected")
          ? "Approval transaction cancelled"
          : "Token approval failed";
      toast.error(errorMessage, { id: "approve-error" });
      throw new Error(errorMessage);
    }
  };

  const depositFunds = async () => {
    if (!address) {
      toast.error("Connect wallet", { id: "connect-wallet" });
      throw new Error("Wallet not connected");
    }
    if (chainId !== baseSepolia.id) {
      toast.error("Switch to Base Sepolia", { id: "network-error" });
      throw new Error("Invalid network");
    }
    if (!ethers.isAddress(tokenAddress)) {
      toast.error("Invalid token address", { id: "token-error" });
      throw new Error("Invalid token address");
    }
    if (!Number.isInteger(Number(amountInWei)) || Number(amountInWei) <= 0) {
      toast.error("Invalid amount", { id: "amount-error" });
      throw new Error("Zero or invalid amount");
    }

    try {
      toastIdRef.current = toast.loading("Depositing funds...", {
        id: "deposit-pending",
      });
      console.log("Depositing funds...", { tokenAddress, amountInWei });
      await writeDeposit({
        address: TIME_LOCK_NFT_STAKING_ADDRESS,
        abi: TimeLockNFTStakingABI,
        functionName: "depositFunds",
        args: [tokenAddress, BigInt(amountInWei)],
        chainId,
      });
    } catch (err) {
      console.error("Deposit funds error:", err);
      let errorMessage;
      if (err.code === 4001 || err.message.includes("User rejected")) {
        errorMessage = "Deposit transaction cancelled";
      } else if (err.message.includes("Ownable: caller is not the owner")) {
        errorMessage = "Only owner can deposit funds";
      } else if (err.message.includes("Invalid deposit token")) {
        errorMessage = "Invalid token";
      } else if (err.message.includes("Zero amount")) {
        errorMessage = "Amount must be greater than zero";
      } else if (err.message.includes("Not enough funds to cover deposits")) {
        errorMessage = "Insufficient token balance";
      } else {
        errorMessage = "Failed to deposit funds";
      }
      toast.error(errorMessage, { id: "deposit-error" });
      throw new Error(errorMessage);
    }
  };

  // Auto-trigger deposit after approval
  useEffect(() => {
    if (isApproveConfirmed && depositParamsRef.current) {
      console.log("Approval confirmed, auto-triggering deposit...");
      const { tokenAddress, amountInWei } = depositParamsRef.current;
      depositFunds(tokenAddress, amountInWei).catch((err) => {
        console.error("Auto-deposit error:", err);
      });
      depositParamsRef.current = null;
    }
  }, [isApproveConfirmed]);

  // Handle transaction states and toasts
  useEffect(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }

    if (isApprovePending) {
      toastIdRef.current = toast.loading("Approving token...", {
        id: "approve-pending",
      });
    } else if (isApproveConfirming) {
      toastIdRef.current = toast.loading("Confirming approval...", {
        id: "approve-confirming",
      });
    } else if (isApproveConfirmed && !depositParamsRef.current) {
      toastIdRef.current = toast.success("Token approved!", {
        id: "approve-success",
      });
      resetApprove();
    } else if (isDepositPending) {
      toastIdRef.current = toast.loading("Depositing funds...", {
        id: "deposit-pending",
      });
    } else if (isDepositConfirming) {
      toastIdRef.current = toast.loading("Confirming deposit...", {
        id: "deposit-confirming",
      });
    } else if (isDepositConfirmed) {
      toastIdRef.current = toast.success("Funds deposited successfully!", {
        id: "deposit-success",
      });
      resetApprove();
      resetDeposit();
    } else if (approveError) {
      const errorMessage =
        approveError.code === 4001 ||
        approveError.message.includes("User rejected")
          ? "Approval transaction cancelled"
          : "Token approval failed";
      toastIdRef.current = toast.error(errorMessage, { id: "approve-error" });
      resetApprove();
      depositParamsRef.current = null; // Clear pending deposit
    } else if (depositError) {
      let errorMessage;
      if (
        depositError.code === 4001 ||
        depositError.message.includes("User rejected")
      ) {
        errorMessage = "Deposit transaction cancelled";
      } else if (
        depositError.message.includes("Ownable: caller is not the owner")
      ) {
        errorMessage = "Only owner can deposit funds";
      } else if (depositError.message.includes("Invalid deposit token")) {
        errorMessage = "Invalid token";
      } else if (depositError.message.includes("Zero amount")) {
        errorMessage = "Amount must be greater than zero";
      } else if (
        depositError.message.includes("Not enough funds to cover deposits")
      ) {
        errorMessage = "Insufficient token balance";
      } else {
        errorMessage = "Failed to deposit funds";
      }
      toastIdRef.current = toast.error(errorMessage, { id: "deposit-error" });
      resetDeposit();
    }

    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    isDepositPending,
    isDepositConfirming,
    isDepositConfirmed,
    approveError,
    depositError,
  ]);

  // Handle deposit initiation
  const initiateDeposit = async (tokenAddress, amountInWei) => {
    if (needsApproval) {
      depositParamsRef.current = { tokenAddress, amountInWei };
      await approveTokens();
    } else {
      await depositFunds();
    }
  };

  // Debug transaction states
  useEffect(() => {
    console.log("Transaction states:", {
      isApprovePending,
      isApproveConfirming,
      isApproveConfirmed,
      approveHash,
      approveError: approveError?.message,
      isDepositPending,
      isDepositConfirming,
      isDepositConfirmed,
      depositHash,
      depositError: depositError?.message,
      allowance,
      needsApproval,
    });
  }, [
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    approveHash,
    approveError,
    isDepositPending,
    isDepositConfirming,
    isDepositConfirmed,
    depositHash,
    depositError,
    allowance,
    needsApproval,
  ]);

  return {
    initiateDeposit,
    needsApproval,
    isApprovePending,
    isApproveConfirming,
    isDepositPending,
    isDepositConfirming,
    isDepositConfirmed,
    approveError: approveError ? approveError.message : null,
    depositError: depositError ? depositError.message : null,
    refetchAllowance,
  };
};
