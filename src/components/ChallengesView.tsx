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
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function ChallengesView(props: any) {
  const { payoutId, setChallengeId, setPayoutId } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [hideCompleted, setHideCompleted] = useState<boolean>(true);

  const challengeList = hideCompleted
    ? challenges?.filter((challenges) => challenges.state === "CREATED")
    : challenges;

  useEffect(() => {
    getChallenges(payoutId);
    // eslint-disable-next-line
  }, []);

  const getChallenges = async (_payoutId: number) => {
    try {
      const response = await fetch(`/api/getChallenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId: payoutId }),
      });
      const res = await response.json();
      if (res?.code >= 300) throw res;
      setChallenges(res.challenges);
      setLoading(false);
    } catch (error) {
      // @ts-ignore
      if (error?.message) toast.error(error.message);
      else toast.error(JSON.stringify(error));
      console.error(error);
    }
  };

  const createChallenge = async () => {
    try {
      const response = await fetch(`/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId: payoutId }),
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
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant={"h5"}
        sx={{ mb: 2, display: "flex", justifyContent: "center" }}
      >
        Challenges
      </Typography>

      <Box sx={{ position: "relative" }}>
        <IconButton
          size="small"
          onClick={() => {
            setPayoutId(0);
          }}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            position: "absolute",
            top: "-20px",
            left: "-20px",
            background: "#374151",
            border: "1px solid #6b727e",
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => {
            toast.success("Fetching challenges!");
            getChallenges(payoutId);
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
            challengeList?.map((challenge) => (
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
                  padding: "2px 10px",
                  "&:hover": {
                    backgroundColor: "#5d5d5d",
                  },
                }}
              >
                <div>{challenge?.id}</div>
                <div>{challenge?.state}</div>
              </Box>
            ))
          )}
        </Box>
      </Box>

      <FormGroup sx={{ display: "flex", justifyContent: "center" }}>
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
        onClick={() => createChallenge()}
        className="btn"
        variant="contained"
        sx={{ mt: 2, backgroundColor: "#3eb718" }}
      >
        Create New Challenge
      </Button>
    </Box>
  );
}

export default ChallengesView;
