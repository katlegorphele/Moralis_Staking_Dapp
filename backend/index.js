import express from "express";
import Moralis from "moralis";
import dotenv from "dotenv";
import cors from "cors";
const app = express();
const port = process.env.PORT || 3000;
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
app.use(cors());
app.use(express.json());
dotenv.config();

// Initialize Moralis
Moralis.start({
    apiKey: MORALIS_API_KEY,
}).then(() => {
    console.log("Listening for API Calls");
});

// Endpoint
app.get("/getwalletbalance", async (req, res) => {
    try {
        const {query} = req;
        const response = await Moralis.EvmApi.balance.getNativeBalance({
            chain: "534351",
            address: query.address,
        });
        return res.status(200).json(response);
        }
    catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }
});
