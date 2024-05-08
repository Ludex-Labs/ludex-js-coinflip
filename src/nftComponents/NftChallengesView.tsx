import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Checkbox,
  FormGroup,
  FormControlLabel,
  CircularProgress,
  Switch,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useWeb3Auth } from "../services/web3auth";
import Image from "next/image";
import { Transaction } from "@solana/web3.js";
import { CHAIN_CONFIG_TYPE } from "../config/chainConfig";

interface IProps {
  setChallengeId: (challengeId: number) => void;
  setChain?: (chain: CHAIN_CONFIG_TYPE) => void;
  isCypress?: boolean
}

export function NftChallengesView({ setChallengeId, isCypress, setChain }: IProps) {
  const { chain, signAndSendTransaction } = useWeb3Auth();

  const [loading, setLoading] = useState<boolean>(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [hideCompleted, setHideCompleted] = useState<boolean>(true);

  const challengeList = hideCompleted
    ? challenges?.filter((challenges) => challenges.state === "CREATED")
    : challenges;

  var payoutId = 0;
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    if (chain === "SOLANA_MAINNET") payoutId = 102;
    else if (chain === "SOLANA") payoutId = 1125;
  } else {
    if (chain === "SOLANA_MAINNET") payoutId = 28;
    else if (chain === "SOLANA") payoutId = 19;
  }

  useEffect(() => {
    getChallenges(payoutId);
  }, []);

  const getChallenges = async (_payoutId: number) => {
    try {
      const response = await fetch(`/api/getChallenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId: payoutId }),
      });
      const res = await response.json();
      if (res?.code >= 300) throw res;
      setChallenges(res.challenges);
      setLoading(false);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(error.message);
      else toast.error(JSON.stringify(error));
      console.error(error);
    }
  };

  const createChallenge = async (_payoutId: number) => {
    try {
      const response = await fetch(`/api/nft/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId: _payoutId }),
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

  const sign = async () => {
    if(isCypress) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const _tx = params.get("tx");
    if (_tx) {
      const decoded = decodeURIComponent(_tx);
      console.log("decoded", decoded);
      const transaction = Transaction.from(Buffer.from(decoded, "base64"));
      console.log("transaction", transaction);
      const sig = await signAndSendTransaction(transaction);
      console.log("sig", sig);
    }
  };

  const params = isCypress? null : new URLSearchParams(window.location.search);
  const _tx = params?.get("tx");

  return (
    <Box sx={{ width: "100%" }}>

      <Typography
        variant={"h5"}
        sx={{ mb: 2, display: "flex", justifyContent: "center" }}
      >
        Select NFT Challenge
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
        }}
      >
      </Box>

      <Box sx={{ position: "relative" }}>
        <IconButton
          size="small"
          onClick={() => {
            toast.success("Refetching challenges!");
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
          ) : challengeList?.length === 0 ? (
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
      <FormGroup
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
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
        onClick={() => createChallenge(payoutId)}
        className="btn"
        variant="contained"
        sx={{ mt: 2, backgroundColor: "#3eb718" }}
      >
        Create New NFT Challenge
      </Button>

      {_tx && (
        <Button
          onClick={() => sign()}
          className="btn"
          variant="contained"
          sx={{ mt: 2, backgroundColor: "#3eb718" }}
        >
          Sign Tx
        </Button>
      )}
    
    </Box>
    
  );
}

export default NftChallengesView;