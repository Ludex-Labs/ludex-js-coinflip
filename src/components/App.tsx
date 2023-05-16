import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { ChallengeView } from "./Solana/ChallengeView";
import { RPC } from "./Solana/RPC";
import { WalletSolana } from "./Solana/WalletSolana";
import { Connection } from "@solana/web3.js";
import Image from "next/image";
import Confetti from "react-confetti";

import Lottie from "react-lottie";
import * as coin from "./coin.json";

// Web3Auth
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";

// MUI
import WalletIcon from "@mui/icons-material/Wallet";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Checkbox,
  FormGroup,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FormCreateChallenge from "./FormCreateChallenge";

function App() {
  const [viewWallet, setViewWallet] = useState<boolean>(false);
  const [isMainnet, setIsMainnet] = useState<boolean>(false);
  const [wallet, setWallet] = useState<any>();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  const [payoutId, setPayoutId] = useState<number>(0);
  const [challengeId, setChallengeId] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [displayConfetti, setDisplayConfetti] = useState<boolean>(false);
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [hideCompleted, setHideCompleted] = useState<boolean>(true);

  useEffect(() => {
    if (payoutId !== 0) getChallenges(payoutId);
  }, [payoutId]);

  const getChallenges = async (_payoutId: number) => {
    setLoading(true);
    const response = await fetch(`/api/challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payoutId: _payoutId }),
    });
    const challenge = await response.json();
    setChallenges(challenge);
    setLoading(false);
  };

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.SOLANA,
            chainId: isMainnet ? "0x3" : "0x1",
            rpcTarget: isMainnet
              ? process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET ||
                "https://api.mainnet-beta.solana.com"
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
        ? process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET ||
          "https://api.mainnet-beta.solana.com"
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

  const createChallenge = async (house: boolean) => {
    await toast.promise(
      Promise.resolve(
        (async () => {
          try {
            setOpenCreateDialog(false);
            const response = await fetch(`/api/create`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ house: house, payoutId: payoutId }),
            });
            console.log("response", response);
            const res = await response.json();
            if (res?.error) throw res.error;
            setChallengeId(res);
            return;
          } catch (e) {
            if (e) toast.error(e?.toString());
            console.error(e);
            throw e;
          }
        })()
      ),
      {
        loading: "Creating challenge...",
        success: "Challenge created!",
        error: "Error creating challenge",
      }
    );
  };

  const challengeList = hideCompleted
    ? challenges.filter((challenges) => challenges.state === "CREATED")
    : challenges;

  return (
    <Box className=" bg">
      <Toaster />

      {displayConfetti && (
        <Confetti numberOfPieces={400} style={{ width: "100%" }} />
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
        />
        <span className="join-container">
          {!connection && (
            <>
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
                  on Solana Devnet
                </Typography>
              </Box>
            </>
          )}
          {provider && viewWallet && connection ? (
            <WalletSolana
              publicKey={wallet?.publicKey?.toString() || ""}
              provider={provider}
              isMainnet={isMainnet}
              connection={connection}
              changeNetwork={changeNetwork}
              logout={logout}
            />
          ) : provider && connection != null && payoutId === 0 ? (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant={"h5"}
                sx={{ mb: 2, display: "flex", justifyContent: "center" }}
              >
                Payouts
              </Typography>

              <Button
                onClick={() => {
                  setPayoutId(79);
                }}
                className="btn"
                variant="outlined"
                sx={{ mt: 1 }}
              >
                <Image
                  src={"/SOL.svg"}
                  alt="WSOL"
                  height={30}
                  width={30}
                  style={{ marginRight: "10px" }}
                />
                <Typography variant="subtitle2">
                  Entry Fee: 0.01 WSOL
                  <br />
                  Winning: 0.02 WSOL
                </Typography>
              </Button>

              <Button
                onClick={() => {
                  setPayoutId(80);
                }}
                className="btn"
                variant="outlined"
                sx={{ mt: 1 }}
              >
                <Image
                  src={"/SOL.svg"}
                  alt="WSOL"
                  height={30}
                  width={30}
                  style={{ marginRight: "10px" }}
                />
                <Typography variant="subtitle2">
                  Entry Fee: 0.05 WSOL
                  <br />
                  Winning: 0.1 WSOL
                </Typography>
              </Button>

              <Button
                onClick={() => {
                  setPayoutId(81);
                }}
                className="btn"
                variant="outlined"
                sx={{ mt: 1 }}
              >
                <Image
                  src={"/SOL.svg"}
                  alt="WSOL"
                  height={30}
                  width={30}
                  style={{ marginRight: "10px" }}
                />
                <Typography variant="subtitle2">
                  Entry Fee: 0.1 WSOL
                  <br />
                  Winning: 0.2 WSOL
                </Typography>
              </Button>

              {/* <Button
                onClick={() => setPayoutId(91)}
                className="btn"
                variant="outlined"
                sx={{ mt: 1 }}
                disabled
              >
                <Image
                  src={"/SOL.svg"}
                  alt="SOL"
                  height={25}
                  width={25}
                  style={{ marginRight: "10px" }}
                />
                SOL - 0.01
              </Button>

              <Button
                onClick={() => setPayoutId(88)}
                className="btn"
                variant="outlined"
                sx={{ mt: 1 }}
                disabled
              >
                <Image
                  src={"/USDC.png"}
                  alt="USDC"
                  height={25}
                  width={25}
                  style={{ marginRight: "10px" }}
                />
                USDC - $0.10
              </Button> */}
            </Box>
          ) : provider && connection != null && challengeId === 0 ? (
            <Box sx={{ width: "100%" }}>
              <Typography
                variant={"h5"}
                sx={{ mb: 2, display: "flex", justifyContent: "center" }}
              >
                Challenges
              </Typography>

              <Box sx={{ position: "relative" }}>
                <IconButton
                  size="small"
                  onClick={() => {
                    toast.success("Fetching challenges!");
                    getChallenges(payoutId);
                  }}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    background: "#374151",
                    border: "1px solid #6b727e",
                  }}
                >
                  <RefreshIcon />
                </IconButton>

                <Box
                  sx={{
                    mb: 1,
                    mt: 1,
                    border: "1px solid rgb(107, 114, 126)",
                    borderRadius: "5px",
                    fontSize: "14px",
                    overflow: "auto",
                    width: "100%",
                    height: "150px",
                  }}
                >
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : challengeList.length === 0 ? (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      No challenges
                    </div>
                  ) : (
                    challengeList?.map((challenge) => (
                      <Box
                        key={challenge?.id}
                        onClick={() => {
                          setChallengeId(challenge?.id);
                        }}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          borderBottom: "1px solid rgb(107, 114, 126)",
                          cursor: "pointer",
                          padding: "2px 10px",
                          "&:hover": {
                            backgroundColor: "#5d5d5d",
                          },
                        }}
                      >
                        <div>{challenge?.id}</div>
                        <div>{challenge?.state}</div>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>

              <FormGroup sx={{ display: "flex", justifyContent: "center" }}>
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Checkbox
                      checked={hideCompleted}
                      onClick={() => setHideCompleted(!hideCompleted)}
                    />
                  }
                  label="Only show open challenges"
                />
              </FormGroup>

              <Button
                onClick={() => setOpenCreateDialog(true)}
                className="btn"
                variant="contained"
                sx={{ mt: 2, backgroundColor: "#3eb718" }}
              >
                Create New Challenge
              </Button>

              <Button
                onClick={() => setPayoutId(0)}
                className="btn"
                variant="contained"
                sx={{ mt: 1 }}
              >
                Back
              </Button>
            </Box>
          ) : provider && connection != null ? (
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

      <FormCreateChallenge
        openCreateDialog={openCreateDialog}
        setOpenCreateDialog={setOpenCreateDialog}
        payoutId={payoutId}
        getChallenges={getChallenges}
        setChallengeId={setChallengeId}
        createChallenge={createChallenge}
      />
    </Box>
  );
}

export default App;
