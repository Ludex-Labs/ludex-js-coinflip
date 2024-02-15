import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Transaction } from "@solana/web3.js";
import Lottie from "react-lottie";
import * as flipAnimation from "./animations/animation.json";
import Image from "next/image";
import { useWeb3Auth } from "../services/web3auth";
import { Chain, parseTransaction } from "@ludex-labs/ludex-sdk-js";

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
  challengeId: number;
  setChallengeId: (challengeId: number) => void;
}> = (props) => {
  const { challengeId, setChallengeId } = props;

  const { getAccounts, signAndSendTransaction, chain } = useWeb3Auth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playAnimation, setPlayAnimation] = useState<boolean>(false);
  const [animationPlayed, setAnimationPlayed] = useState<boolean>(false);
  const [challenge, setChallenge] = useState<any>(undefined);
  const [account, setAccount] = useState<string>("");

  const getAccount = async () => {
    const accounts = await getAccounts();
    if (accounts && accounts.length > 0) setAccount(accounts[0]);
  };

  useEffect(() => {
    getAccount();
    getChallenge(challengeId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GET the challenge every 5 seconds
  useEffect(() => {
    const fetchChallenge = () => {
      getChallenge(challengeId, false);
    };

    fetchChallenge();
    const intervalId = setInterval(fetchChallenge, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, [challengeId]);

  const getChallenge = async (challengeId: number, force: boolean) => {
    var _force = false;
    if (force) _force = true;
    const response = await fetch(
      `/api/challenge?id=${challengeId}&force=${_force}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: undefined,
      }
    );

    if (response.status === 204) return;
    else if (response.status >= 300) {
      toast.error("Error fetching challenge");
      return;
    } else {
      const challenge = await response.json();
      console.info("challenge", challenge);
      setChallenge(challenge);
      if (challenge?.state?.includes("ING")) setIsLoading(true);
      else setIsLoading(false);
    }
  };

  const displayAnimation = async (winnerAddress: string) => {
    setAnimationPlayed(true);
    setPlayAnimation(true);
    setTimeout(() => {
      setPlayAnimation(false);
      if (winnerAddress === account) {
        toast.success(`You won!`);
      } else
        toast.success("Player " + winnerAddress.substring(0, 10) + " won!");
    }, 3000);
  };

  // GET the challenge every 5 seconds
  useEffect(() => {
    if (challenge && challenge?.winnings?.length > 0 && !animationPlayed) {
      const winnerAddress = challenge?.winnings.find((winning: any) => {
        return winning.amount !== "0";
      })?.to;
      if (winnerAddress) displayAnimation(winnerAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge]);

  const joinChallenge = async (leave: boolean) => {
    setIsLoading(true);

    try {
      var url = "/api/join";
      if (leave) url = "/api/leave";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challengeId,
          playerPubkey: account,
        }),
      });
      const res = await response.json();
      if (res?.code >= 300 || response?.status >= 300) throw res;
      if (chain === "SOLANA") await sendSOLtx(res?.transaction, leave);
      else if (chain === "AVALANCHE"|| 'AVALANCHE_MAINNET') await sendAVAXtx(res?.transaction);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(JSON.stringify(error.message));
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinChallengeWithHouse = async () => {
    setIsLoading(true);

    try {
      var url = "/api/joinWithHouse";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challengeId,
        }),
      });
      const res = await response.json();
      if (res?.code >= 300 || response?.status >= 300) throw res;
      if (chain === "SOLANA") await sendSOLtx(res?.transaction, false);
      else if (chain === "AVALANCHE") await sendAVAXtx(res?.transaction);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(JSON.stringify(error.message));
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendAVAXtx = async (tx: string) => {
    // const transactions = await parseTransaction(tx, Chain.AVALANCHE);
    // const decodedTx = Buffer.from(tx, "base64").toString("utf-8");
    // const transactions = JSON.parse(decodedTx);
    // for (const transaction of transactions as Object[]) {
    //   const res = await signAndSendTransaction(transaction);
    //   console.log("res: ", res);
    // }

    const transaction = await parseTransaction(tx, Chain.AVALANCHE);
    const res = await signAndSendTransaction(transaction);
    console.log("res: ", res);

  };

  const sendSOLtx = async (tx: String, leave: boolean) => {
    const decodedTx = await parseTransaction(tx, Chain.SOLANA );
    const transaction = Transaction.from(decodedTx as Buffer);
    const sig = await signAndSendTransaction(transaction);
    if (sig && leave) toast.success("Challenge left!");
    else if (sig) toast.success("Challenge joined!");
  };

  const startGame = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge?.id,
        }),
      });
      const res = await response.json();
      if (res?.code >= 300) throw res;
      displayAnimation(res?.winnerAddress);
      getChallenge(challengeId, true);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(error.message);
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge?.id }),
      });
      const res = await response.json();
      if (res?.code >= 300) throw res;
      getChallenge(challengeId, true);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(error.message);
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!challenge) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const { players, payout, blockchainAddress, limit, state } = challenge;

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Typography
        variant={"h5"}
        sx={{ mb: 2, display: "flex", justifyContent: "center" }}
      >
        Challenge {challengeId}
      </Typography>

      <Box sx={{ position: "relative" }}>
        <IconButton
          size="small"
          onClick={() => {
            setChallengeId(0);
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
            toast.success("Refetching challenge!");
            getChallenge(challengeId, true);
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
            <span>{state}</span>
          </Box>

          {chain === "SOLANA" && (
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
                  payout?.chain === "SOLANA"
                    ? "https://solscan.io/account/" +
                      blockchainAddress +
                      "?cluster=devnet"
                    : payout?.chain === "AVALANCHE"
                    ? "'https://testnet.snowtrace.io/'" + blockchainAddress
                    : ""
                }
              >
                {blockchainAddress?.substring(0, 15)}...
              </a>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Chain</span>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Image
                alt="SOL"
                src={
                  payout?.chain === "SOLANA"
                    ? "/SOL.svg"
                    : payout?.chain === "AVALANCHE"
                    ? "/AVAX.svg"
                    : ""
                }
                width={18}
                height={18}
                style={{
                  marginRight: "7px",
                }}
              />
              {payout?.chain}
            </Box>
          </Box>

          <Divider sx={{ mt: 1, mb: 1 }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Payout ID</span>
            <span>{payout?.id}</span>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Entry Fee</span>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {payout?.uiValues?.entryFee} {payout?.mint?.ticker}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Total Rake</span>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {parseFloat(payout?.uiValues?.providerRake) +
                parseFloat(payout?.uiValues?.mediatorRake)}{" "}
              {payout?.mint?.ticker}
            </Box>
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
              Players ({players?.length}/{limit})
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Button
                onClick={() => joinChallenge(false)}
                fullWidth
                disabled={isLoading || state !== "CREATED"}
                sx={
                  players?.length > 0
                    ? {
                        textAlign: "center",
                        width: "100%",
                        border: "3px solid #fff",
                        mb: 1,
                      }
                    : isLoading || state !== "CREATED"
                    ? {
                        textAlign: "center",
                        width: "100%",
                        border: "3px dotted #fff",
                        mb: 1,
                        opacity: 0.5,
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
                onClick={() => joinChallenge(false)}
                fullWidth
                disabled={isLoading || state !== "CREATED"}
                sx={
                  players?.length > 1
                    ? {
                        textAlign: "center",
                        width: "100%",
                        border: "3px solid #fff",
                        mb: 1,
                      }
                    : isLoading || state !== "CREATED"
                    ? {
                        textAlign: "center",
                        width: "100%",
                        border: "3px dotted #fff",
                        mb: 1,
                        opacity: 0.5,
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
                ) : players?.length > 1 ? (
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
          disabled={isLoading || (state !== "CREATED" && state !== "LOCKED")}
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
          disabled={isLoading || (state !== "CREATED" && state !== "LOCKED")}
          sx={{
            backgroundColor: "#f45252",
            mt: 1,
          }}
          onClick={() => cancelGame()}
        >
          Cancel
        </Button>

        {chain === "SOLANA" && (
          <Button
            className="btn"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || (state !== "CREATED" && state !== "LOCKED")}
            sx={{
              mt: 1,
            }}
            onClick={() => joinChallengeWithHouse()}
          >
            Play Against House
          </Button>
        )}

        {players?.includes(account) && (
          <Button
            onClick={() => joinChallenge(true)}
            className="btn"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || state !== "CREATED"}
            sx={{
              mt: 1,
            }}
          >
            Leave
          </Button>
        )}
      </Box>

      <Dialog
        open={playAnimation}
        className="invisible"
        sx={{
          margin: 0,
        }}
      >
        <DialogContent
          sx={{
            margin: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Lottie
              options={{
                loop: false,
                autoplay: true,
                animationData: flipAnimation,
                rendererSettings: {
                  preserveAspectRatio: "xMidYMid slice",
                },
              }}
              height={400}
              width={400}
              isStopped={!playAnimation}
              isPaused={!playAnimation}
            />
            <Button onClick={() => setPlayAnimation(false)}>Close</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
