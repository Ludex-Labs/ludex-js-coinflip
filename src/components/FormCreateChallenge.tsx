// @mui
import {
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function FormCreateChallenge(props: {
  setOpenCreateDialog: (open: boolean) => void;
  openCreateDialog: boolean;
  payoutId: number;
  getChallenges: (payoutId: number) => void;
  setChallengeId: (challengeId: number) => void;
  createChallenge: (house: boolean) => void;
}) {
  const {
    setOpenCreateDialog,
    openCreateDialog,
    payoutId,
    getChallenges,
    setChallengeId,
    createChallenge,
  } = props;

  return (
    <Dialog onClose={() => setOpenCreateDialog(false)} open={openCreateDialog}>
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: "400" }}>
        Create Challenge
        <IconButton
          aria-label="close"
          onClick={() => setOpenCreateDialog(false)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          maxWidth: "400px",
          minWidth: "288px",
        }}
      >
        <Typography
          variant="subtitle1"
          component="p"
          sx={{ mt: 2, mb: 2, fontWeight: "400" }}
        >
          Would you like to play against the house CPU or another player?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ mr: 1, mb: 1 }}>
        <Button
          className="btn"
          variant="contained"
          autoFocus
          onClick={() => createChallenge(true)}
          sx={{
            mr: 1,
            minWidth: "125px !important",
            width: "125px !important",
          }}
        >
          House CPU
        </Button>
        <Button
          className="btn"
          variant="contained"
          autoFocus
          onClick={() => createChallenge(false)}
          sx={{ minWidth: "125px !important", width: "125px !important" }}
        >
          Player
        </Button>
      </DialogActions>
    </Dialog>
  );
}
