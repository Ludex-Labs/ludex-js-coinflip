import { IProvider } from "@web3auth/base";
import Web3 from "web3";
import { IWalletProvider } from "./walletProvider";
const ethers = require("ethers");

const ethProvider = (provider: IProvider): IWalletProvider => {
  const getAccounts = async () => {
    try {
      const web3 = new Web3(provider as any);
      const accounts = await web3.eth.getAccounts();
      return accounts;
    } catch (error) {
      console.error("Error", error);
    }
  };

  const getBalance = async () => {
    try {
      const web3 = new Web3(provider as any);
      const accounts = await web3.eth.getAccounts();
      const balance = await web3.eth.getBalance(accounts[0]);
      return parseInt(balance.toString());
    } catch (error) {
      console.error("Error", error);
    }
  };

  const signAndSendTransaction = async (tx: any) => {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const _tx = await signer.sendTransaction(tx);
      const receipt = await _tx.wait();
      return receipt;
    } catch (error) {
      console.error("Error", error);
      throw "An error occured while sending transaction...";
    }
  };

  return {
    getAccounts,
    getBalance,
    signAndSendTransaction,
  };
};

export default ethProvider;
