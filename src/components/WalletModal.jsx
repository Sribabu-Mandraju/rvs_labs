// import { useEffect, useState } from 'react';
// import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
// import { baseSepolia } from 'wagmi/chains';
// import { ConnectButton } from '@rainbow-me/rainbowkit';
// import { toast } from 'react-toastify';

// function WalletConnect() {
//   const { address, isConnected, chain, status } = useAccount();
//   const { disconnect } = useDisconnect();
//   const { switchChain } = useSwitchChain();
//   const [chainError, setChainError] = useState(null);

//   useEffect(() => {
//     console.log('Wallet status:', { status, isConnected, address, chainId: chain?.id });

//     const checkNetwork = async () => {
//       if (isConnected && chain && ![baseSepolia.id, base.id].includes(chain.id)) {
//         console.log('Invalid chain detected:', { chainId: chain.id });
//         setChainError('Please switch to Base Sepolia or Base Mainnet');
//         try {
//           console.log('Attempting to switch to Base Sepolia');
//           await switchChain({ chainId: baseSepolia.id });
//           setChainError(null);
//           toast.success('Switched to Base Sepolia');
//         } catch (error) {
//           console.error('Chain switch error:', error);
//           setChainError(`Failed to switch chain: ${error.message}`);
//           toast.error(`Failed to switch chain: ${error.message}`);
//         }
//       } else {
//         setChainError(null);
//       }
//     };

//     if (isConnected) {
//       checkNetwork();
//     }
//   }, [isConnected, chain, status, switchChain]);

//   return (
//     <div>
//       <ConnectButton
//         showBalance={false}
//         accountStatus={{
//           smallScreen: 'avatar',
//           largeScreen: 'full',
//         }}
//         chainStatus={{
//           smallScreen: 'icon',
//           largeScreen: 'full',
//         }}
//       />
//       {chainError && <p style={{ color: 'red' }}>{chainError}</p>}
//     </div>
//   );
// }

// export default WalletConnect;

import React from 'react'

const WalletModal = () => {
  return (
    <div>
      
    </div>
  )
}

export default WalletModal
