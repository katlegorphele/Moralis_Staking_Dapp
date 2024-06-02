import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Home.module.css";
import { useAccount, useContract, useProvider, useSigner } from "wagmi";
import { ethers } from "ethers";

import { CONTRACT_ADDRESS, ABI } from "../contracts/index.js";
import { id } from "ethers/lib/utils.js";

export default function Staking() {
    const { isConnected, address } = useAccount();
    const provider = useProvider();
    const { data:sogner } = useSigner();

    const [walletBalance, setWalletBalance] = useState([]);
    const [stakingTab, setStakingTab] = useState(true);
    const [unstakingTab, setUnstakingTab] = useState(false);
    const [unstakeValue, setUnstakeValue] = useState(0);

    const toWei = (ether) => ethers.utils.parseEther(ether).toString();
    const fromWei = (wei) => ethers.utils.formatEther(wei);

    useEffect(() => {
        async function getWalletBalance() {
            await axios.get("http://localhost:5001/getwalletbalance",
            { params: { address: address }}).then((res) => {
                setWalletBalance(res.data.balance);
            }
            );
        }
        if (isConnected) {
            getWalletBalance();
        }
    }, [isConnected]);

    const contract = useContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        signerOrProvider: signer || provider,
    });

    const switchToUnstake = async () => {
        if (!unstakingTab) {
            setStakingTab(false);
            setUnstakingTab(true);
            const assetIds = await getAssetsIds(address. signer);
            setAssetsIds(assetIds);

            getAssets(assetIds,signer);
        }
    };

    const switchToStake = () => {
        if (!stakingTab) {
            setStakingTab(true);
            setUnstakingTab(false);
        }
    };

    const getAssetsIds = async (address) => {
        const assetIds = await contract.getPositionIdsForAddress(address);
        return assetIds;
    };

    const calcDaysRemaining = (unlockDate) => {
        const timeNow = Date.now() / 1000;
        const secondsRemaining = unlockDate - timeNow;
        return Math.max((secondsRemaining/60 / 60 / 24).toFixed(0), 0);
    };

    const getAssets = async (ids) => {
            const queriedAssets = await Promise.all(
                ids.map((id) => contract.getPositionById(id)));

            queriedAssets.map(async (asset) => {
                const parsedAsset = {
                    positionId: asset.positionId,
                    percentInterest: Number(asset.percentInterest) / 100,
                    daysRemaining: calcDaysRemaining(Number(asset.unlockDate)),
                    etherInterest: toEther(asset.weiInterest),
                    etherStaked: toEther(asset.weiStaked),
                    open: asset.open,
                };
            
                setAssets((prev) => [...prev, parsedAsset]);
                });
    };

    const stakeEther = async (stakingLength) => {
        const wei = toWei(String(amount));
        const data = { wei: wei};
        await contract.stakeEther(stakingLength,data);
    };

    const withdraw = (positionId) => {
        contract.closePosition(positionId);
    };

}