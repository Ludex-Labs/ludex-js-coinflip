import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { ChallengeView } from "./ChallengeView";
import { PayoutView } from "./PayoutView";
import { RPC } from "./Solana/RPC";
import { WalletSolana } from "./Solana/WalletSolana";
import { Connection } from "@solana/web3.js";
import Image from "next/image";
import Confetti from "react-confetti";
import Lottie from "react-lottie";
import * as coin from "./animations/coin.json";
import ChallengesView from "./ChallengesView";

// Web3Auth
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";

// MUI
import WalletIcon from "@mui/icons-material/Wallet";
import { Box, Button, Typography } from "@mui/material";

function App() {
  const [viewWallet, setViewWallet] = useState<boolean>(false);
  const [isMainnet, setIsMainnet] = useState<boolean>(false);
  const [wallet, setWallet] = useState<any>();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  const [challengeId, setChallengeId] = useState<number>(0);
  const [payoutId, setPayoutId] = useState<number>(0);
  const [displayConfetti, setDisplayConfetti] = useState<boolean>(false);

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.SOLANA,
            chainId: isMainnet ? "0x3" : "0x1",
            rpcTarget: isMainnet
              ? "https://api.mainnet-beta.solana.com"
              : process.env.NEXT_PUBLIC_SOLANA_RPC ||
                "https://api.devnet.solana.com",
          },
          uiConfig: {
            theme: "dark",
            loginMethodsOrder: ["google"],
            appLogo: "https://ludex.gg/logo/logo.svg",
          },
        });
        setWeb3auth(web3auth);
        const openloginAdapter = new OpenloginAdapter({
          loginSettings: {
            mfaLevel: "optional",
          },
        });
        web3auth.configureAdapter(openloginAdapter);
        web3auth.initModal();

        if (web3auth.provider) {
          setProvider(web3auth.provider);
          changeNetwork("devnet");
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (!web3auth) initWeb3Auth();
  }, [isMainnet, web3auth]);

  useEffect(() => {
    const getWallet = async () => {
      if (!provider) {
        console.error("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider);
      const wallet = await rpc.getWallet();
      setWallet(wallet);
    };

    if (!wallet && provider) getWallet();
  }, [provider, wallet]);

  const changeNetwork = async (network: string) => {
    const isMainnet = network === "mainnet";
    var connection = new Connection(
      isMainnet
        ? "https://api.mainnet-beta.solana.com"
        : process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com"
    );
    setConnection(connection || null);
    setIsMainnet(isMainnet);
  };

  const login = async () => {
    if (!web3auth) {
      console.error("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    await changeNetwork("devnet");
    toast.success("Logged in Successfully!");
  };

  const logout = async () => {
    if (!web3auth) {
      console.error("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setViewWallet(false);
    toast.success("Logged out!");
  };

  return (
    <Box className=" bg">
      <Toaster />

      {displayConfetti && (
        <Confetti
          numberOfPieces={400}
          gravity={0.8}
          style={{ width: "100%" }}
        />
      )}

      <Box className="container-page">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: coin,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice",
            },
          }}
          height={150}
          width={150}
          isStopped={false}
          isPaused={false}
          style={{
            position: "absolute",
            top: 0,
            zIndex: -1,
          }}
        />

        <span className="join-container">
          {!connection && (
            <Box
              sx={{
                mb: 3,
                width: "80%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Image
                src={"./ludex-logo.svg"}
                alt="Ludex"
                height={100}
                width={250}
              />
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  mb: 1,
                  mt: 1,
                }}
              >
                Coin Flip Challenge
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                on Devnet
              </Typography>
            </Box>
          )}
          {viewWallet && provider && connection && connection != null ? (
            <WalletSolana
              publicKey={wallet?.publicKey?.toString() || ""}
              provider={provider}
              isMainnet={isMainnet}
              connection={connection}
              changeNetwork={changeNetwork}
              logout={logout}
            />
          ) : payoutId === 0 && provider && connection && connection != null ? (
            <PayoutView setPayoutId={setPayoutId} />
          ) : challengeId === 0 &&
            provider &&
            connection &&
            connection != null ? (
            <ChallengesView
              payoutId={payoutId}
              setChallengeId={setChallengeId}
              setPayoutId={setPayoutId}
            />
          ) : provider && connection && challengeId !== 0 ? (
            <ChallengeView
              provider={provider}
              wallet={wallet}
              isMainnet={isMainnet}
              connection={connection}
              challengeId={challengeId}
              setChallengeId={setChallengeId}
              setDisplayConfetti={setDisplayConfetti}
            />
          ) : (
            <Button
              className="btn"
              variant={"contained"}
              size="large"
              sx={{ width: "100%" }}
              onClick={() => login()}
            >
              Sign In
            </Button>
          )}

          {provider && (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  flex: 1,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  className="btn"
                  variant="contained"
                  onClick={() => setViewWallet(!viewWallet)}
                  sx={{ mt: 1, mb: 0 }}
                >
                  {!viewWallet && (
                    <WalletIcon sx={{ width: "25px", height: "25px" }} />
                  )}
                  <Box sx={{ ml: viewWallet ? 0 : "5px" }}>
                    {viewWallet ? "Back" : "Wallet"}
                  </Box>
                </Button>
              </Box>
            </>
          )}
        </span>
      </Box>
    </Box>
  );
}

export default App;
