import { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

function WalletConnect({ onAuthSuccess }) {
  const { address, isConnected, chain, status } = useAccount();
  const { switchChain } = useSwitchChain();
  const [chainError, setChainError] = useState(null);

  useEffect(() => {
    console.log("useEffect triggered", {
      status,
      isConnected,
      address,
      chain: chain?.id,
    });

    const checkNetwork = async () => {
      if (!isConnected || !address) {
        console.log("Wallet not connected", { status, isConnected, address });
        return;
      }

      if (chain && ![base.id, baseSepolia.id].includes(chain.id)) {
        console.log("Invalid chain detected", { chainId: chain?.id });
        setChainError("Please switch to Base Mainnet or Base Sepolia");
        try {
          console.log("Attempting to switch to Base Mainnet");
          await switchChain({ chainId: base.id });
          console.log("Switched to Base Mainnet");
          setChainError(null);
          // Call onAuthSuccess with the connected address
          onAuthSuccess(address);
        } catch (error) {
          console.error("Chain switch error:", error);
          setChainError(`Failed to switch chain: ${error.message}`);
        }
      } else {
        setChainError(null);
        // Call onAuthSuccess if already on the correct chain
        onAuthSuccess(address);
      }
    };

    if (isConnected) {
      checkNetwork();
    }
  }, [isConnected, address, chain, status, switchChain, onAuthSuccess]);

  return (
    <div>
      <w3m-button />
      {chainError && <p style={{ color: "red" }}>{chainError}</p>}
    </div>
  );
}

export default WalletConnect;
