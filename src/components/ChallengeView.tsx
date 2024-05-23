import { FC, forwardRef, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Transaction } from "@solana/web3.js";
import Lottie from "react-lottie";
import * as flipAnimation from "./animations/animation.json";
import Image from "next/image";
import * as coin from "../components/animations/coin.json";
import { useWeb3Auth } from "../services/web3auth";


import { Metaplex, guestIdentity, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

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
  DialogTitle,
  DialogContentText,
  DialogActions,
  Slide,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AddCircleOutlined, LockOutlined } from "@mui/icons-material";
import { TransitionProps } from '@mui/material/transitions';
import SwapHorizontalCircleIcon from '@mui/icons-material/SwapHorizontalCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const mx = Metaplex.make(connection).use(guestIdentity());

export const ChallengeView: FC<{
  challengeId: number;
  setChallengeId: (challengeId: number) => void;
  challengeType: string;
}> = (props) => {

  const { challengeId, setChallengeId, challengeType } = props;
  const { getAccounts, signAndSendTransaction, chain } = useWeb3Auth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playAnimation, setPlayAnimation] = useState<boolean>(false);
  const [animationPlayed, setAnimationPlayed] = useState<boolean>(false);
  const [challenge, setChallenge] = useState<any>(undefined);
  const [account, setAccount] = useState<string>("");
  // Offerings Dialog
  const [open, setOpen] = useState(false);
  const [OfferingType, setOfferingType] = useState<string>('NFT');
  const [NFTAddress, setNFTAddress] = useState<string>('');
  const [solAmount, setSolAmount] = useState<string>('');

  const [offerings, setOfferings] = useState<any[]>([]);
  const [playerStatus, setPlayerStatus] = useState();
  const [playerStatuses, setPlayerStatuses] = useState<any[]>([]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getAccount = async () => {
    const accounts = await getAccounts();
    if (accounts && accounts.length > 0) setAccount(accounts[0]);
  };

  const getNFTChallenge = async () => {

    const response = await fetch(
      `/api/nft/getNFTChallenge`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challengeId,
          playerPubkey: account,
          amount: parseFloat(solAmount),
        }),
      }
    );

    if (response.status === 204) return;

    else if (response.status >= 300) {
      toast.error("Error fetching challenge");
      return;
    }

    else {
      const NFTChallenge = await response.json();
      console.info("NFTChallenge", NFTChallenge);
      setChallenge(NFTChallenge);
    }
  };

  // Get the Challenge & NFT Challenge on load
  useEffect(() => {
    if (challengeType === 'NFT') {
      getNFTChallenge();
    }
    else {
      getChallenge(challengeId, true);
    }
  }, []);

  // Get the account on load
  useEffect(() => {
    getAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // getPlayerStatuses if challenge type is NFT
  useEffect(() => {

    const getPlayerStatuses = async () => {

      let _playerStatuses: any = [];

      players.map(async (player: any) => {
        try {
          var url = "/api/nft/playerStatus";
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              challengeId: challengeId,
              playerPubkey: player,
            }),
          });
          const res = await response.json();
          if (res?.code >= 300 || response?.status >= 300) throw res;

          _playerStatuses.push({
            player: player,
            status: res
          });

        } catch (error) {
          // @ts-ignore
          if (error?.message) toast.error(JSON.stringify(error.message));
          else toast.error(JSON.stringify(error));
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      });

      setPlayerStatuses(_playerStatuses);
    };

    if (account && challenge && challenge.payout.type === 'NFT') {
      getPlayerStatuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, challenge]);

  // Gets account player status and offerings
  useEffect(() => {

    const getPlayerStatus = async () => {
      try {
        var url = "/api/nft/playerStatus";
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
        console.log('-----------------> <---------------------', res)
        setPlayerStatus(res);
      } catch (error) {
        // @ts-ignore
        if (error?.message) toast.error(JSON.stringify(error.message));
        else toast.error(JSON.stringify(error));
        console.error(error);
      } finally {
        setIsLoading(false);
      }

    }
    if (account && challenge && challenge.payout.type === 'NFT') {
      getPlayerStatus();
      getOfferings();
    }
  }, [account, challenge]);

  // Displays the animation if the challenge is resolved
  useEffect(() => {
    if (challenge && challenge?.winnings?.length > 0 && !animationPlayed) {
      const winnerAddress = challenge?.winnings.find((winning: any) => {
        return winning.amount !== "0";
      })?.to;
      if (winnerAddress) displayAnimation(winnerAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge]);


  // GET the challenge every 5 seconds
  // useEffect(() => {

  //   const fetchChallenge = () => {
  //     getChallenge(challengeId, false);
  //   };

  //   fetchChallenge();
  //   const intervalId = setInterval(fetchChallenge, 5000);
  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [challengeId]);

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

  const joinChallenge = async () => {
    setIsLoading(true);
    // FT AND NATIVE Challenges
    if (challengeType !== 'NFT') {
      try {
        var url = "/api/join";
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
        if (chain === "SOLANA") await sendSOLtx(res?.transaction, "JOIN");
        else if (chain === "AVALANCHE" || 'AVALANCHE_MAINNET') await sendAVAXtx(res?.transaction);
      } catch (error) {
        // @ts-ignore
        if (error?.message) toast.error(JSON.stringify(error.message));
        else toast.error(JSON.stringify(error));
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    // NFT Challenge
    else {
      try {
        var url = "/api/nft/join";
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
        if (chain === "SOLANA") await sendSOLtx(res?.transaction, "JOIN");
        else if (chain === "AVALANCHE" || 'AVALANCHE_MAINNET') await sendAVAXtx(res?.transaction);
      } catch (error) {
        // @ts-ignore
        if (error?.message) toast.error(JSON.stringify(error.message));
        else toast.error(JSON.stringify(error));
        console.error(error);
      } finally {
        setIsLoading(false);
      }

    }
  };

  const leaveChallenge = async () => {
    try {
      var url = "/api/leave";
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
      if (chain === "SOLANA") await sendSOLtx(res?.transaction, "LEAVE");
      else if (chain === "AVALANCHE" || 'AVALANCHE_MAINNET') await sendAVAXtx(res?.transaction);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(JSON.stringify(error.message));
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setIsLoading(false);
    }

  }

  const addNFTOfferings = async () => {
    try {
      var url = "/api/nft/addNFT";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challengeId,
          playerPubkey: account,
          tokenMintAddress: NFTAddress,
          amount: 1, // NFTs are always 1
        }),
      });
      const res = await response.json();
      if (res?.code >= 300 || response?.status >= 300) throw res;
      if (chain === "SOLANA") await sendSOLtx(res?.transaction, "ADD_NFT");
      else if (chain === "AVALANCHE" || 'AVALANCHE_MAINNET') await sendAVAXtx(res?.transaction);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(JSON.stringify(error.message));
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const removeOffering = async (offeringPubkey: string) => {
    try {
      var url = "/api/nft/removeOffering";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challengeId,
          playerPubkey: account,
          offeringPubkey: offeringPubkey,
        }),
      });
      const res = await response.json();
      if (res?.code >= 300 || response?.status >= 300) throw res;
      if (chain === "SOLANA") await sendSOLtx(res?.transaction, "REMOVE_NFT");
      else if (chain === "AVALANCHE" || 'AVALANCHE_MAINNET') await sendAVAXtx(res?.transaction);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(JSON.stringify(error.message));
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const addSOLOfferings = async () => {
    try {
      var url = "/api/nft/addSOL";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challengeId,
          playerPubkey: account,
          amount: parseFloat(solAmount),
        }),
      });
      const res = await response.json();
      if (res?.code >= 300 || response?.status >= 300) throw res;
      if (chain === "SOLANA") await sendSOLtx(res?.transaction, "ADD_SOL");
      else if (chain === "AVALANCHE" || 'AVALANCHE_MAINNET') await sendAVAXtx(res?.transaction);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(JSON.stringify(error.message));
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const getOfferings = async () => {
    try {
      var url = "/api/nft/getOfferings";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challengeId,
        }),
      });
      const res = await response.json();
      console.log("refetched offerings", res);
      if (res?.code >= 300 || response?.status >= 300) throw res;
      // Adds metadata to the offerings
      setOfferings(res);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(JSON.stringify(error.message));
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const acceptOffering = async () => {
    try {
      var url = "/api/nft/acceptOffering";
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
      console.log(res.transaction, 'acceptOffering');

      if (chain === "SOLANA") await sendSOLtx(res?.transaction, "ACCEPT_OFFERING");
      else if (chain === "AVALANCHE" || 'AVALANCHE_MAINNET') await sendAVAXtx(res?.transaction);

    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(JSON.stringify(error.message));
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

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
      if (chain === "SOLANA") await sendSOLtx(res?.transaction, "JOIN");
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
    const decodedTx = Buffer.from(tx, "base64").toString("utf-8");
    const transactions = JSON.parse(decodedTx);
    if (transactions[0].gasLimit.type === 'BigNumber') {
      const hex = transactions[0].gasLimit.hex.slice(2);
      const numberValue = parseInt(hex, 16);
      transactions[0].gasLimit = numberValue
    }
    for (const transaction of transactions) {
      const res = await signAndSendTransaction(transaction);
      console.log("res: ", res);
    }
  };

  const sendSOLtx = async (tx: string, action: string) => {
    const transaction = Transaction.from(Buffer.from(tx, "base64"));
    const sig = await signAndSendTransaction(transaction);

    if (sig && action == "LEAVE") toast.success("Challenge left!");
    else if (sig && action == "JOIN") toast.success("Challenge joined!");
    else if (sig && action == "ADD_NFT") toast.success("NFT added!");
    else if (sig && action == "REMOVE_NFT") toast.success("NFT removed!");
    else if (sig && action == "ADD_SOL") toast.success("SOL added!");
    else if (sig && action == "ACCEPT_OFFERING") toast.success("Offering locked!");
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
      // Always get non NFT challenge after starting the game
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

  const resolveNFT = async () => {
    setIsLoading(true);
    try {
      // Prepare payout object
      let _payout: any = [
      ];

      // Swap the offerings
      offerings.map((offering) => {
        if (offering.authority == challenge?.players[1]) {
          _payout.push({ to: challenge?.players[0], offering: offering.publicKey });
        }
        else if (offering.authority == challenge?.players[0]) {
          _payout.push({ to: challenge?.players[1], offering: offering.publicKey });
        }
      });

      // Pass In offering.publicKey 
      const response = await fetch(`/api/nft/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge?.id,
          payout: _payout
        }),
      });
      const res = await response.json();
      if (res?.code >= 300) throw res;
      if (challengeType === 'NFT') {
        getNFTChallenge();
      }
      else {
        getChallenge(challengeId, true);
      }
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(error.message);
      else toast.error(JSON.stringify(error));
      console.error(error);
    } finally {
      setIsLoading(false);
    }

  }

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
      // Always get non NFT challenge after cancelGame
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

  const cancelNFT = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/nft/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge?.id }),
      });
      const res = await response.json();
      if (res?.code >= 300) throw res;
      // Always get NFT challenge after cancelNFT
      getNFTChallenge();
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

  const { players, payout, blockchainAddress, state } = challenge;

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {challengeType !== 'NFT' && (
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
            // position: "absolute",
            // top: 0,
            // bottom: 0,
            // left: 0,
            // right: 0,
            zIndex: 1,
          }}
        />
      )}


      <Typography
        id="challenge-heading"
        variant={"h5"}
        sx={{ mb: 2, display: "flex", justifyContent: "center" }}
      >
        Challenge <span style={{ marginLeft: "10px" }} id='challengeId'>{challengeId}</span>
      </Typography>

      <Box sx={{ position: "relative" }}>
        {/* Add loading spinner  */}
        {challenge.state.includes("ING") && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {/* Icons Go back and refetch Challenge*/}
        <>
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
              if (challengeType === 'NFT') {
                getNFTChallenge();
                getOfferings();
              }
              else {
                getChallenge(challengeId, true);
              }
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
        </>

        <Box
          sx={{
            border: "1px solid rgb(107, 114, 126)",
            borderRadius: "6px",
            padding: 1.5,
            fontSize: "14px",
            overflow: "auto",
            width: "100%",
          }}
        >
          {/* State */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>State</span>
            <span id="challenge-state">{state}</span>
          </Box>
          {/* Address */}
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
          {/* Chain */}
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
          {/* Challenge Type */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Type</span>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {payout?.type}
            </Box>
          </Box>
          {/* PayoutID */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Payout ID</span>
            <span>{payout?.id}</span>
          </Box>

          <Divider sx={{ mt: 1, mb: 1 }} />

          {/* Entry Fee */}
          {payout.type !== 'NFT' && (
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

          )}

          {/* Provider + Mediator Rakes in FT and Native */}
          {payout.type !== 'NFT' && (
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

          )}

          {/* TODO: Enure Provider + Mediator Fee is returned in getChallenge  */}
          {payout.type == 'NFT' && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Total Fee</span>
                {payout.chain == 'SOLANA' && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    {challengeType === 'NFT' && (
                      <>
                        {parseFloat(payout?.uiValues.mediatorFee) + parseFloat(payout?.uiValues.providerFee)}
                        {" "}
                        {"SOL"}
                      </>
                    )}

                    {challengeType !== 'NFT' && (
                      <>
                        {parseFloat(payout?.uiValues.providerRake) + parseFloat(payout?.uiValues.mediatorRake)}
                        {" "}
                        {"SOL"}
                      </>
                    )}

                  </Box>
                )}
              </Box>
              <Divider sx={{ mt: 1, mb: 1 }} />
            </>
          )}

          {/* Players */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Box sx={{ mb: 1 }}>
              Players ({players?.length}/{challenge.payout.limit})
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Button
                onClick={() => joinChallenge()}
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
                {players.length > 0 ? (
                  players[0].substring(0, 25) + "..."
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
                onClick={() => joinChallenge()}
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
                {players.length > 1 ? (
                  players[1].substring(0, 25) + "..."
                ) : (
                  "Join"
                )}
              </Button>
            </Box>
          </Box>

          {/* Offerings Table */}
          {payout.type == 'NFT' && (
            <>
              <Divider sx={{ mt: 1, mb: 2 }} />

              <Box sx={{ display: "flex", alignItems: "self-start" }}>

                <Box sx={{
                  display: "grid",
                  mx: 1,
                  minWidth: "200px",
                  minHeight: "200px",
                  maxHeight: "200px",

                }}>

                  <Box
                    sx={{
                      display: "grid",
                      border: `${account == players[0] ? '1px solid orange' : '1px solid rgb(107, 114, 126)'}`,
                      borderRadius: "6px",
                      padding: 1.5,
                      fontSize: "14px",
                      width: "100%",
                      opacity: `${account == players[0] ? '1' : '0.6'}`,
                      background: `${account == players[0] ? 'tranparent' : offerings.includes((offering: any) => offering.player == players[0]) ? "transparent" : "grey"}`,
                      overflowY: "auto",
                      minHeight: "200px",
                      maxHeight: "200px",
                      '&::-webkit-scrollbar': {
                        width: '10px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'orange',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#888',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#555',
                      },
                    }}
                  >
                    {state == "CREATED" && offerings.filter((offering) => offering.authority == players[0]).length == 0 && (
                      <Box key={account} onClick={() => {
                        if (account == players[0])
                          handleClickOpen();
                      }} sx={{ justifySelf: "center", alignSelf: "center", cursor: "pointer" }}>
                        <Typography>{account == players[0] ? "Add an NFT/SOL" : ""}</Typography>
                      </Box>
                    )}

                    {offerings.map((offering) => {
                      // Prevents rendering player 1's offerings on player 0's offering section
                      if (offering?.authority !== players[0]) return;
                      if (offering.mint) {
                        return (
                          <>
                            <NFTOffering key={offering.mint} offering={offering} removeOffering={removeOffering} playerStatus={playerStatus} />
                            <Divider sx={{ mt: 1, mb: 1, color: "orange" }} />
                          </>
                        )
                      }
                      else {
                        return (
                          <SolOffering key={offering.mint} offering={offering} removeOffering={removeOffering} playerStatus={playerStatus} />)
                      }
                    })}
                  </Box>

                </Box>

                <Box sx={{ justifySelf: "center", alignSelf: "center", display: "grid" }}>
                  <>
                    <Tooltip title="Swap" arrow>
                      <Box>
                        <IconButton
                          disabled={isLoading || challenge.state !== "CREATED" || challenge.players.length < 2 || offerings.length < 2 || playerStatuses.some((player) => player.status != "ACCEPTED")}
                          size="small"
                          onClick={() => {
                            resolveNFT();
                            // toast.success("Refetching challenge!");

                          }}
                          sx={{
                            justifySelf: "center",
                            alignSelf: "center",
                            background: "#374151",
                            border: "1px solid #6b727e",
                          }}
                        >
                          <SwapHorizontalCircleIcon />
                        </IconButton>
                      </Box>
                    </Tooltip>


                    {/* Add Offerings Button */}
                    <Tooltip title="Add an NFT" arrow>
                      <Box sx={{ justifySelf: "center", alignSelf: "center", my: 2 }} >
                        <IconButton
                          size="small"
                          disabled={(!players.includes(account) || playerStatus != "JOINED") || playerStatus == "ACCEPTED" || state !== "CREATED"}
                          onClick={() => {
                            handleClickOpen();
                          }}
                          sx={{
                            justifySelf: "center",
                            alignSelf: "center",
                            background: "#374151",
                            border: "1px solid #6b727e",
                          }}
                        >
                          <AddCircleOutlined />
                        </IconButton>
                      </Box>
                    </Tooltip>

                    {/* Lock(ACCEPT) Offering Button */}
                    <Box sx={{ justifySelf: "center", alignSelf: "center", display: "flex" }}>
                      <Tooltip title="Lock" arrow>
                        <IconButton
                          size="small"
                          disabled={!players.includes(account) || !offerings.some(offering => offering.authority === account) || playerStatuses.length < 0 || playerStatuses.some((player) => player.player == account && player.status != "JOINED") || state !== "CREATED" || playerStatus == "ACCEPTED"}
                          onClick={() => {
                            acceptOffering();
                          }}
                          sx={{
                            justifySelf: "center",
                            alignSelf: "center",
                            border: "1px solid #6b727e",
                            background: "#374151",
                          }}
                        >
                          <LockOutlined />
                        </IconButton>

                      </Tooltip>
                    </Box>
                  </>
                </Box>

                <Box sx={{
                  display: "grid",
                  mx: 1,
                  minWidth: "200px",
                }}>

                  <Box
                    sx={{
                      display: "grid",
                      border: `${account == players[1] ? '1px solid orange' : '1px solid rgb(107, 114, 126)'}`,
                      borderRadius: "6px",
                      padding: 1.5,
                      fontSize: "14px",
                      width: "100%",
                      opacity: `${account == players[1] ? '1' : '0.6'}`,
                      background: `${account == players[1] ? 'tranparent' : offerings.includes((offering: any) => offering.player == players[1]) ? "transparent" : "grey"}`,
                      overflowY: "auto",
                      minHeight: "200px",
                      maxHeight: "200px",
                      '&::-webkit-scrollbar': {
                        width: '10px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'orange',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#888',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#555',
                      },

                    }}
                  >

                    {state == "CREATED" && offerings.filter((offering) => offering.authority == players[1]).length == 0 && (
                      <Box onClick={() => {
                        if (account == players[1])
                          handleClickOpen();
                      }} sx={{ justifySelf: "center", alignSelf: "center", cursor: "pointer" }}>
                        <Typography>{account == players[1] ? "Add an NFT/SOL" : ""}</Typography>
                      </Box>
                    )}

                    {offerings.map((offering) => {
                      // Prevents rendering player 0's offerings on player 1's offering section
                      if (offering?.authority !== players[1]) return;
                      // Add NFTOffering component if mint is available
                      if (offering.mint) {
                        return (
                          <NFTOffering key={offering.mint} offering={offering} removeOffering={removeOffering} playerStatus={playerStatus} />)
                      }
                      else {
                        return (
                          <SolOffering key={offering.mint} offering={offering} removeOffering={removeOffering} playerStatus={playerStatus} />)
                      }
                    })}

                  </Box>

                </Box>

              </Box>
            </>
          )}

        </Box>
      </Box>

      {/* FT & NATIVE Challenge Options */}
      {payout.type !== 'NFT' && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Resolve Game */}
          <Button
            className="btn"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || (state !== "CREATED" && state !== "LOCKED") || players.length < 2}
            sx={{
              backgroundColor: "#3eb718",
              mt: 1,
            }}
            onClick={() => startGame()}
          >
            Resolve Game
          </Button>
          {/* Cancel Game */}
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

          {chain == "SOLANA" && (
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
              onClick={() => leaveChallenge()}
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
      )}

      {/* NFT Challenge Options */}
      {payout.type == 'NFT' && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Cancel Game */}
          <Button
            className="btn"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || (state !== "CREATED")}
            sx={{
              backgroundColor: "#f45252",
              mt: 1,
            }}
            onClick={() => cancelNFT()}
          >
            Cancel
          </Button>
        </Box>
      )}

      {/* Add New Offerings Dialog */}
      <Dialog
        sx={{
        }}
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle sx={{ background: "#2f3140" }}>{"Trade"}</DialogTitle>
        <DialogContent sx={{ background: "#2f3140", minWidth: "500px" }}>

          <FormControl fullWidth sx={{ display: 'flex', my: 2 }}>
            <InputLabel>Asset</InputLabel>
            <Select
              value={OfferingType}
              label="Select Asset Type"
              onChange={(event) => {
                setOfferingType(event.target.value);
              }}
            >
              <MenuItem value={'NFT'}>NFT</MenuItem>
              <MenuItem value={'SOL'}>SOL</MenuItem>
            </Select>
          </FormControl>

          {OfferingType === 'NFT' && (
            <TextField
              fullWidth
              sx={{ my: 2 }}
              onChange={(event) => {
                setNFTAddress(event.target.value);
              }}
              label="NFT Address"
              id="nft-address"
              value={NFTAddress}
              variant="filled"
              size="small"
            />
          )}

          {OfferingType === 'SOL' && (
            <TextField
              fullWidth
              sx={{ my: 2 }}
              label="SOL Amount"
              type="number"
              helperText={``}
              onChange={(event) => {
                setSolAmount(event.target.value)
              }}
              id="SOL-amount"
              value={solAmount}
              variant="filled"
              size="small"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ background: "#2f3140" }}>
          <Button
            sx={{
              mb: 2
            }}
            variant="contained"
            onClick={handleClose}>Cancel</Button>
          <Button
            sx={{
              backgroundColor: "#3eb718",
              px: 4,
              mb: 2
            }}
            variant="contained"
            disabled={(OfferingType === 'NFT' && NFTAddress == '') || (OfferingType === 'SOL' && solAmount == '' || parseFloat(solAmount) == 0)}
            onClick={() => {
              if (OfferingType === 'NFT') addNFTOfferings();
              else if (OfferingType === 'SOL') addSOLOfferings();
              handleClose();
            }}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Coiin Animation Dialog */}
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


const NFTOffering = ({ offering, removeOffering, playerStatus }: any) => {

  const [metadata, setMetadata] = useState<any>();

  useEffect(() => {
    const getOfferingMetadata = async (mint: string) => {
      let _metadata;
      const nft = await mx
        .nfts()
        .findByMint({ mintAddress: new PublicKey(mint) });
      const response = await fetch(nft?.uri);
      _metadata = await response.json();
      setMetadata(_metadata);
    }
    getOfferingMetadata(offering.mint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offering]);

  return (
    <Box
      sx={{
        display: "grid",
      }}>

      {playerStatus == "JOINED" && (
        <Tooltip title='Remove Offering' arrow>
          <IconButton
            size="small"
            onClick={() => {
              removeOffering(offering.publicKey);
            }}
            sx={{
              display: "flex",
              color: "red",
              position: "absolute",
              left: "180px",
              bottom: "170px",
              background: "#374151",
              border: "1px solid #6b727e",
            }}
          >
            <RemoveCircleIcon />
          </IconButton>
        </Tooltip>
      )}

      {metadata?.image && (
        <Tooltip title={metadata?.name} arrow>
          <Image
            style={{
              justifySelf: "center",
              alignSelf: "center",
            }}
            src={metadata?.image}
            alt="NFT"
            width={150}
            height={150}
          />
        </Tooltip>
      )}
    </Box>
  )
}
const SolOffering = ({ offering, removeOffering, playerStatus }: any) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignSelf: "center",
        p: 4,
        my: 1,
        borderRadius: "6px",
        border: "1px solid #6b727e",
      }}>

      {playerStatus == "JOINED" && (
        <Tooltip title='Remove Offering' arrow>
          <IconButton
            size="small"
            onClick={() => {
              removeOffering(offering.publicKey);
            }}
            sx={{
              display: "flex",
              color: "red",
              position: "absolute",
              left: "180px",
              bottom: "170px",
              background: "#374151",
              border: "1px solid #6b727e",
            }}
          >
            <RemoveCircleIcon />
          </IconButton>
        </Tooltip>
      )}

      <Image
        alt="SOL"
        src={"/SOL.svg"}
        width={18}
        height={18}
        style={{
          marginRight: "7px",
        }}
      />

      <Typography sx={{
        justifySelf: "center",
        alignSelf: "center",
        fontSize: "14px",
        fontWeight: "bold",
      }}>
        {offering.amount} SOL
      </Typography>
    </Box>

  );
}
