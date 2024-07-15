import TreeABI from "../constants/TreeABI.json";
import { whitelist } from "../constants";
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';
import { ethers } from "ethers";
import dotenv from 'dotenv';
import Wrapper from "./Wrapper";
import { useContext, useEffect, useState } from 'react';
import { DataContext } from '../components/DataContext';
import { captureCanvasImage } from "../utils/captureCanvasImage";
import { useSwitchChain } from 'wagmi'
import { MerkleTree } from 'merkletreejs'

dotenv.config();

export default function LotteryEntrance() {
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.mintchain.io");
    const TreeContract = process.env.TREE_CONTRACT;

    const provide = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provide.getSigner();

    const contract = new ethers.Contract(TreeContract, TreeABI, provider);

    const { switchChain } = useSwitchChain()
    const { address, chainId } = useAccount();
    const unixTimestamp = Math.floor(Date.now() / 1000);
    const { data, setData, iref, cata, setCata } = useContext(DataContext);
    const [userData, setUserData] = useState(null);
    const [id, setId] = useState(null);
    const [minting, setMinting] = useState(false);
    const [tsupply, setTsupply] = useState(0);
    const [merkleProof, setMerkleProof] = useState(null)
    const [isFirstButtonVisible, setIsFirstButtonVisible] = useState(false);
    const [isSecondButtonVisible, setIsSecondButtonVisible] = useState(false);
    const [price, setPrice] = useState(null)

    const firstButtonUnixTime = 1720897300;
    const secondButtonUnixTime = firstButtonUnixTime + 100;


    const handleMerkleProof = () => {

        let proof = []

        if (whitelist.includes(address)) {
            const { keccak256 } = ethers.utils
            let leaves = whitelist.map((addr) => keccak256(addr))
            const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
            let hashedAddress = keccak256(address)
            proof = merkleTree.getHexProof(hashedAddress)
            setMerkleProof(proof)
        }
    }


    const listenToTreeMintedEvent = () => {
        contract.on("TreeMinted", (owner, tokenId, tokenURI, event) => {
            console.log("TreeMinted event detected:", owner, tokenId, tokenURI);
            fetchTotalSupply(); // Fetch the updated total supply when a mint event occurs
        });
    };

    const tokenID = async () => {
        const tid = await contract.totalSupply();
        setId(tid.toNumber());
        const userData = {
            contractAddress: process.env.TREE_CONTRACT,
            chainId: chainId,
            tokenId: tid.toNumber(),
            walletAddress: address,
            timestamp: unixTimestamp,
        };
        setUserData(userData);
    };

    async function mintTree(tokenId, URI, merkleProof) {
        const contractWithSigner = new ethers.Contract(TreeContract, TreeABI, signer);

        try {
            const transaction = await contractWithSigner.mintTree(tokenId, URI, merkleProof, {
                value: ethers.utils.parseEther(`${price}`),
            });
            console.log("Transaction sent:", transaction);
            return transaction;
        } catch (error) {
            if (error.code === ethers.errors.INSUFFICIENT_FUNDS) {
                console.log("Insufficient funds");
                handleFailedNotification("Insufficient funds in the wallet.");
            } else if (error.message.includes("reverted")) {
                console.log("Transaction reverted");
                handleFailedNotification("Transaction reverted: Ether value sent is below the price.");
            } else {
                console.log("Error:", error.message);
                handleFailedNotification(`Error: ${error.message}`);
            }
            throw error;
        }
    }

    const handleSuccessNotification = () => toast.success("Minted!");

    const handleFailedNotification = () => toast.error("Failed!");

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1);
            console.log("Transaction confirmed:", tx);
            handleSuccessNotification();
        } catch (error) {
            console.log("Transaction error:", error);
            handleFailedNotification();
        } finally {
            setMinting(false);
            setData(null)
            setCata(false)
            setId(null)
            setUserData(null)
        }
    };

    useEffect(() => {
        const currentTime = Math.floor(Date.now() / 1000);

        if (currentTime >= secondButtonUnixTime) {
            setIsFirstButtonVisible(false);
            setIsSecondButtonVisible(true);
        } else if (currentTime >= firstButtonUnixTime) {
            setIsFirstButtonVisible(true);
            setIsSecondButtonVisible(false);

            const timeUntilSecondButtonEnable = secondButtonUnixTime - currentTime;
            setTimeout(() => {
                setIsFirstButtonVisible(false);
                setIsSecondButtonVisible(true);
            }, timeUntilSecondButtonEnable * 1000);
        }
    }, [firstButtonUnixTime, secondButtonUnixTime]);

    useEffect(() => {
        if (userData && data) {
            const mintTreeProcess = async () => {
                try {
                    const URL = await captureCanvasImage(data);
                    const cleanUri = URL.replace('ipfs://', '');
                    const lastUri = `https://ipfs.io/ipfs/${cleanUri}`;
                    console.log(merkleProof)
                    const transaction = await mintTree(id, lastUri, merkleProof);
                    await handleSuccess(transaction);
                } catch (error) {
                    console.error("Minting process failed:", error);
                }
            };
            mintTreeProcess();
        }
    }, [userData, data, id]);

    const fetchTotalSupply = async () => {
        try {
            const total = await contract.totalSupply();
            setTsupply(total.toNumber());
        } catch (error) {
            console.error("Failed to fetch total supply:", error);
        }
    };

    useEffect(() => {
        fetchTotalSupply();
        listenToTreeMintedEvent(); // Set up the event listener
        handleMerkleProof()
        return () => {
            contract.off("TreeMinted"); // Clean up the event listener
        };
    }, []);
    return (
        <>
            <div className="p-5 flex h-[700px] w-[700px] items-center justify-center ">
                <div className="w-full max-w-2xl items-center justify-center bg-white border border-zinc-200 shadow dark:bg-zinc-950 dark:border-zinc-700">
                    <div className="p-5 m-10 ">
                        <div>
                            <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3 tracking-widest">TreeVerse</h5>
                            <p className="leading-6 text-m text-gray-900 dark:text-white mb-4">
                                TreeVerse is a limited-edition generative art collection on the Mint blockchain.
                                Using p5.js, it features a variety of intricate tree designs with unique traits.
                                <br /> Each piece symbolizes a commitment to preserving the natural world, blending technology and nature in a seamless digital experience.
                                <br /> TreeVerse offers a unique opportunity to own a digital representation of nature's beauty in the blockchain era.
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-l font-semibold text-gray-900 dark:text-white tracking-widest">Price: 0.001 ETH</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-l font-semibold text-gray-900 dark:text-white mt-2 tracking-widest">{tsupply} / 10,000 Minted</span>
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                {isFirstButtonVisible && (
                                    chainId == 185 ? (
                                        <button
                                            className={`bg-green-500 hover:bg-green-700 text-white font-bold px-20 py-3.5 mt-5 ${minting ? "opacity-50 cursor-not-allowed" : ""}`}
                                            onClick={async () => {
                                                if (merkleProof) {
                                                    setMinting(true);
                                                    setPrice("0.000001")
                                                    await tokenID();
                                                }
                                            }}
                                            disabled={minting}
                                        >
                                            {minting ? "Minting..." : "FirstMint"}
                                        </button>
                                    ) : (
                                        <button
                                            className={`bg-green-500 hover:bg-green-700 text-white font-bold px-20 py-3.5 mt-5`}
                                            onClick={() => switchChain({ chainId: 1687 })}
                                        >
                                            Switch to Mint Mainnet
                                        </button>
                                    )
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                {isSecondButtonVisible && (
                                    chainId == 185 ? (
                                        <button
                                            className={`bg-green-500 hover:bg-green-700 text-white font-bold px-20 py-3.5 mt-5 ${minting ? "opacity-50 cursor-not-allowed" : ""}`}
                                            onClick={async () => {
                                                setMinting(true);
                                                setPrice("0")
                                                setMerkleProof([])
                                                await tokenID();
                                            }}
                                            disabled={minting}
                                        >
                                            {minting ? "Minting..." : "SecondMint"}
                                        </button>
                                    ) : (
                                        <button
                                            className={`bg-green-500 hover:bg-green-700 text-white font-bold px-20 py-3.5 mt-5`}
                                            onClick={() => switchChain({ chainId: 1687 })}
                                        >
                                            Switch to Mint Mainnet
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Wrapper userData={userData} />
        </>
    );
}
