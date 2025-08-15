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
import {ethers} from "ethers"
import IERC20ABI from "../abis/ierc20.json";
// Replace with your deployed contract address
const TIME_LOCK_NFT_STAKING_ADDRESS =
  "0x011b1D37121B292869A1ea9b3eB32bbD67B9F016";
  

export const useAddAllowedToken = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash });
  const { address, chain } = useAccount();
  const chainId = chain?.id || baseSepolia.id;

  const addAllowedToken = async (tokenAddress) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }
    if (chainId !== baseSepolia.id) {
      throw new Error("Invalid network");
    }
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid token address");
    }

    try {
      console.log("Adding token...", { tokenAddress });
      await writeContract({
        address: TIME_LOCK_NFT_STAKING_ADDRESS,
        abi: TimeLockNFTStakingABI,
        functionName: "addAllowedToken",
        args: [tokenAddress],
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
      } else if (err.message.includes("Ownable: caller is not the owner")) {
        errorMessage = "Only owner can add tokens";
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
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
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
  if (!allowedTokens || !Array.isArray(allowedTokens) || allowedTokens.length === 0) {
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
      decimals: decimalsError ? 18 : decimals !== undefined ? Number(decimals) : 18,
    };

    // Log errors for debugging
    if (nameError) {
      console.error(`Error fetching name for token ${token}:`, nameError);
    }
    if (decimalsError) {
      console.error(`Error fetching decimals for token ${token}:`, decimalsError);
    }
  });

  return metadata;
};




export const useApproveAndDepositFunds = (tokenAddress, amountInWei) => {
  const { writeContract, data: hash, error, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { address, chain } = useAccount();
  const chainId = chain?.id || baseSepolia.id;
  const [transactionStep, setTransactionStep] = useState(null); // 'approve', 'deposit', or null
  const [lastHash, setLastHash] = useState(null); // Track the latest transaction hash

  // Check allowance at the top level
  const { data: allowance, error: allowanceError, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: IERC20ABI,
    functionName: "allowance",
    args: [address, TIME_LOCK_NFT_STAKING_ADDRESS],
    chainId,
    query: { enabled: !!address && !!tokenAddress && ethers.isAddress(tokenAddress) },
  });

  const needsApproval = tokenAddress && amountInWei && allowance !== undefined
    ? BigInt(allowance) < BigInt(amountInWei)
    : false;

  const approveTokens = async () => {
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
    if (!Number.isInteger(Number(amountInWei)) || Number(amountInWei) <= 0) {
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
      setTransactionStep("approve");
      console.log("Approving token spend...", { tokenAddress, amountInWei });
      toast.info("Please confirm the approval transaction in your wallet", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      const { hash: approveHash } = await writeContract({
        address: tokenAddress,
        abi: IERC20ABI,
        functionName: "approve",
        args: [TIME_LOCK_NFT_STAKING_ADDRESS, BigInt(amountInWei)],
        chainId,
      });

      setLastHash(approveHash);
      const { isSuccess: isApprovalConfirmed } = await useWaitForTransactionReceipt({
        hash: approveHash,
      });

      if (!isApprovalConfirmed) {
        throw new Error("Approval transaction failed");
      }

      toast.success("Approval successful! Please proceed with depositing funds.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      // Refetch allowance to update needsApproval
      await refetchAllowance();
    } catch (err) {
      console.error("Approval error:", err);
      let errorMessage = err.message.includes("User rejected")
        ? "Approval transaction cancelled"
        : err.message.includes("Approval transaction failed")
        ? "Token approval failed"
        : null;
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
    } finally {
      setTransactionStep(null);
      reset(); // Reset writeContract state
    }
  };

  const depositFunds = async () => {
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
    if (!Number.isInteger(Number(amountInWei)) || Number(amountInWei) <= 0) {
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
      setTransactionStep("deposit");
      console.log("Depositing funds...", { tokenAddress, amountInWei });
      toast.info("Please confirm the deposit transaction in your wallet", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      const { hash: depositHash } = await writeContract({
        address: TIME_LOCK_NFT_STAKING_ADDRESS,
        abi: TimeLockNFTStakingABI,
        functionName: "depositFunds",
        args: [tokenAddress, BigInt(amountInWei)],
        chainId,
      });

      setLastHash(depositHash);
      const { isSuccess: isDepositConfirmed } = await useWaitForTransactionReceipt({
        hash: depositHash,
      });

      if (!isDepositConfirmed) {
        throw new Error("Deposit transaction failed");
      }
    } catch (err) {
      console.error("Deposit funds error:", err);
      let errorMessage;
      if (err.message.includes("User rejected")) {
        errorMessage = "Deposit transaction cancelled";
      } else if (err.message.includes("Ownable: caller is not the owner")) {
        errorMessage = "Only owner can deposit funds";
      } else if (err.message.includes("Invalid deposit token")) {
        errorMessage = "Invalid token";
      } else if (err.message.includes("Zero amount")) {
        errorMessage = "Amount must be greater than zero";
      } else if (err.message.includes("Not enough funds to cover deposits")) {
        errorMessage = "Insufficient token balance";
      }
      //  else {
      //   errorMessage = "Failed to deposit funds";
      // }
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
    } finally {
      setTransactionStep(null);
      reset(); // Reset writeContract state
    }
  };

  useEffect(() => {
    if (isConfirmed && transactionStep === "deposit" && hash === lastHash) {
      toast.success("Funds deposited successfully!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  }, [isConfirmed, transactionStep, hash, lastHash]);

  useEffect(() => {
    console.log("Transaction states:", {
      isPending,
      isConfirming,
      isConfirmed,
      error: error?.message,
      hash,
      transactionStep,
      lastHash,
      allowance,
      needsApproval,
    });
  }, [isPending, isConfirming, isConfirmed, error, hash, transactionStep, lastHash, allowance, needsApproval]);

  return {
    approveTokens,
    depositFunds,
    needsApproval,
    isPending,
    isConfirming,
    isConfirmed,
    transactionStep,
    error: error ? error.message : null,
    refetchAllowance,
  };
};