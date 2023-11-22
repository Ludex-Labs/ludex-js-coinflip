import { useState, useEffect } from "react";
import { useWeb3Auth } from "../services/web3auth";
import { Box, Button } from "@mui/material";
import Setting from "./Setting";
import { CHAIN_CONFIG_TYPE } from "../config/chainConfig";
import { ChallengesView } from "./ChallengesView";
import { ChallengeView } from "./ChallengeView";
import { WalletView } from "./WalletView";
import io from "socket.io-client";
let socket;

interface IProps {
  setChain: (chain: CHAIN_CONFIG_TYPE) => void;
}

const Main = ({ setChain }: IProps) => {
  const [challengeId, setChallengeId] = useState<number>(0);
  const [displayWallet, setDisplayWallet] = useState<boolean>(false);
  const [challengeIdUpdated, setChallengeIdUpdated] = useState<number>(0);

  const { provider, login } = useWeb3Auth();

  useEffect(() => {
    socketInitializer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const socketInitializer = async () => {
    try {
      const response = await fetch("/api/webhook");
      const res = await response.json();
      const sockerUrl = res.socketUrl;

      socket = io(sockerUrl, {
        transports: ["websocket"],
        upgrade: false,
      });

      socket.on("connect", () => {
        console.log("connected");
      });

      socket.on("message", (data) => {
        console.log("Webhook update:", data);
        if (data.id) setChallengeIdUpdated(data.id);
        else if (data.challengeId) setChallengeIdUpdated(data.challengeId);
      });
    } catch (error) {
      console.error(error);
    }
  };

  console.log("challengeIdUpdated", challengeIdUpdated);

  const loggedInView = (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          mb: 3,
        }}
      >
        {challengeId === 0 ? (
          <ChallengesView setChallengeId={setChallengeId} />
        ) : (
          <ChallengeView
            challengeId={challengeId}
            setChallengeId={setChallengeId}
            challengeIdUpdated={challengeIdUpdated}
            setChallengeIdUpdated={setChallengeIdUpdated}
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
