import { useEffect, useState } from "react";
import { Beans } from "@web3uikit/icons";
import styles from "../styles/Home.module.css";
import { Connector, useAccount, useConnect, useDisconnect } from "wagmi";

export default function Header() {
    const [isLoggedIn, setIsLoggedin] = useState(false);
    const { isConnected} = useAccount();
    const { connect, connectors} = useConnect();
    const { disconnect } = useDisconnect();

    useEffect(() => {
        if(!isConnected) {
            setIsLoggedin(false);
        } else {
            setIsLoggedin(true);
        }
    }, [isConnected]);

    return (
        <section className={styles.header}>
          <section className={styles.header_logoSection}>
            <h1 className={styles.title}>Kat Steax </h1>
            <Beans fontSize="20px" className={styles.beans} />
          </section>
          <section className={styles.header_btn}>
            {isLoggedIn ? ( // Show the "DISCONNECT WALLET" button when the user is logged in
              <button className={styles.connectBtn} onClick={disconnect}>
                DISCONNECT WALLET
              </button>
            ) : (
              <>
                {connectors.map((connector) => (
                  <button
                    disabled={!connector.ready}
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    className={styles.connectBtn}
                  >
                    CONNECT WALLET
                  </button>
                ))}
              </>
            )}
          </section>
        </section>
      );
}