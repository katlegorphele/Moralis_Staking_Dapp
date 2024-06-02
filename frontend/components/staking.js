import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import Web3 from 'web3';
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x43B96E5BA08EA248DDC52b9A060424fA895E8F88";
const contractData = require("../contracts/Staking.json");
const ABI = contractData.abi;

export default function Staking() {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);

    const [walletBalance, setWalletBalance] = useState("");

    const [stakingTab, setStakingTab] = useState(true);
    const [unstakingTab, setUnstakingTab] = useState(false);
    const [unstakeValue, setUnstakeValue] = useState(0);

    const [assetIds, setAssetIds] = useState([]);
    const [assets, setAssets] = useState([]);
    const [amount, setAmount] = useState(0);

    const toWei = (ether) => ethers.utils.parseEther(ether).toString();
    const toEther = (wei) => ethers.utils.formatEther(wei);

    useEffect(() => {
        async function initializeWeb3() {
            if (window.ethereum) {
                try {
                    // Request account access if needed
                    await window.ethereum.enable();
                    // We don't know window.ethereum exists until we've asked the user
                    // for permission to access their Ethereum accounts.
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);
                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);
                    const contractInstance = new web3Instance.eth.Contract(ABI, CONTRACT_ADDRESS);
                    setContract(contractInstance);
                } catch (error) {
                    console.error("Error creating web3 instance", error);
                }
            } else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
        }
        initializeWeb3();
    }, []);

    useEffect(() => {
        async function getWalletBalance() {
            if (account) {
                const balance = await web3.eth.getBalance(account);
                setWalletBalance(balance);
            }
        }
        getWalletBalance();
    }, [account]);


    const switchToUnstake = async () => {
        if (!unstakingTab) {
            setStakingTab(false);
            setUnstakingTab(true);
            const assetIds = await getAssetsIds(account);
            setAssetIds(assetIds); 
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
        if (contract) {
            const assetIds = await contract.methods.getPositionIdsForAddress(address).call();
            return assetIds;
        } else {
            console.error("Contract is not initialized");
            return [];
        }
    };

    const calcDaysRemaining = (unlockDate) => {
        const timeNow = Date.now() / 1000;
        const secondsRemaining = unlockDate - timeNow;
        return Math.max((secondsRemaining/60 / 60 / 24).toFixed(0), 0);
    };

    const getAssets = async (ids) => {
        const queriedAssets = await Promise.all(
            ids.map((id) => contract.methods.getPositionById(id).call()));

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
        if (contract) {
            const wei = toWei(String(amount));
            const data = { value : wei};
            await contract.methods.stakeEther(stakingLength).send(data);
        } else {
            console.error("Contract is not initialized");
        }
    };

    const withdraw = (positionId) => {
        contract.methods.closePosition(positionId).send();
    };

    return (
        <section className={styles.stakingContainer}>
      <section>
        <section className={styles.stakeUnstakeTab}>
          <section
            className={`${stakingTab ? styles.stakingType : ""}`}
            id="stake"
            onClick={switchToStake}
          >
            Stake
          </section>
          <section
            className={`${unstakingTab ? styles.stakingType : ""}`}
            id="unstake"
            onClick={switchToUnstake}
          >
            Unstake
          </section>
        </section>
        <section className={styles.stakingSection}>
          <span className={styles.apy}>7% APY</span>
          {stakingTab ? (
            <section className={styles.stakingBox}>
              <h2>Stake</h2>
              <input
                className={styles.inputField}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                id="inputField"
                maxLength="120"
                placeholder="Enter Amount"
                required
              />
              <section className={styles.stakingInfo}>
                <p>
                  Your Balance:{" "}
                  <span>{(Number(walletBalance) / 10 ** 18).toLocaleString()}ETH</span>
                </p>
                <p>Exchange Rate: 1.03582967</p>
                {/* <p>Transaction Cost</p> */}
              </section>
              <button
                className={styles.stakeBtn}
                onClick={() => stakeEther(0, "7%")}
              >
                STAKE
              </button>
            </section>
          ) : (
            <section className={styles.stakingBox}>
              <h2>Unstake</h2>
              <input
                className={styles.inputField}
                value={unstakeValue}
                onChange={(e) => setUnstakeValue(e.target.value)}
                type="number"
                id="inputField"
                maxLength="120"
                placeholder="Enter Amount"
                required
              />
              <section className={styles.stakingInfo}>
                <p>
                  Balance:{" "}
                  {assets.length > 0 &&
                    assets.map((a, id) => {
                      if (a.open) {
                        return <span key={id}>{a.etherStaked}</span>;
                      } else {
                        return <span></span>;
                      }
                    })}
                </p>
                {/* <p>Transaction Cost</p> */}
                <p>
                  You Receive: {unstakeValue == 0 ? "" : unstakeValue * 3.07}
                </p>
              </section>
              <button
                    className={styles.stakeBtn}
                    onClick={() => {
                        if (assets.length > 0) {
                            withdraw(assets[assets.length - 1].positionId);
                        } else {
                            console.error("No assets to unstake");
                        }
                    }}
                >
                UNSTAKE
              </button>
            </section>
          )}
        </section>
      </section>
      <section>
        <section className={styles.stakingInfoSection}>
          <section className={styles.stakingInfo}>
            <h2>Locked Staking</h2>
            <section className={styles.lockedStaking}>
              <span>Locked 30 days</span>
              <span className={styles.lockedStakingAPY}>8% API</span>
              <input
                className={styles.inputField}
                type="number"
                id="inputField"
                maxLength="120"
                placeholder="Enter Amount"
                required
              />
            </section>
            <section className={styles.lockedStaking}>
              <span>Locked 60 days</span>
              <span className={styles.lockedStakingAPY}>9% API</span>
              <input
                className={styles.inputField}
                type="number"
                id="inputField"
                maxLength="120"
                placeholder="Enter Amount"
                required
              />
            </section>
            <section className={styles.lockedStaking}>
              <span>Locked 90 days</span>
              <span className={styles.lockedStakingAPY}>12% API</span>
              <input
                className={styles.inputField}
                type="number"
                id="inputField"
                maxLength="120"
                placeholder="Enter Amount"
                required
              />
            </section>
          </section>
          <button className={styles.stakeBtn}>STAKE</button>
        </section>
      </section>
    </section>
  );

}