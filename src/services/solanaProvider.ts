import { CustomChainConfig, IProvider } from "@web3auth/base";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { SolanaWallet } from "@web3auth/solana-provider";
import { IWalletProvider } from "./walletProvider";
import { sign } from "crypto";

const solanaProvider = (provider: IProvider): IWalletProvider => {
  const solanaWallet = new SolanaWallet(provider);

  const getConnection = async (): Promise<Connection> => {
    const connectionConfig = await solanaWallet.request<
      string[],
      CustomChainConfig
    >({ method: "solana_provider_config", params: [] });
    const conn = new Connection(connectionConfig.rpcTarget);
    return conn;
  };

  const getAccounts = async (): Promise<string[]> => {
    try {
      const acc = await solanaWallet.requestAccounts();
      return acc;
    } catch (error) {
      console.error("Error", error);
      return [];
    }
  };

  const getBalance = async () => {
    try {
      const conn = await getConnection();
      const accounts = await solanaWallet.requestAccounts();
      const balance = await conn.getBalance(new PublicKey(accounts[0]));
      return balance;
    } catch (error) {
      console.error("Error", error);
    }
  };

  const signAndSendTransaction = async (tx: any): Promise<string> => {
    try {
      const solWeb3 = new SolanaWallet(provider);
      const res = await solWeb3.signAndSendTransaction(tx);
      return res.signature;
    } catch (error) {
      console.error("Error", error);
      throw error;
    }
  };

  return {
    getAccounts,
    getBalance,
    signAndSendTransaction,
  };
};

export default solanaProvider;
