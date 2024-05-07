import { useState } from "react";
import { CHAIN_CONFIG_TYPE } from "../config/chainConfig";
import { Web3AuthProvider } from "../services/web3auth";
import { Box } from "@mui/material";
import { Toaster } from "react-hot-toast";
import Lottie from "react-lottie";
import * as coin from "../components/animations/coin.json";
import NftMain from "./NftMain";

interface IProps {
  isCypress?: boolean;
}

function NftApp({ isCypress }: IProps) {
  const [chain, setChain] = useState<CHAIN_CONFIG_TYPE>("AVALANCHE");

  return (
    <Web3AuthProvider chain={chain}>
      <Box className="bg">
        <Toaster />

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
            style={{
              position: "absolute",
              top: 0,
              zIndex: -1,
            }}
          />
          <NftMain setChain={setChain} isCypress={isCypress} />
        </Box>
      </Box>
    </Web3AuthProvider>
  );
}

export default NftApp;
