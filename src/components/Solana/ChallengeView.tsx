/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Challenge } from "@ludex-labs/ludex-sdk-js";
//import { Wallet } from "@ludex-labs/ludex-sdk-js/web3/solana/utils";
import { Connection, Transaction } from "@solana/web3.js";
import { SolanaWallet } from "@web3auth/solana-provider";
import { SafeEventEmitterProvider } from "@web3auth/base";
import Lottie from "react-lottie";
import * as flip from "../flip.json";

// MUI
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export const ChallengeView: FC<{
  provider: SafeEventEmitterProvider | null;
  wallet?: any;
  isMainnet: boolean;
  connection: Connection;
  challengeId: number;
  setChallengeId: (challengeId: number) => void;
  setDisplayConfetti: (displayConfetti: boolean) => void;
}> = (props) => {
  const {
    provider,
    wallet,
    isMainnet,
    connection,
    challengeId,
    setChallengeId,
    setDisplayConfetti,
  } = props;
  const [joined, setJoined] = useState<boolean>(false);
  const [gameLoaded, setGameLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [challenge, setChallenge] = useState<any>(undefined);
  const [players, setPlayers] = useState<any>(undefined);

  useEffect(() => {
    getChallenge();
  }, []);

  const getChallenge = async () => {
    const response = await fetch(`/api/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId: challengeId,
      }),
    });
    const { challenge, players } = await response.json();
    setChallenge(challenge);
    setPlayers(players);
  };

  const joinFTChallenge = async () => {
    if (!wallet) return;
    try {
      const env = isMainnet ? "MAINNET" : "DEVNET";
      const ludexTx = new Challenge.ChallengeTXClient(
        connection,
        challenge?.blockchainAddress,
        {
          cluster: env,
        }
      );
      const tx = await ludexTx.join(wallet.publicKey.toBase58()).getTx();
      const result = connection.getLatestBlockhash();
      tx.recentBlockhash = (await result).blockhash;
      const res = await sendTransaction(tx);
      if (!res.toString().includes("Error")) {
        setJoined(true);
        toast.success("Challenge joined!");
        console.info("sig: ", res);
      }
    } catch (error) {
      console.error(error);
      if (error?.toString().includes("Invalid account discriminator")) {
        toast.error("Join failed... challenge details invalid");
      } else if (error?.toString().includes("Error")) {
        toast.error("Join challenge failed");
      }
    }
  };

  const leaveFTChallenge = async () => {
    if (!wallet) return;
    try {
      const env = isMainnet ? "MAINNET" : "DEVNET";
      const ludexTx = new Challenge.ChallengeTXClient(
        connection,
        challenge?.blockchainAddress,
        {
          cluster: env,
        }
      );
      const tx = await ludexTx.leave(wallet.publicKey.toBase58()).getTx();
      const result = connection.getLatestBlockhash();
      tx.recentBlockhash = (await result).blockhash;
      const res = await sendTransaction(tx);
      if (!res.toString().includes("Error")) {
        setJoined(false);
        toast.success("Challenge left!");
        console.info("sig: ", res);
      }
    } catch (error) {
      console.error(error);
      if (error?.toString().includes("Error")) {
        toast.error("Leave challenge failed");
      }
    }
  };

  const sendTransaction = async (tx: Transaction) => {
    if (!provider) return "";
    try {
      setIsLoading(true);
      const solanaWallet = new SolanaWallet(provider);
      tx = await solanaWallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(tx.serialize());
      return sig;
    } catch (error) {
      let errorString = (error as any)?.logs
        ? error + " --- LOGS --- " + ((error as any)?.logs).toString()
        : error?.toString();
      verifyError(errorString, tx);
      return errorString ? errorString : "";
    } finally {
      setIsLoading(false);
    }
  };

  const verifyError = (error: any, tx: Transaction) => {
    console.error(error);
    if (error?.includes("Blockhash not found")) {
      setTimeout(() => sendTransaction(tx), 2000);
    } else if (error?.includes("Error Code: ChallengeFull")) {
      toast.error("Challenge is already full.");
    } else if (error?.includes("already in use")) {
      toast.error("This address is already joined.");
      setJoined(true);
    } else if (error?.includes("no record of a prior credit")) {
      toast.error("You don't have enough credit.");
    } else if (error?.includes("User rejected the request")) {
      toast.error("Player rejected the request.");
    } else toast.error("Transaction failed.");
  };

  const startGame = async () => {
    setGameLoading(true);

    try {
      const response = await fetch(`/api/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge?.id,
        }),
      });
      console.log("response", response);

      const res = await response.json();
      getChallenge();
      setGameLoading(false);
      console.log("res", res);
      if (res?.status !== 200) throw new Error("Something went wrong...");
      if (res?.error) toast.error(res?.error?.toString());
      if (res?.winner && res?.winner === wallet?.publicKey?.toString()) {
        toast.success(`You won!`);
        setDisplayConfetti(true);
      } else if (res?.winner && res?.winner !== wallet?.publicKey?.toString())
        toast.success("You lost.");
    } catch (e) {
      setGameLoading(false);
      console.error(e);
      if (e) toast.error(e?.toString());
      throw e;
    }
  };

  const challengeReady =
    challenge?.state === "CREATED" || challenge?.state === "LOCKED";

  if (!challenge) return <div>Loading...</div>;

  return (
    <Box
      sx={{
        width: "300px",
        minWidth: "300px",
      }}
    >
      <Typography
        variant={"h5"}
        sx={{ mb: 2, display: "flex", justifyContent: "center" }}
      >
        Challenge {challengeId.toString()}
      </Typography>

      <Box sx={{ position: "relative" }}>
        <IconButton
          size="small"
          onClick={() => {
            toast.success("Fetching challenge!");
            getChallenge();
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
            pb: 1,
            mb: 1,
            border: "1px solid rgb(107, 114, 126)",
            borderRadius: "6px",
            padding: 1.5,
            fontSize: "14px",
            overflow: "auto",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>State</span>
            <span>{challenge?.state}</span>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Address</span>
            <a
              target="_blank"
              rel="noreferrer"
              href={
                "https://solscan.io/account/" +
                challenge?.blockchainAddress +
                "?cluster=devnet"
              }
            >
              {challenge?.blockchainAddress?.substring(0, 15)}...
            </a>
          </Box>
          {players?.length > 0 && (
            <>
              <Divider sx={{ mt: 1, mb: 1 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <span>
                  Players ({players?.length}/{challenge?.limit})
                </span>

                {players.map((player: any) => {
                  return (
                    <a
                      key={player?.walletAddress}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        "https://solscan.io/account/" +
                        player?.walletAddress +
                        "?cluster=devnet"
                      }
                    >
                      {player?.walletAddress?.substring(0, 25)}...
                    </a>
                  );
                })}
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          className="btn"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading || joined}
          sx={{
            backgroundColor: "#3eb718",
            mt: 1,
          }}
          onClick={() => joinFTChallenge()}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : joined ? (
            <>
              <CheckCircleOutlineIcon sx={{ mr: 1 }} />
              Joined
            </>
          ) : (
            "Join"
          )}
        </Button>
        {joined && (
          <Button
            className="btn"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              backgroundColor: "#3eb718",
              mt: 1,
            }}
            onClick={() => leaveFTChallenge()}
          >
            Leave
          </Button>
        )}

        <Button
          className="btn"
          fullWidth
          variant="contained"
          size="large"
          disabled={
            isLoading ||
            players?.length !== 2 ||
            !challengeReady ||
            players.includes(wallet.publicKey.toBase58())
          }
          sx={{
            backgroundColor: "#3eb718",
            mt: 1,
          }}
          onClick={() => startGame()}
        >
          Start Game
        </Button>

        <Button
          className="btn"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{
            mt: 1,
          }}
          onClick={() => {
            setChallengeId(0);
            setDisplayConfetti(false);
          }}
        >
          Back
        </Button>
      </Box>

      <Dialog open={gameLoaded} className="invisible">
        <DialogContent>
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: flip,
              rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
              },
            }}
            height={400}
            width={400}
            isStopped={!gameLoaded}
            isPaused={!gameLoaded}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
