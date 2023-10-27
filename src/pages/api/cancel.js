import { Ludex } from "@ludex-labs/ludex-sdk-js";

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.REACT_APP_PROTOCOL_API,
}).challenge;

export default async function handler(req, res) {
  var { challengeId } = req.body;
  try {
    var response = await challengeAPI.cancelChallenge(challengeId);
    console.log("res", response);
    res.json(response.data);
  } catch (error) {
    console.log("error", error);
    console.log(error?.response?.data);
    res.status(error?.response?.data?.code).json(error?.response?.data);
  }
}
