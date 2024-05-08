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
  setDisplayWallet: (displayWallet: boolean) => void;
  displayWallet: boolean;
}

const Main = ({ setChain, isCypress, displayWallet, setDisplayWallet }: IProps) => {
  const [challengeId, setChallengeId] = useState<number>(0);
  const { provider, login } = useWeb3Auth();

  const loggedInView = (
    <Box sx={{display:"grid"}} >
      <>
        {challengeId == 0 ? (
          <ChallengesView setChallengeId={setChallengeId} isCypress={isCypress} setChain={setChain} />
        ) : (
          <ChallengeView
            challengeId={challengeId}
            setChallengeId={setChallengeId}
          />
        )}
      </>
      <Button
        onClick={() => setDisplayWallet(!displayWallet)}
        className="btn"
        variant="contained"
        sx={{ mt: 2 }}
      >
        {"Open Wallet"}
      </Button>
    </Box>
  );

  const unloggedInView = (
    <>
      <Setting setChain={setChain} />
      <Button
        onClick={login}
        className="btn"
        variant="contained"
        sx={{ mt: 2 }}
      >
        Login
      </Button>
    </>
  );

  if (isCypress) return loggedInView;

  return (
    <Box sx={{ display: "grid", justifySelf: "center", alignSelf: "center", minWidth:"400px"}}>
      {!provider ? (
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
