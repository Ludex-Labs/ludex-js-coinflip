import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Connection } from "@solana/web3.js";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { getTestSol, viewTokenAccounts, RPC } from "./RPC";

// MUI
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  Typography,
} from "@mui/material";

export const WalletSolana: FC<{
  provider: SafeEventEmitterProvider | null;
  publicKey: string;
  isMainnet: boolean;
  connection: Connection;
  changeNetwork: (network: string) => void;
  logout: () => void;
}> = (props) => {
  const { provider, publicKey, isMainnet, connection, changeNetwork, logout } =
    props;
  const [balanceSOL, setBalanceSOL] = useState<number | undefined>(undefined);

  const getBalance = async () => {
    if (!provider) {
      console.error("provider not initialized yet");
      return;
    }

    // Get SOL balance
    const rpc = new RPC(provider);
    const _balance = await rpc.getBalance(connection);
    if (_balance?.toString().includes("Error")) {
      toast.error("Error getting balance");
      setBalanceSOL(0);
      return;
    } else setBalanceSOL(parseInt(_balance) / 10 ** 9);

    // Get WSOL balance
    // const tokenAccounts = await viewTokenAccounts(
    //   provider,
    //   publicKey,
    //   connection
    // );

    // const WSOLAccount = tokenAccounts?.value?.find((tokenAccount) => {
    //   if (
    //     tokenAccount?.account?.data?.parsed?.info?.mint ===
    //     "So11111111111111111111111111111111111111112"
    //   )
    //     return tokenAccount;
    // });
    // setBalanceWSOL(
    //   WSOLAccount?.account?.data?.parsed?.info?.tokenAmount?.uiAmount
    // );
  };

  useEffect(() => {
    getBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMainnet]);

  return (
    <>
      <Typography variant={"h5"} sx={{ mb: 3.5 }}>
        Your Wallet
      </Typography>
      <FormControl size="small" fullWidth sx={{ width: "100%", mb: 2 }}>
        <InputLabel>Public Key</InputLabel>
        <OutlinedInput
          value={publicKey}
          label="Public Key"
          disabled
          fullWidth
        />
      </FormControl>

      <FormControl size="small" fullWidth sx={{ width: "100%", mb: 2 }}>
        <InputLabel>SOL Balance</InputLabel>
        <OutlinedInput
          value={balanceSOL ? balanceSOL?.toString() + " SOL" : ""}
          label="SOL Balance"
          disabled
          fullWidth
        />
      </FormControl>

      <Box style={{ width: "100%" }}>
        {isMainnet ? (
          <Button
            className="btn"
            variant="contained"
            size="small"
            onClick={() => {
              window.open(
                "https://solana.tor.us/wallet/topup/moonpay?instanceId=" +
                  publicKey,
                "_blank",
                "popup=true,height=600,width=400"
              );
            }}
            sx={{
              mb: 1,
            }}
          >
            Top Up
          </Button>
        ) : (
          <Button
            className="btn"
            variant="contained"
            size="small"
            onClick={async () => {
              await getTestSol(publicKey);
              getBalance();
            }}
            sx={{
              mb: 1,
              backgroundColor: "#3eb718",
            }}
          >
            Get Test SOL
          </Button>
        )}

        <Button
          color="error"
          className="btn"
          variant="contained"
          onClick={() => logout()}
        >
          Logout
        </Button>
      </Box>
    </>
  );
};
