/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
// import { Challenge } from "@ludex-labs/ludex-sdk-js";
//import { Wallet } from "@ludex-labs/ludex-sdk-js/web3/solana/utils";
import { Connection, Transaction } from "@solana/web3.js";
import { SolanaWallet } from "@web3auth/solana-provider";
import { SafeEventEmitterProvider } from "@web3auth/base";
import Lottie from "react-lottie";
import * as flip from "./animations/flip.json";

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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
  const [gameLoaded, setGameLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [challenge, setChallenge] = useState<any>(undefined);
  const [players, setPlayers] = useState<any>(undefined);

  useEffect(() => {
    getChallenge(challengeId);
  }, []);

  const getChallenge = async (challengeId: number) => {
    const response = await fetch(`/api/getChallenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId: challengeId,
      }),
    });
    const challenge = await response.json();
    setChallenge(challenge);
    setPlayers(challenge?.players);
  };

  const joinFTChallenge = async (leave: boolean) => {
    try {
      var url = "/api/join";
      if (leave) url = "/api/leave";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challengeId,
          playerPubkey: wallet.publicKey.toBase58(),
        }),
      });
      const res = await response.json();
      if (res?.code >= 300) throw res;
      const tx = Transaction.from(Buffer.from(res?.transaction, "base64"));
      const sig = await sendTransaction(tx);
      if (!sig.toString().includes("Error")) {
        if (leave) toast.success("Challenge left!");
        else toast.success("Challenge joined!");
        console.info("sig: ", sig);
      }
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(error.message);
      else toast.error(JSON.stringify(error));
      console.error(error);
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
    } else if (error?.includes("no record of a prior credit")) {
      toast.error("You don't have enough credit.");
    } else if (error?.includes("User rejected the request")) {
      toast.error("Player rejected the request.");
    } else toast.error("Transaction failed.");
  };

  const startGame = async () => {
    setGameLoading(true);

    try {
      const response = await fetch(`/api/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge?.id,
        }),
      });
      const res = await response.json();
      getChallenge(challengeId);
      if (res?.code >= 300) throw res;
      if (res?.winner && res?.winner === wallet?.publicKey?.toString()) {
        toast.success(`You won!`);
        setDisplayConfetti(true);
      } else if (res?.winner && res?.winner !== wallet?.publicKey?.toString())
        toast.success("You lost.");
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(error.message);
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setGameLoading(false);
    }
  };

  const cancelGame = async () => {
    try {
      const response = await fetch(`/api/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge?.id }),
      });
      const res = await response.json();
      if (res?.code >= 300) throw res;
      else setChallengeId(res?.id);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(error.message);
      else toast.error(JSON.stringify(error));
      console.error(error);
    }
  };

  const challengeReady =
    challenge?.state === "CREATED" || challenge?.state === "LOCKED";

  const challengeCancelled =
    challenge?.state === "CANCELED" || challenge?.state === "CANCELING";

  if (!challenge) {
    return <CircularProgress />;
  }

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
        Challenge {challengeId?.toString()}
      </Typography>

      <Box sx={{ position: "relative" }}>
        <IconButton
          size="small"
          onClick={() => {
            setChallengeId(0);
            setDisplayConfetti(false);
          }}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            position: "absolute",
            top: "-20px",
            left: "-20px",
            background: "#374151",
            border: "1px solid #6b727e",
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => {
            toast.success("Fetching challenge!");
            getChallenge(challengeId);
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
                challenge?.payout?.chain === "SOLANA"
                  ? "https://solscan.io/account/" +
                    challenge?.blockchainAddress +
                    "?cluster=devnet"
                  : challenge?.payout?.chain === "AVALANCHE"
                  ? "'https://testnet.snowtrace.io/'" +
                    challenge?.blockchainAddress
                  : ""
              }
            >
              {challenge?.blockchainAddress?.substring(0, 15)}...
            </a>
          </Box>
          <Divider sx={{ mt: 1, mb: 1 }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Chain</span>
            <span>{challenge?.payout?.chain}</span>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Entry Fee</span>
            <span>{challenge?.payout?.uiValues?.entryFee}</span>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Mediator Rake</span>
            <span>{challenge?.payout?.uiValues?.mediatorRake}</span>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Provider Rake</span>
            <span>{challenge?.payout?.uiValues?.providerRake}</span>
          </Box>

          <Divider sx={{ mt: 1, mb: 1 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Box sx={{ mb: 1 }}>
              Players ({players?.length}/{challenge?.limit})
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Button
                onClick={() => joinFTChallenge(false)}
                fullWidth
                disabled={isLoading}
                sx={
                  players?.length > 0
                    ? {
                        textAlign: "center",
                        width: "100%",
                        border: "3px solid #fff",
                        mb: 1,
                      }
                    : {
                        textAlign: "center",
                        width: "100%",
                        border: "3px dotted #fff",
                        mb: 1,
                      }
                }
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : players?.length > 0 ? (
                  players[0]?.substring(0, 25) + "..."
                ) : (
                  "Join"
                )}
              </Button>
              <Box
                sx={{
                  textAlign: "center",
                  width: "100%",
                  mb: 1,
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                VS
              </Box>

              <Button
                onClick={() => joinFTChallenge(false)}
                fullWidth
                sx={
                  players.length > 1
                    ? {
                        textAlign: "center",
                        width: "100%",
                        border: "3px solid #fff",
                        mb: 1,
                      }
                    : {
                        textAlign: "center",
                        width: "100%",
                        border: "3px dotted #fff",
                        mb: 1,
                      }
                }
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : players.length > 1 ? (
                  players[1]?.substring(0, 25) + "..."
                ) : (
                  "Join"
                )}
              </Button>
            </Box>
          </Box>
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
          // disabled={
          //   isLoading ||
          //   // players?.length !== 2 ||
          //   !challengeReady ||
          //   players.includes(wallet.publicKey.toBase58())
          // }
          sx={{
            backgroundColor: "#3eb718",
            mt: 1,
          }}
          onClick={() => startGame()}
        >
          Start
        </Button>

        <Button
          className="btn"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading || challengeCancelled}
          sx={{
            backgroundColor: "#f45252",
            mt: 1,
          }}
          onClick={() => cancelGame()}
        >
          Cancel
        </Button>

        <Button
          onClick={() => joinFTChallenge(true)}
          className="btn"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading || !players.includes(wallet.publicKey.toBase58())}
          sx={{
            mt: 1,
          }}
        >
          Leave
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
