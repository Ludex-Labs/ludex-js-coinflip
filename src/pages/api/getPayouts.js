import axios from "axios";

const ludexApi = process.env.NEXT_PUBLIC_BASE_URL + '/v2/payout/';
const org_API_KEY = process.env.ORG_LUDEX_KEY;

export default async function handler(req, res) {
    const { state, type, chain, environment } = req.body;
    console.log('🚨🚨🚨🚨','getPayouts', '🚨🚨🚨🚨');
    try {
        const params = {
            state,
            type,
            chain,
            environment
        }
        const config = {
            headers: {
                Authorization: `Bearer ${org_API_KEY}`,
                'Content-Type': 'application/json',
            },
            params
        };
        const response = await axios.get(ludexApi, config);
        res.json(response.data);
    } catch (error) {
        console.log(error?.response?.data);
        if (error?.response?.status) res.status(error?.response?.status);
        else res.status(400);
        res.json(error?.response?.data);
    }
}
