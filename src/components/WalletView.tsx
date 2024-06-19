import { useEffect, useState, FC } from "react";
import { useWeb3Auth } from "../services/web3auth";
import Image from "next/image";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";

export const WalletView: FC<{
  setDisplayWallet: (displayWallet: boolean) => void;
}> = (props) => {
  const { setDisplayWallet } = props;
  const { logout, getAccounts, getBalance, chain } = useWeb3Auth();

  const [accounts, setAccounts] = useState<string[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  const onClickLogout = async () => {
    await logout();
    setDisplayWallet(false);
  };

  const getAccountDetails = async () => {
    const _accounts = await getAccounts();
    if (_accounts) {
      setAccounts(_accounts);
    }

    const balance = await getBalance();
    const _balance =
      chain === "SOLANA"
        ? balance / 10 ** 9
        : chain === "AVALANCHE"
        ? balance / 10 ** 18
        : balance;
    setBalance(_balance);
  };

  useEffect(() => {
    getAccountDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      <FormControl fullWidth sx={{ width: "100%", mb: 2 }}>
        <InputLabel>Account</InputLabel>

        <OutlinedInput value={accounts[0] ? accounts[0] : "N/A"} fullWidth />
      </FormControl>
      <FormControl fullWidth sx={{ width: "100%", mb: 2 }}>
        <InputLabel>Balance</InputLabel>

        <OutlinedInput
          value={typeof balance === "number" ? balance : "N/A"}
          fullWidth
          endAdornment={
            <InputAdornment position="end">
              <Image
                alt="SOL"
                src={
                  chain === "SOLANA"
                    ? "/SOL.svg"
                    : chain === "AVALANCHE"
                    ? "/AVAX.svg"
                    : ""
                }
                width={18}
                height={18}
                style={{
                  marginLeft: "5px",
                }}
              />
            </InputAdornment>
          }
        />
      </FormControl>
      <Button
        onClick={() => onClickLogout()}
        className="btn"
        variant="contained"
        sx={{ mt: 2, backgroundColor: "#f45252" }}
      >
        Log Out
      </Button>
      <Button
        onClick={() => setDisplayWallet(false)}
        className="btn"
        variant="contained"
        sx={{ mt: 2 }}
      >
        Go Back
      </Button>
    </Box>
  );
};
