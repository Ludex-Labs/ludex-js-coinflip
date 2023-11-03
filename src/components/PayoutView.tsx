import { FC } from "react";
import { Box, Button, Typography } from "@mui/material";
import Image from "next/image";

export const PayoutView: FC<{
  setPayoutId: (payoutId: number) => void;
}> = (props) => {
  const { setPayoutId } = props;

  return (
    <Box
      sx={{
        width: "300px",
        minWidth: "300px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant={"h5"}
        sx={{ mb: 2, display: "flex", justifyContent: "center" }}
      >
        Select Chain
      </Typography>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <Button
          onClick={() => setPayoutId(91)}
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "125px",
            m: 1,
          }}
        >
          <Image
            src="/SOL.svg"
            alt="SOL"
            width={42}
            height={42}
            style={{ marginBottom: 5, paddingTop: 3 }}
          />
          Solana
        </Button>
        <Button
          onClick={() => setPayoutId(95)}
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "125px",
            m: 1,
          }}
        >
          <Image
            src="/avax.svg"
            alt="AVAX"
            width={50}
            height={50}
            style={{ marginBottom: 5, paddingTop: 5 }}
          />
          Avalanche
        </Button>
      </Box>
    </Box>
  );
};
