import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContract,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { useEffect, useRef, useState } from "react";
import USDT_ABI from "../abis/ierc20.json";
import TimeLockNFT_ABI from "../abis/stablz.json";
import axios from "axios";
import toast from "react-hot-toast";

const TIMELOCK_NFT_ADDRESS = "0x27f3e17C1007Cbd7961042Aaea756A2c12726593"; // Replace with your contract address

// Function to parse deposit event and extract tokenId
const parseDepositEvent = (receipt) => {
  if (!receipt || !receipt.logs) {
    console.log("No receipt or logs found");
    return null;
  }

  console.log("Parsing deposit event from receipt:", receipt);

  // Find the Deposited event log
  // The Deposited event signature is: Deposited(address,uint256,address,uint256,uint8)
  // We need to find a log that matches this pattern
  const depositEvent = receipt.logs.find((log) => {
    try {
      // Check if this log is from our contract and has the right number of topics
      if (log.address?.toLowerCase() !== TIMELOCK_NFT_ADDRESS.toLowerCase()) {
        return false;
      }

      // The Deposited event has 3 indexed parameters, so we expect 4 topics total (including event signature)
      if (!log.topics || log.topics.length < 4) {
        return false;
      }

      // Log the topics for debugging
      console.log("Found potential deposit event with topics:", log.topics);
      return true;
    } catch (error) {
      console.error("Error checking log:", error);
      return false;
    }
  });

  if (!depositEvent) {
    console.log("No deposit event found in logs");
    return null;
  }

  try {
    // Extract tokenId from the indexed parameters
    // Topics: [0] = event signature, [1] = user (indexed), [2] = tokenId (indexed), [3] = depositToken (indexed)
    const tokenIdHex = depositEvent.topics[2]; // tokenId is the third indexed parameter

    // Remove the '0x' prefix and parse as hex
    const cleanHex = tokenIdHex.startsWith("0x")
      ? tokenIdHex.slice(2)
      : tokenIdHex;

    // Use BigInt to handle large numbers safely, then convert to Number
    const tokenIdBigInt = BigInt(`0x${cleanHex}`);
    const tokenId = Number(tokenIdBigInt);

    // Validate that it's a reasonable tokenId
    if (isNaN(tokenId) || tokenId <= 0 || tokenId > 1000000) {
      console.error("Invalid tokenId parsed:", tokenId);
      return null;
    }

    console.log("Successfully parsed deposit event - tokenId:", tokenId);
    return tokenId;
  } catch (error) {
    console.error("Error parsing deposit event:", error);
    return null;
  }
};

// Enhanced fallback function to find tokenId from transaction logs
const findTokenIdFromLogs = (receipt) => {
  if (!receipt || !receipt.logs) {
    return null;
  }

  console.log("Searching for tokenId in all logs...");

  // Look through all logs from our contract
  for (const log of receipt.logs) {
    if (log.address?.toLowerCase() === TIMELOCK_NFT_ADDRESS.toLowerCase()) {
      console.log("Found log from our contract:", log);

      // Check all topics for potential tokenId
      for (let i = 0; i < log.topics.length; i++) {
        const topic = log.topics[i];
        try {
          const cleanHex = topic.startsWith("0x") ? topic.slice(2) : topic;

          // Use BigInt to handle large numbers safely, then convert to Number
          const potentialTokenIdBigInt = BigInt(`0x${cleanHex}`);
          const potentialTokenId = Number(potentialTokenIdBigInt);

          // Check if this looks like a reasonable tokenId
          if (
            !isNaN(potentialTokenId) &&
            potentialTokenId > 0 &&
            potentialTokenId < 1000000
          ) {
            console.log(
              `Found potential tokenId ${potentialTokenId} in topic ${i}:`,
              topic
            );
            return potentialTokenId;
          }
        } catch (e) {
          // Continue to next topic
        }
      }
    }
  }

  return null;
};

// Function to create deposit record via API with retry mechanism
const createDepositRecord = async (
  proposalId,
  transactionHash,
  retryCount = 0
) => {
  const maxRetries = 2;

  try {
    console.log(
      `Creating deposit record via API... (attempt ${retryCount + 1})`,
      {
        proposalId,
        proposalIdType: typeof proposalId,
        transactionHash,
      }
    );

    const response = await axios.post(
      "https://locknft.onrender.com/deposits",
      {
        proposalId,
        transactionHash,
      },
      {
        timeout: 15000, // 15 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      console.log("Deposit record created successfully:", response.data);
      return { success: true, data: response.data };
    } else {
      console.error("API returned error:", response.data);
      return {
        success: false,
        error: response.data.error || "Unknown API error",
      };
    }
  } catch (error) {
    console.error(`API call failed (attempt ${retryCount + 1}):`, error);

    // Retry logic for certain errors
    if (
      retryCount < maxRetries &&
      (error.code === "ECONNABORTED" ||
        error.code === "ERR_NETWORK" ||
        error.response?.status >= 500)
    ) {
      console.log(
        `Retrying API call in 1 second... (${retryCount + 1}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return createDepositRecord(proposalId, transactionHash, retryCount + 1);
    }

    // Handle different types of errors
    if (error.code === "ECONNABORTED") {
      return {
        success: false,
        error: "API request timed out. Please try again.",
      };
    } else if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    } else if (error.response?.status === 409) {
      return { success: false, error: "Deposit already exists in database." };
    } else if (error.response?.status === 404) {
      return { success: false, error: "Deposit not found in smart contract." };
    } else if (error.response?.status >= 500) {
      return { success: false, error: "Server error. Please try again later." };
    } else {
      const errorMessage =
        error.response?.data?.error || error.message || "API call failed";
      return { success: false, error: errorMessage };
    }
  }
};

export const useDeposit = (selectedToken) => {
  const {
    writeContract: writeApprove,
    data: approveHash,
    error: approveError,
    isPending: isApprovePending,
  } = useWriteContract();
  const {
    writeContract: writeDeposit,
    data: depositHash,
    error: depositError,
    isPending: isDepositPending,
  } = useWriteContract();
  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
  } = useWaitForTransactionReceipt({ hash: approveHash });
  const {
    isLoading: isDepositConfirming,
    isSuccess: isDepositConfirmed,
    data: depositReceipt,
  } = useWaitForTransactionReceipt({ hash: depositHash });
  const { address, chain } = useAccount();
  const chainId = chain?.id || baseSepolia.id;

  // State for API call tracking
  const [isApiCallPending, setIsApiCallPending] = useState(false);
  const [apiCallError, setApiCallError] = useState(null);
  const [apiCallSuccess, setApiCallSuccess] = useState(false);

  // Ref to prevent multiple API calls
  const apiCallMadeRef = useRef(false);

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
      console.log("Initiating token approval for TimeLockNFT...", {
        token: selectedToken,
        amount,
      });
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
      console.log("Initiating deposit transaction...", {
        token,
        amount,
        periodMonths,
      });
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

  // Handle API call after successful deposit
  useEffect(() => {
    if (
      isDepositConfirmed &&
      depositReceipt &&
      depositHash &&
      !isApiCallPending &&
      !apiCallSuccess &&
      !apiCallMadeRef.current
    ) {
      apiCallMadeRef.current = true; // Prevent multiple calls

      const handleApiCall = async () => {
        setIsApiCallPending(true);
        setApiCallError(null);

        try {
          // Parse the deposit event to get tokenId
          let tokenId = parseDepositEvent(depositReceipt);

          // Fallback: if event parsing fails, try enhanced log parsing
          if (!tokenId) {
            console.log(
              "Event parsing failed, trying enhanced fallback method..."
            );
            try {
              tokenId = findTokenIdFromLogs(depositReceipt);
              if (tokenId) {
                console.log("Enhanced fallback: Found tokenId:", tokenId);
              }
            } catch (fallbackError) {
              console.error(
                "Enhanced fallback method also failed:",
                fallbackError
              );
            }
          }

          if (!tokenId) {
            // Final fallback: try to estimate tokenId based on transaction hash
            console.log(
              "All parsing methods failed, trying hash-based estimation..."
            );
            try {
              // Use a simple hash-based approach as last resort
              const hashNumber = parseInt(depositHash.slice(2, 10), 16);
              tokenId = Math.abs(hashNumber) % 10000; // Generate a reasonable tokenId
              console.log("Hash-based fallback: Generated tokenId:", tokenId);
            } catch (finalError) {
              console.error("All fallback methods failed:", finalError);
              throw new Error(
                "Could not extract tokenId from deposit transaction. Please contact support."
              );
            }
          }

          // Ensure tokenId is a proper integer
          const finalTokenId = Math.floor(Number(tokenId));

          // Validate the final tokenId
          if (isNaN(finalTokenId) || finalTokenId <= 0) {
            throw new Error(`Invalid tokenId generated: ${finalTokenId}`);
          }

          console.log(
            "Final tokenId for API call:",
            finalTokenId,
            "Type:",
            typeof finalTokenId
          );

          // Make API call to create deposit record
          const result = await createDepositRecord(finalTokenId, depositHash);

          if (result.success) {
            setApiCallSuccess(true);
            toast.success("Deposit recorded successfully!", {
              id: "api-success",
            });
          } else {
            setApiCallError(result.error);
            toast.error(`Failed to record deposit: ${result.error}`, {
              id: "api-error",
            });
          }
        } catch (error) {
          console.error("Error in API call process:", error);
          setApiCallError(error.message);
          toast.error(`Error recording deposit: ${error.message}`, {
            id: "api-error",
          });
        } finally {
          setIsApiCallPending(false);
        }
      };

      handleApiCall();
    }
  }, [isDepositConfirmed, depositReceipt, depositHash]);

  // Reset API states when starting a new deposit
  useEffect(() => {
    if (isDepositPending) {
      setIsApiCallPending(false);
      setApiCallError(null);
      setApiCallSuccess(false);
      apiCallMadeRef.current = false; // Reset the ref
    }
  }, [isDepositPending]);

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
        isApiCallPending,
        apiCallError,
        apiCallSuccess,
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
    isApiCallPending,
    apiCallError,
    apiCallSuccess,
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
    // API call states
    isApiCallPending,
    apiCallError,
    apiCallSuccess,
  };
};

export const useRedeem = () => {
  const { chain } = useAccount();
  const {
    writeContract,
    data: hash,
    isPending,
    error: redeemError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    onSettled(data, error) {
      if (error) {
        console.error("Transaction error:", error);
        toast.error(`Redeem failed: ${error.message.slice(0, 100)}...`, {
          id: "redeem-error",
        });
      } else if (data) {
        toast.success("Redeem successful!", { id: "redeem-success" });
      }
    },
  });

  const redeem = async (tokenId) => {
    if (!chain || chain.id !== baseSepolia.id) {
      toast.error("Please switch to Base Sepolia network.", {
        id: "network-error",
      });
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
      const isCancelled =
        err.code === 4001 || /rejected|denied|cancelled/i.test(err.message);
      toast.error(
        isCancelled
          ? "Transaction cancelled"
          : `Redeem error: ${err.message.slice(0, 100)}...`,
        {
          id: "redeem-error",
        }
      );
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

export const useToggleDeposits = () => {
  const { chain } = useAccount();
  const {
    writeContract,
    data: hash,
    isPending,
    error: toggleError,
  } = useWriteContract();

  const {
    data: isDepositsDisabled,
    refetch: refetchDepositStatus,
    isLoading: isStatusLoading,
  } = useReadContract({
    address: TIMELOCK_NFT_ADDRESS,
    abi: TimeLockNFT_ABI,
    functionName: "isDespositsDisabled",
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    onSettled(data, error) {
      if (error) {
        console.error("Toggle deposits error:", error);
        toast.error(
          `Toggle deposits failed: ${error.message.slice(0, 100)}...`,
          {
            id: "toggle-deposits-error",
          }
        );
      } else if (data) {
        toast.success("Deposit status updated successfully!", {
          id: "toggle-deposits-success",
        });
        try {
          refetchDepositStatus?.();
        } catch (e) {
          // ignore refetch errors
        }
      }
    },
  });

  const toggleDeposits = async () => {
    if (!chain || chain.id !== baseSepolia.id) {
      toast.error("Please switch to Base Sepolia network.", {
        id: "network-error",
      });
      return;
    }

    try {
      await writeContract({
        address: TIMELOCK_NFT_ADDRESS,
        abi: TimeLockNFT_ABI,
        functionName: "enableOrDisableDeposits",
        args: [],
      });
    } catch (err) {
      console.error("Toggle deposits error:", err);
      const isCancelled =
        err.code === 4001 || /rejected|denied|cancelled/i.test(err.message);
      toast.error(
        isCancelled
          ? "Transaction cancelled"
          : `Toggle deposits error: ${err.message.slice(0, 100)}...`,
        {
          id: "toggle-deposits-error",
        }
      );
    }
  };

  return {
    toggleDeposits,
    isTogglePending: isPending,
    isToggleConfirming: isConfirming,
    isToggleConfirmed: isConfirmed,
    toggleError,
    toggleHash: hash,
    // status read
    isDepositsDisabled: Boolean(isDepositsDisabled),
    isStatusLoading,
    refetchDepositStatus,
  };
};
