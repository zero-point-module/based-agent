import { createConfig } from '@wagmi/core';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { cookieStorage, createStorage, http, type Config } from '@wagmi/core';
import { metaMaskWallet, rainbowWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import {
  base as baseMainnet,
  mainnet as ethereumMainnet,
  arbitrum as arbitrumMainnet,
  avalanche as avalancheMainnet,
  baseSepolia,
  sepolia as ethereumSepolia,
  avalancheFuji,
  arbitrumSepolia,
} from 'viem/chains';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended Wallet',
      wallets: [coinbaseWallet],
    },
    {
      groupName: 'Other Wallets',
      wallets: [rainbowWallet, metaMaskWallet],
    },
  ],
  {
    appName: 'degen-ai',
    projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  }
);

export function getConfig(): Config {
  return createConfig({
    chains: [
      baseMainnet,
      ethereumMainnet,
      arbitrumMainnet,
      avalancheMainnet,
      baseSepolia,
      ethereumSepolia,
      avalancheFuji,
      arbitrumSepolia,
    ],
    connectors,
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [baseMainnet.id]: http(),
      [ethereumMainnet.id]: http(),
      [arbitrumMainnet.id]: http(),
      [avalancheMainnet.id]: http(),
      [baseSepolia.id]: http(),
      [ethereumSepolia.id]: http(),
      [avalancheFuji.id]: http(),
      [arbitrumSepolia.id]: http(),
    },
  });
}

declare module '@wagmi/core' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
