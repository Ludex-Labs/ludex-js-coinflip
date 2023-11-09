import { ADAPTER_EVENTS, IProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CHAIN_CONFIG, CHAIN_CONFIG_TYPE } from "../config/chainConfig";
import { getWalletProvider, IWalletProvider } from "./walletProvider";

export interface IWeb3AuthContext {
  web3Auth: Web3Auth | null;
  provider: IWalletProvider | null;
  isLoading: boolean;
  user: unknown;
  chain: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<any>;
  getAccounts: () => Promise<any>;
  getBalance: () => Promise<any>;
  signAndSendTransaction: (tx: any) => Promise<any>;
}

export const Web3AuthContext = createContext<IWeb3AuthContext>({
  web3Auth: null,
  provider: null,
  isLoading: false,
  user: null,
  chain: "",
  login: async () => {},
  logout: async () => {},
  getUserInfo: async () => {},
  getAccounts: async () => {},
  getBalance: async () => {},
  signAndSendTransaction: async (tx: any) => Promise<any>,
});

export function useWeb3Auth(): IWeb3AuthContext {
  return useContext(Web3AuthContext);
}

interface IWeb3AuthState {
  chain: CHAIN_CONFIG_TYPE;
  children?: React.ReactNode;
}
interface IWeb3AuthProps {
  children?: ReactNode;
  chain: CHAIN_CONFIG_TYPE;
}

export const Web3AuthProvider: FunctionComponent<IWeb3AuthState> = ({
  children,
  chain,
}: IWeb3AuthProps) => {
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IWalletProvider | null>(null);
  const [user, setUser] = useState<unknown | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setWalletProvider = useCallback(
    (web3authProvider: IProvider) => {
      const walletProvider = getWalletProvider(chain, web3authProvider);
      setProvider(walletProvider);
    },
    [chain]
  );

  useEffect(() => {
    const subscribeAuthEvents = (web3auth: Web3Auth) => {
      // Can subscribe to all ADAPTER_EVENTS and LOGIN_MODAL_EVENTS
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: unknown) => {
        console.log("Yeah!, you are successfully logged in", data);
        setUser(data);
        setWalletProvider(web3auth.provider!);
      });

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
        setUser(null);
      });

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        console.error("some error or user has cancelled login request", error);
      });
    };

    const currentChainConfig = CHAIN_CONFIG[chain];

    async function init() {
      try {
        setIsLoading(true);
        const web3AuthInstance = new Web3Auth({
          chainConfig: currentChainConfig,
          clientId:
            "BDLLvEo-r5ABRmodTBkPZiX0JFILQmX9nZCzGmBBN9_nVHkvr5poqiz0qQ0L34s6Hl7r3_mXcldULhTX1iroe8I",
          uiConfig: {
            defaultLanguage: "en",
          },
        });
        const adapter = new OpenloginAdapter({
          adapterSettings: { network: "cyan" },
          loginSettings: {
            mfaLevel: "optional",
          },
        });
        web3AuthInstance.configureAdapter(adapter);
        subscribeAuthEvents(web3AuthInstance);
        setWeb3Auth(web3AuthInstance);
        await web3AuthInstance.initModal();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [chain, setWalletProvider]);

  const login = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      const localProvider = await web3Auth.connect();
      setWalletProvider(localProvider!);
    } catch (err) {
      console.log("err", err);
    }
  };

  const logout = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3Auth.logout();
    setProvider(null);
  };

  const getUserInfo = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3Auth.getUserInfo();
    console.log(user);
    return user;
  };

  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    return await provider.getAccounts();
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    return await provider.getBalance();
  };

  const signAndSendTransaction = async (tx: any) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    return await provider.signAndSendTransaction(tx);
  };

  const contextProvider = {
    web3Auth,
    chain,
    provider,
    user,
    isLoading,
    login,
    logout,
    getUserInfo,
    getAccounts,
    getBalance,
    signAndSendTransaction,
  };
  return (
    <Web3AuthContext.Provider value={contextProvider}>
      {children}
    </Web3AuthContext.Provider>
  );
};
