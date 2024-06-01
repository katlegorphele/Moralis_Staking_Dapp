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
