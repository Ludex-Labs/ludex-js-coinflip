import { CHAIN_NAMESPACES, CustomChainConfig } from "@web3auth/base";

export const CHAIN_CONFIG = {
  SOLANA: {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    rpcTarget: "https://api.devnet.solana.com",
    blockExplorer: "https://solscan.io/?cluster=devnet",
    chainId: "0x3",
    displayName: "Solana Devnet",
    ticker: "SOL",
    tickerName: "Solana",
  } as CustomChainConfig,
  AVALANCHE: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    rpcTarget: "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorer: "https://testnet.snowtrace.io/",
    chainId: "0xA869",
    displayName: "Avalanche Testnet",
    ticker: "AVAX",
    tickerName: "Avalanche",
  } as CustomChainConfig,
} as const;

export type CHAIN_CONFIG_TYPE = keyof typeof CHAIN_CONFIG;
