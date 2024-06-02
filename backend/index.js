import express from "express";
import Moralis from "moralis";
import dotenv from "dotenv";
import cors from "cors";
const app = express();
const port = 5001;
import Web3 from "web3";
//const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjJiMmYwZWVjLTIyOTUtNGFiZS04OGYwLTUzZDAwMTJjMDA4YSIsIm9yZ0lkIjoiMzk0NjEyIiwidXNlcklkIjoiNDA1NDkxIiwidHlwZSI6IlBST0pFQ1QiLCJ0eXBlSWQiOiJhOTk1Yzk3Zi1mZTMxLTQzZGYtOGEzMy0zZGRmZDM2OTgwM2UiLCJpYXQiOjE3MTcyODMzNjQsImV4cCI6NDg3MzA0MzM2NH0.8w2E72RqQArIe8FQLn5Rn6jk2dXiB0WCNnPDQU9sJDI";
app.use(cors());
app.use(express.json());
dotenv.config();

// Initialize Moralis
// Moralis.start({
//     apiKey: MORALIS_API_KEY,
// }).then(() => {
//     console.log("Listening for API Calls");
// });

// Connect to the network
const web3 = new Web3('https://scroll-sepolia.drpc.org');


// Endpoint
app.get("/getwalletbalance", async (req, res) => {
    try {
        const {query} = req;
        const balanceWei = await web3.eth.getBalance(query.address);
        const balanceEther = web3.utils.fromWei(balanceWei, 'ether');
        return res.status(200).json({ balance: balanceEther });
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
