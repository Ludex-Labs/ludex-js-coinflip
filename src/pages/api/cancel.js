import { Ludex } from "@ludex-labs/ludex-sdk-js";

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.REACT_APP_PROTOCOL_API,
}).challenge;

export default async function handler(req, res) {
  var { challengeId } = req.body;

  var res = await challengeAPI.cancelChallenge(challengeId);

  console.log(res);

  res.json(res);
}
