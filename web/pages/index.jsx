import abi from "../utils/BuyMeACoffee.json";
import { ethers } from "ethers";
import Head from "next/head";
import React, { useEffect, useState, useCallback } from "react";
import styles from "../styles/Home.module.css";

//TODO:

export default function Home() {
    // Contract Address & ABI
    const contractAddress = "0x97eD63a8945F8591D79E54418503f67aB26f03aA";
    const contractABI = abi.abi;

    // Component state
    const [currentAccount, setCurrentAccount] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [memos, setMemos] = useState([]);

    const onNameChange = (event) => {
        setName(event.target.value);
    };

    const onMessageChange = (event) => {
        setMessage(event.target.value);
    };

    // Wallet connection logic
    const isWalletConnected = async () => {
        try {
            const { ethereum } = window;

            const accounts = await ethereum.request({ method: "eth_accounts" });
            console.log("accounts: ", accounts);

            if (accounts.length > 0) {
                const account = accounts[0];
                console.log("wallet is connected! " + account);
            } else {
                console.log("make sure MetaMask is connected");
            }
        } catch (error) {
            console.log("error: ", error);
        }
    };

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                console.log("please install MetaMask");
            }

            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });

            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
        }
    };

    const buyCoffee = async (size) => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(
                    ethereum,
                    "any"
                );
                const signer = provider.getSigner();
                const buyMeACoffee = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );

                let cost = null;
                switch (size) {
                    case "regular":
                        cost = "0.001";
                        break;
                    case "medium":
                        cost = "0.002";
                        break;
                    case "large":
                        cost = "0.003";
                        break;
                    default:
                        throw "Unknown coffee size";
                }

                console.log("buying coffee..");
                const coffeeTxn = await buyMeACoffee.buyCoffee(
                    name ?? "anon",
                    message ?? "Enjoy your coffee!",
                    { value: ethers.utils.parseEther(cost) }
                );

                await coffeeTxn.wait();

                console.log("mined ", coffeeTxn.hash);

                console.log("coffee purchased!");

                // Clear the form fields.
                setName("");
                setMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getMemos = useCallback(async () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const buyMeACoffee = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );

                console.log("fetching memos from the blockchain..");
                const memos = await buyMeACoffee.getMemos();
                console.log("fetched!");
                setMemos(memos);
            } else {
                console.log("Metamask is not connected");
            }
        } catch (error) {
            console.log(error);
        }
    }, [contractABI]);

    useEffect(() => {
        let buyMeACoffee;
        isWalletConnected();
        getMemos();

        // Create an event handler function for when someone sends
        // us a new memo.
        const onNewMemo = (from, timestamp, name, message) => {
            console.log("Memo received: ", from, timestamp, name, message);
            setMemos((prevState) => [
                ...prevState,
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message,
                    name,
                },
            ]);
        };

        const { ethereum } = window;

        // Listen for new memo events.
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum, "any");
            const signer = provider.getSigner();
            buyMeACoffee = new ethers.Contract(
                contractAddress,
                contractABI,
                signer
            );

            buyMeACoffee.on("NewMemo", onNewMemo);
        }

        return () => {
            if (buyMeACoffee) {
                buyMeACoffee.off("NewMemo", onNewMemo);
            }
        };
    }, [contractABI, getMemos]);

    return (
        <div className={styles.container}>
            <Head>
                <title>Buy GodLikeMouse a Coffee!</title>
                <meta name="description" content="Tipping site" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Buy GodLikeMouse a Coffee!</h1>

                {currentAccount ? (
                    <div>
                        <form>
                            <div>
                                <label>Name</label>
                                <br />

                                <input
                                    id="name"
                                    type="text"
                                    placeholder="anon"
                                    defaultValue={name}
                                />
                            </div>
                            <br />
                            <div>
                                <label>Send Albert a message</label>
                                <br />

                                <textarea
                                    rows={3}
                                    placeholder="Enjoy your coffee!"
                                    id="message"
                                    onChange={onMessageChange}
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => buyCoffee("regular")}
                                >
                                    Send 1 regular Coffee for 0.001ETH
                                </button>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => buyCoffee("medium")}
                                >
                                    Send 1 medium Coffee for 0.003ETH
                                </button>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => buyCoffee("large")}
                                >
                                    Send 1 large Coffee for 0.005ETH
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button onClick={connectWallet}>
                        {" "}
                        Connect your wallet{" "}
                    </button>
                )}
            </main>

            {currentAccount && <h1>Memos received</h1>}

            {currentAccount &&
                memos.map((memo, idx) => {
                    return (
                        <div
                            key={idx}
                            style={{
                                border: "2px solid",
                                borderRadius: "5px",
                                padding: "5px",
                                margin: "5px",
                            }}
                        >
                            <p style={{ fontWeight: "bold" }}>
                                &quot;{memo.message}&quot;
                            </p>
                            <p>
                                From: {memo.name} at {memo.timestamp.toString()}
                            </p>
                        </div>
                    );
                })}

            <footer className={styles.footer}>
                <a
                    href="https://alchemy.com/?a=roadtoweb3weektwo"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Created by @thatguyintech for Alchemy@apos;s Road to Web3
                    lesson two!
                </a>
            </footer>
        </div>
    );
}
