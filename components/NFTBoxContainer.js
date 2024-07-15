import { useState, useEffect } from "react"
import NFTBox from "./nftBox"
import TreeABI from "../constants/TreeABI.json"
import { useAccount } from 'wagmi'
import { ethers } from "ethers";
import dotenv from 'dotenv';
import { fetchIPFSData } from "../utils/fetchIPFSData"

export default function NFTBoxContainer() {
    const [balance, setBalance] = useState("")
    const [nftsData, setNftsData] = useState([])
    const provider = new ethers.providers.JsonRpcProvider("https://sepolia-testnet-rpc.mintchain.io");
    const TreeContract = process.env.TREE_CONTRACT;
    const contract = new ethers.Contract(TreeContract, TreeABI, provider);

    const { address, isConnecting, isConnected, isDisconnected, chainId } = useAccount();

    const listenToTreeMintedEvent = async () => {
        contract.on("TreeMinted", (owner, tokenId, tokenURI, event) => {
            updateUI()
        });
    };

    const balanceOfOwner = async () => {
        const balance = await contract.balanceOf(address)
        setBalance(balance.toNumber())
    }

    const fetchTokenIdsAndData = async () => {
        var tokensData = []
        for (var i = 0; i < balance; i++) {
            const tokenId = await contract.tokenOfOwnerByIndex(address, i)
            const tokenURI = await contract.tokenURI(tokenId)
            const data = await fetchIPFSData(tokenURI);
            tokensData.push({ tokenId: tokenId.toNumber(), tokenURI: tokenURI, ...data })
        }
        setNftsData(tokensData)
    }

    async function updateUI() {
        await balanceOfOwner()
        await fetchTokenIdsAndData()
    }

    useEffect(() => {
        listenToTreeMintedEvent();
        updateUI()
        return () => {
            contract.removeAllListeners("TreeMinted");
        };

    }, [isConnected]);

    useEffect(() => {
        if (isConnected) {
            updateUI()
        }
    }, [balance])

    useEffect(() => {
        if (isDisconnected) {
            setNftsData([]);
        }
    }, [isDisconnected]);

    return (
        !isConnected ? (
            <div className="flex flex-col items-center">
                <div>
                    <h5 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2 mt-10 tracking-widest">Please Connect your Wallet to View Your NFTs.</h5>
                </div>
            </div>
        ) : (
            nftsData.length > 0 ? (
                <div className="flex flex-col items-center">
                    <div className="flex justify-center items-center w-full  ">
                        <h5 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-8 pb-3 pt-3 mt-10 mb-10 tracking-widest border-b border-b-zinc-700 flex flex-row">Owned NFTs</h5>
                    </div>
                    <div className="flex flex-wrap justify-evenly w-full mb-5">
                        {nftsData.map((token, index) => (
                            <NFTBox key={index} name={token.name} image={token.image} description={token.description} attributes={token.attributes} />
                        ))}
                    </div>
                </div>
            ) : balance == 0 ? (
                <div className="flex flex-col items-center">
                    <h5 className="text-l font-semibold tracking-tight text-zinc-900 dark:text-white mb-2 mt-10 tracking-widest"></h5>
                </div>
            ) :
                (
                    <div className="flex flex-col items-center">
                        <h5 className="text-l font-semibold tracking-tight text-zinc-900 dark:text-white mb-2 mt-10 tracking-widest">Your NFT is being generated. Please wait a few minutes to view your unique artwork.<br></br> Thank you for your patience! Do not reload the page before seeing your NFT.</h5>
                    </div>
                )
        )
    )

}
