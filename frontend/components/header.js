import { useEffect, useState } from "react";
import { NftCat, MetamaskLined } from "@web3uikit/icons";

import styles from "../styles/Home.module.css";
import Web3 from 'web3';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      setIsLoggedIn(true);
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(accounts);
        setIsLoggedIn(false);
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      console.error("Non-Ethereum browser detected. Please consider installing MetaMask");
    }
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setIsLoggedIn(true);
  };

  return (
    <section className={styles.header}>
      <section className={styles.header_logoSection}>
      <NftCat fontSize="40px" className={styles.beans} color="white" />
        <h1 className={styles.title}>KRP STACKING </h1>
      </section>
      <section className={styles.header_btn}>
        {!isLoggedIn ? (
          <button className={styles.connectBtn} onClick={disconnectWallet}>
            DISCONNECT WALLET
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className={styles.connectBtn}
          >
            <MetamaskLined fontSize='20px'color="white" className="{styles.header_btn_icon}"/>  CONNECT WALLET
          </button>
        )}
      </section>
    </section>
  );
}