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
  Modal,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useWeb3Auth } from "../services/web3auth";
import Image from "next/image";
import {
  Transaction,
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { CHAIN_CONFIG_TYPE } from "../config/chainConfig";
import _ from "lodash";
// icons
import { Icon, IconifyIcon } from "@iconify/react";
// @mui
import { BoxProps, SxProps } from "@mui/material";

interface IProps {
  setChallengeId: (challengeId: number) => void;
  setChain?: (chain: CHAIN_CONFIG_TYPE) => void;
  isCypress?: boolean;
  challengeType: string;
  setChallengeType: (challengeType: string) => void;
}

const challengeTypes = ["Native Token", "Fungible Token", "NFT"];

export function ChallengesView({
  setChallengeId,
  isCypress,
  setChain,
  challengeType,
  setChallengeType,
}: IProps) {
  const { chain, signAndSendTransaction } = useWeb3Auth();

  const [loading, setLoading] = useState<boolean>(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [hideCompleted, setHideCompleted] = useState<boolean>(true);
  const [createChallengeModal, setCreateChallengeModal] =
    useState<boolean>(false);
  // const [challengeType, setChallengeType] = useState<string>("Native Token");
  const [activePayoutId, setActivePayoutId] = useState<any>(null);

  const [sortAttribute, setSortAttribute] = useState("id");
  const [order, setOrder] = useState("desc");

  // Filters out completed challenges
  const challengeList = hideCompleted
    ? challenges?.filter((challenges) => challenges.state === "CREATED")
    : challenges;

  useEffect(() => {
    getPayouts();
    // eslint-disable-next-line
  }, [challengeType]);

  useEffect(() => {
    getChallenges();
    // eslint-disable-next-line
  }, [challengeType]);

  console.log("chain", chain);
  const getChallenges = async () => {
    try {
      const response = await fetch(`/api/getChallenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await response.json();
      if (res?.code >= 300) throw res;
      // Filter challenges based on challenge type selected
      const filteredChallengesByType = res.challenges.filter((challenge: any) =>
        challengeType === "Native Token"
          ? challenge.payout.type === "NATIVE"
          : challengeType === "Fungible Token"
          ? challenge.payout.type === "FT"
          : challenge.payout.type === "NFT"
      );
      // Filter challenges based on chain AND challenge environment

      const filteredChallengesByChain = filteredChallengesByType.filter(
        (challenge: any) =>
          chain.includes("AVALANCHE")
            ? challenge.payout.chain === "AVALANCHE"
            : challenge.payout.chain === "SOLANA"
      );

      const filteredChallengesByEnvironment = filteredChallengesByChain.filter(
        (challenge: any) => {
          if (chain.includes("MAINNET")) {
            return challenge.payout.environment === "MAINNET";
          } else {
            return challenge.payout.environment === "DEVNET";
          }
        }
      );

      console.log(
        "filteredChallengesByEnvironment",
        filteredChallengesByEnvironment
      );

      setChallenges(filteredChallengesByEnvironment);
      setLoading(false);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(error.message);
      else toast.error(JSON.stringify(error));
      console.error(error);
    }
  };

  const getPayouts = async () => {
    try {
      const response = await fetch(`/api/getPayouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: "APPROVED",
          type:
            challengeType == "Native Token"
              ? "NATIVE"
              : challengeType == "Fungible Token"
              ? "FT"
              : "NFT",
          chain: chain.includes("SOLANA") ? "SOLANA" : "AVALANCHE",
          environment: chain.includes("MAINNET") ? "MAINNET" : "DEVNET",
        }),
      });
      const res = await response.json();
      if (res?.code >= 300) throw res;
      setPayouts(res.payouts);
      setLoading(false);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(error.message);
      else toast.error(JSON.stringify(error));
      console.error(error);
    }
  };

  const createChallenge = async (activePayoutId?: any) => {
    const selectedPayout = payouts.find(
      (payout) => payout.id === activePayoutId
    );
    if (!selectedPayout) {
      toast.error("Please select a valid payout");
      return;
    }
    if (selectedPayout.type == "NFT") {
      try {
        const response = await fetch(`/api/nft/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payoutId: activePayoutId }),
        });
        const res = await response.json();
        if (res?.code >= 300) throw res;
        else toast.success("NFT Challenge created successfully");
      } catch (error) {
        // @ts-ignore
        if (error?.message) toast.error(error.message);
        else toast.error(JSON.stringify(error));
        console.error(error);
      }
    } else {
      try {
        const response = await fetch(`/api/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payoutId: activePayoutId }),
        });
        const res = await response.json();
        if (res?.code >= 300) throw res;
        else setChallengeId(res?.challengeId);
      } catch (error) {
        // @ts-ignore
        if (error?.message) toast.error(error.message);
        else toast.error(JSON.stringify(error));
        console.error(error);
      }
    }
  };

  const sign = async () => {
    if (isCypress) {
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

  const params = isCypress ? null : new URLSearchParams(window.location.search);
  const _tx = params?.get("tx");

  const cypressSetChainHelper = (
    <Box>
      <Button
        id="avax-devnet-switch"
        onClick={() => {
          setChain!("AVALANCHE");
        }}
        className="btn"
        variant="outlined"
        sx={{ mt: 2 }}
      >
        AVAX DEVNET
      </Button>
      <Button
        id="avax-mainnet-switch"
        onClick={() => {
          setChain!("AVALANCHE_MAINNET");
        }}
        className="btn"
        variant="outlined"
        sx={{ mt: 2 }}
      >
        AVAX MAINNET
      </Button>
      <Button
        id="sol-devnet-switch"
        onClick={() => {
          setChain!("SOLANA");
        }}
        className="btn"
        variant="outlined"
        sx={{ mt: 2 }}
      >
        SOLANA DEVNET
      </Button>
      <Button
        id="sol-mainnet-switch"
        onClick={() => {
          setChain!("SOLANA_MAINNET");
        }}
        className="btn"
        variant="outlined"
        sx={{ mt: 2 }}
      >
        SOLANA MAINNET
      </Button>
    </Box>
  );

  const displayCreateChallengeModalNFT = (
    <>
      <Typography variant="h5" sx={{ textAlign: "center", my: 2 }}>
        Select Payout
      </Typography>

      <TableContainer sx={{ minWidth: "550px" }} component={Paper}>
        <Table aria-label="collapsible table" sx={{ overflowX: "scroll" }}>
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => {
                  setSortAttribute("id");
                  if (order == "desc") {
                    setOrder("asc");
                  } else {
                    setOrder("desc");
                  }
                }}
                align="left"
              >
                ID
                {sortAttribute == "id" && order == "asc" && (
                  <Iconify
                    sx={{ ml: 1, verticalAlign: "middle" }}
                    icon="ep:arrow-down"
                  />
                )}
                {sortAttribute == "id" && order == "desc" && (
                  <Iconify
                    sx={{ ml: 1, verticalAlign: "middle" }}
                    icon="ep:arrow-up"
                  />
                )}
              </TableCell>
              <TableCell align="center">Chain</TableCell>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Fee</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {_.orderBy(
              payouts,
              [(item: any) => item?.[`${sortAttribute}`]],
              [order as boolean | "asc" | "desc"] // Fix: Cast 'order' to the appropriate type
            )?.map((payout, index) => {
              return (
                <TableRow
                  key={payout.id}
                  onClick={() => {
                    if (activePayoutId === payout?.id) {
                      setActivePayoutId(null);
                      return;
                    } else {
                      setActivePayoutId(payout?.id);
                    }
                  }}
                  sx={{
                    cursor: "pointer",
                    height: "45px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#5d5d5d",
                    },
                    background:
                      activePayoutId === payout?.id ? "green" : "transparent",
                  }}
                >
                  <TableCell align="left">
                    {payout.id ? payout.id : "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    {payout.chain.includes("SOLANA") ? (
                      <Image
                        alt="SOL"
                        src={"/SOL.svg"}
                        width={20}
                        height={20}
                      />
                    ) : chain.includes("AVALANCHE") ? (
                      <Image
                        alt="AVAX"
                        src={"/AVAX.svg"}
                        width={20}
                        height={20}
                      />
                    ) : (
                      <></>
                    )}
                  </TableCell>
                  <TableCell align="left">
                    {payout.name ? payout.name : "N/A"}
                  </TableCell>
                  <TableCell align="left">
                    {(parseInt(payout?.mediatorFee) +
                      parseInt(payout?.providerFee)) /
                      LAMPORTS_PER_SOL}{" "}
                    SOL
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        onClick={() => {
          createChallenge(activePayoutId);
          setCreateChallengeModal(false);
        }}
        className="btn"
        variant="contained"
        disabled={!activePayoutId}
        sx={{ my: 2, backgroundColor: "#3eb718" }}
      >
        Create
      </Button>
    </>
  );

  const displayCreateChallengeModal = (
    <>
      <Typography variant="h5" sx={{ textAlign: "center", my: 2 }}>
        Select Payout
      </Typography>

      <TableContainer sx={{ minWidth: "550px" }} component={Paper}>
        <Table aria-label="collapsible table" sx={{ overflowX: "scroll" }}>
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => {
                  setSortAttribute("id");
                  if (order == "desc") {
                    setOrder("asc");
                  } else {
                    setOrder("desc");
                  }
                }}
                align="left"
              >
                ID
                {sortAttribute == "id" && order == "asc" && (
                  <Iconify
                    sx={{ ml: 1, verticalAlign: "middle" }}
                    icon="ep:arrow-down"
                  />
                )}
                {sortAttribute == "id" && order == "desc" && (
                  <Iconify
                    sx={{ ml: 1, verticalAlign: "middle" }}
                    icon="ep:arrow-up"
                  />
                )}
              </TableCell>
              <TableCell align="left">Chain</TableCell>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Token</TableCell>
              <TableCell align="left">Entry Fee</TableCell>
              <TableCell align="left">Rake</TableCell>
              <TableCell align="left">Limit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {_.orderBy(
              payouts,
              [(item: any) => item?.[`${sortAttribute}`]],
              [order as boolean | "asc" | "desc"] // Fix: Cast 'order' to the appropriate type
            )?.map((payout: any) => {
              return (
                <TableRow
                  key={payout.id}
                  onClick={() => {
                    if (activePayoutId === payout?.id) {
                      setActivePayoutId(null);
                      return;
                    } else {
                      setActivePayoutId(payout?.id);
                    }
                  }}
                  sx={{
                    cursor: "pointer",
                    height: "45px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#5d5d5d",
                    },
                    background:
                      activePayoutId === payout?.id ? "green" : "transparent",
                  }}
                >
                  {/* ID */}
                  <TableCell align="left">
                    {payout.id ? payout.id : "N/A"}
                  </TableCell>
                  {/* Chain */}
                  <TableCell align="left">
                    {payout.chain.includes("SOLANA") ? (
                      <Image
                        alt="SOL"
                        src={"/SOL.svg"}
                        width={20}
                        height={20}
                      />
                    ) : chain.includes("AVALANCHE") ? (
                      <Image
                        alt="AVAX"
                        src={"/AVAX.svg"}
                        width={20}
                        height={20}
                      />
                    ) : (
                      <></>
                    )}
                  </TableCell>
                  {/* Name */}
                  <TableCell align="left">
                    {payout.name ? payout.name : "N/A"}
                  </TableCell>
                  {/*Token */}
                  <TableCell align="left">
                    {/* Display image only if icon is avaialble */}
                    {payout.Mint.icon && (
                      <Image
                        style={{ verticalAlign: "sub", marginRight: "5px" }}
                        alt="Token Icon"
                        src={payout.Mint.icon}
                        width={20}
                        height={20}
                      />
                    )}
                    {payout.Mint.ticker ? payout.Mint.ticker : "N/A"}
                  </TableCell>
                  {/* Entry Fee */}
                  <TableCell align="left">
                    {parseInt(payout?.entryFee) /
                      10 ** payout.Mint.decimalPosition}{" "}
                    {payout.Mint.ticker}
                  </TableCell>
                  {/* Provider and Mediator Rake */}
                  {chain.includes("SOLANA") && (
                    <TableCell align="left">
                      {(parseInt(payout?.mediatorRake) +
                        parseInt(payout?.providerRake)) /
                        LAMPORTS_PER_SOL}{" "}
                      SOL
                    </TableCell>
                  )}
                  {chain.includes("AVALANCHE") && (
                    <TableCell align="left">
                      {(parseInt(payout?.mediatorRake) +
                        parseInt(payout?.providerRake)) /
                        10 ** payout.Mint.decimalPosition}{" "}
                      AVAX
                    </TableCell>
                  )}
                  {/* Limit */}
                  <TableCell align="left">
                    {payout.limit ? payout.limit : "N/A"}
                  </TableCell>
                </TableRow>
              );
            })}

            {payouts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No payouts available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        onClick={() => {
          createChallenge(activePayoutId);
          setCreateChallengeModal(false);
        }}
        className="btn"
        variant="contained"
        disabled={!activePayoutId}
        sx={{ my: 2, backgroundColor: "#3eb718" }}
      >
        Create
      </Button>
    </>
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant={"h5"}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        Select Challenge Type
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {challengeTypes.map((_type: string) => {
          return (
            <Tooltip key={_type} title={`${_type} Challenges`}>
              <Button
                disabled={chain.includes("AVALANCHE") && _type === "NFT"}
                key={_type}
                variant={challengeType === _type ? "contained" : "outlined"}
                onClick={() => setChallengeType(_type)}
                sx={{
                  m: 1.5,
                  mt: 4,
                  width: "110px",
                  height: "110px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {chain.includes("SOLANA") ? (
                  <Image alt="SOL" src={"/SOL.svg"} width={50} height={50} />
                ) : chain.includes("AVALANCHE") ? (
                  <Image alt="AVAX" src={"/AVAX.svg"} width={50} height={50} />
                ) : (
                  chain
                )}
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    lineHeight: 1.2,
                  }}
                >
                  {_type}
                </Typography>
              </Button>
            </Tooltip>
          );
        })}
      </Box>
      {/* Table Titles */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "3px 10px",
        }}
      >
        <Typography variant={"body1"}>ID</Typography>
        <Typography variant={"body1"}>Players</Typography>
        {challengeType !== "NFT" && (
          <Typography variant={"body1"}>Mint</Typography>
        )}
        <Typography variant={"body1"}>Status</Typography>
      </Box>

      <Box sx={{ position: "relative" }}>
        <IconButton
          size="small"
          onClick={() => {
            toast.success("Refetching challenges!");
            getChallenges();
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
            <>
              {challengeList?.map((challenge) => {
                return (
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
                      padding: "4px 10px",
                      "&:hover": {
                        backgroundColor: "#5d5d5d",
                      },
                    }}
                  >
                    <p style={{ display: "inline" }}>{challenge?.id}</p>
                    <p style={{ display: "inline" }}>
                      {" "}
                      {challenge.players.length} / {challenge.payout.limit}
                    </p>

                    {challenge.payout.type !== "NFT" && (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        {challenge.payout.mint.icon && (
                          <Image
                            style={{ verticalAlign: "sub", marginRight: "5px" }}
                            alt={challenge.payout.mint.icon}
                            src={challenge.payout.mint.icon}
                            width={20}
                            height={20}
                          />
                        )}
                        <p style={{ display: "inline" }}>
                          {challenge?.payout.mint.ticker}
                        </p>
                      </span>
                    )}
                    <p style={{ display: "inline" }}>{challenge?.state}</p>
                  </Box>
                );
              })}
            </>
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
        onClick={() => {
          setCreateChallengeModal(true);
        }}
        className="btn"
        variant="contained"
        sx={{ mt: 2, backgroundColor: "#3eb718" }}
      >
        Create New Challenge
      </Button>

      <Modal
        sx={{
          justifySelf: "center",
          alignSelf: "center",
          display: "grid",
          background: "#2f3140",
        }}
        open={createChallengeModal}
        onClose={() => {
          setCreateChallengeModal(false);
        }}
      >
        {challengeType == "NFT"
          ? displayCreateChallengeModalNFT
          : displayCreateChallengeModal}
      </Modal>

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

      {isCypress ? cypressSetChainHelper : null}
    </Box>
  );
}

export default ChallengesView;

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  sx?: SxProps;
  icon: IconifyIcon | string;
}

export function Iconify({ icon, sx, ...other }: Props) {
  return <Box component={Icon} icon={icon} sx={{ ...sx }} {...other} />;
}
