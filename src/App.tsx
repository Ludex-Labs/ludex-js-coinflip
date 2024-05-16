import { useState } from "react";
import { CHAIN_CONFIG_TYPE } from "./config/chainConfig";
import { Web3AuthProvider } from "./services/web3auth";
import { Box } from "@mui/material";
import { Toaster } from "react-hot-toast";
import Lottie from "react-lottie";
import * as coin from "./components/animations/coin.json";
import Main from "./components/Main";

interface IProps {
  isCypress?: boolean;
}

function App({ isCypress }: IProps) {
  const [chain, setChain] = useState<CHAIN_CONFIG_TYPE>("AVALANCHE");
  const [displayWallet, setDisplayWallet] = useState<boolean>(false);

  return (
    <Web3AuthProvider chain={chain}>
      <Box sx={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(-45deg, #8c95ab 0%, #5f6574 25%, #353840 51%, #0e0f11 100%)",
        display: "grid"
      }}>
        <Toaster />
        <Main setChain={setChain} isCypress={isCypress} displayWallet={displayWallet} setDisplayWallet={setDisplayWallet} />
      </Box>
    </Web3AuthProvider >
  );
}

export default App;
