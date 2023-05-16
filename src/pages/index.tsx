import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "../components/App";
import dynamic from "next/dynamic";

const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#ff714f",
    },
    secondary: {
      main: "#edf2ff",
    },
    mode: "dark",
  },
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Coin Flip Challenge</title>
        <meta
          name="description"
          content="Ludex coin flip challenge on Solana!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />

        <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
        <meta property="og:image" content="/og_title.png" />
      </Head>
      <>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </>
    </>
  );
}
