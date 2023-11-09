import { useContext } from "react";
import { CHAIN_CONFIG, CHAIN_CONFIG_TYPE } from "../config/chainConfig";
import { Web3AuthContext } from "../services/web3auth";
import Image from "next/image";
import { Box, Button, Typography } from "@mui/material";

interface IProps {
  setChain: (chain: CHAIN_CONFIG_TYPE) => void;
}

const Setting = ({ setChain }: IProps) => {
  const { chain } = useContext(Web3AuthContext);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        mb: 4,
      }}
    >
      <Typography variant="h4">Select Chain</Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {Object.keys(CHAIN_CONFIG).map((_chain: string) => {
          return (
            <Button
              key={_chain}
              variant={chain === _chain ? "contained" : "outlined"}
              onClick={() => setChain(_chain as CHAIN_CONFIG_TYPE)}
              sx={{
                m: 2,
                p: 2,
                width: "125px",
                height: "125px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {_chain === "SOLANA" ? (
                <Image
                  alt="SOL"
                  src={"/SOL.svg"}
                  width={50}
                  height={50}
                  style={{
                    marginLeft: "5px",
                  }}
                />
              ) : _chain === "AVALANCHE" ? (
                <Image
                  alt="SOL"
                  src={"/AVAX.svg"}
                  width={50}
                  height={50}
                  style={{
                    marginLeft: "5px",
                  }}
                />
              ) : (
                _chain
              )}
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  lineHeight: 1.2,
                }}
              >
                {CHAIN_CONFIG[_chain as CHAIN_CONFIG_TYPE].displayName}
              </Typography>
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

export default Setting;