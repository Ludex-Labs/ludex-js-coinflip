import axios from "axios";

const ludexApi = process.env.NEXT_PUBLIC_BASE_URL + '/v2/nftChallenge/'
const authToken = process.env.LUDEX_KEY

export default async function handler(req, res) {
    const { playerPubkey, challengeId, amount, tokenMintAddress } = req.body;

    const url = ludexApi + challengeId + '/add-nft-offering';
    console.log('🚨🚨🚨🚨', url)

    try {
        const requestbody = {
            playerPubkey,
            amount,
            tokenMintAddress
        }

        const response = await axios.patch(url, requestbody, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        res.json(response.data);
    } catch (error) {
        console.log(error?.response?.data);
        if (error?.response?.status) res.status(error?.response?.status);
        else res.status(400);
        res.json(error?.response?.data);
    }
}
