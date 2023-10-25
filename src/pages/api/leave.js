import { Ludex } from "@ludex-labs/ludex-sdk-js";

export default async function handler(req, res) {
  const { challengeId, playerPubkey } = req.body;

  console.log(req.body);

  // try {
  //   const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  //     baseUrl: process.env.REACT_APP_PROTOCOL_API,
  //   }).challenge;
  //   const challenges = await challengeAPI.generateLeave({
  //     challengeId: challengeId,
  //     playerPubkey: playerPubkey,
  //   });
  //   console.log("challenges", challenges);

  //   res.json(challenges);
  // } catch (error) {
  //   console.log("error", error);
  //   res.json(error);
  // }

  const url =
    process.env.BASE_URL + "/api/v2/challenge/" + challengeId + "/leave";
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: "Berear " + process.env.LUDEX_KEY,
    },
    body: JSON.stringify({
      playerPubkey: playerPubkey,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("GET Request Error");
      }
      return response.json();
    })
    .then((data) => {
      console.log("GET Request Response:", data);
      res.json(data);
    })
    .catch((error) => {
      console.error("GET Request Error:", error);
      res.json(error);
    });
}
