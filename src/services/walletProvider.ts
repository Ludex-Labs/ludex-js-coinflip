import { IProvider } from "@web3auth/base";
import ethProvider from "./ethProvider";
import solanaProvider from "./solanaProvider";

export interface IWalletProvider {
  getAccounts: () => Promise<any>;
  getBalance: () => Promise<any>;
  signAndSendTransaction: (tx: any) => Promise<string>;
}

export const getWalletProvider = (
  chain: string,
  provider: IProvider
): IWalletProvider => {
  if (chain === "SOLANA") {
    return solanaProvider(provider);
  }
  return ethProvider(provider);
};
