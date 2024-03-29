import { useState, useEffect } from "react";
import { useWeb3Auth } from "../services/web3auth";
import { Box, Button } from "@mui/material";
import Setting from "./Setting";
import { CHAIN_CONFIG_TYPE } from "../config/chainConfig";
import { ChallengesView } from "./ChallengesView";
import { ChallengeView } from "./ChallengeView";
import { WalletView } from "./WalletView";

interface IProps {
  setChain: (chain: CHAIN_CONFIG_TYPE) => void;
  isCypress?: boolean
}

const Main = ({ setChain, isCypress }: IProps) => {
  const [challengeId, setChallengeId] = useState<number>(0);
  const [displayWallet, setDisplayWallet] = useState<boolean>(false);

  const { provider, login } = useWeb3Auth();

  const loggedInView = (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          mb: 3,
        }}
      >
        {challengeId === 0 ? (
          <ChallengesView setChallengeId={setChallengeId} isCypress={isCypress} setChain={setChain} />
        ) : (
          <ChallengeView
            challengeId={challengeId}
            setChallengeId={setChallengeId}
          />
        )}
      </Box>

      <Button
        onClick={() => setDisplayWallet(!displayWallet)}
        className="btn"
        variant="contained"
        sx={{ mt: 2 }}
      >
        Wallet
      </Button>
    </Box>
  );

  const unloggedInView = (
    <Box>
      <Setting setChain={setChain} />
      <Button
        onClick={login}
        className="btn"
        variant="contained"
        sx={{ mt: 2 }}
      >
        Login
      </Button>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "350px",
      }}
    >
      
      
      {isCypress? loggedInView : !provider ? (
        unloggedInView
      ) : displayWallet ? (
        <WalletView setDisplayWallet={setDisplayWallet} />
      ) : (
        loggedInView
      )}
    </Box>
  );
};

export default Main;
