import React, {useState} from "react";
import {ethers} from "ethers"
import { contractAbi } from "@/contractAbi";

const WalletConnect = () => {
    const [walletAddress, setWalletAddress] = useState("");
    const [balance, setBalance] = useState("");
    const [contractBalance, setContractBalance] =useState("");
    const [contract, setContract] = useState<ethers.Contract|null>(null);
    const [amountToSend, setAmountToSend] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [status, setStatus]= useState("");

    // Contract details
    const contractAddress = "0x60c3e6283541888415CF2366434a45d9bA00e095";
    const contractABI = contractAbi;

    const connectWallet = async () => {
        let provider;
        let signer = null;
        //@ts-expect-error
        if(typeof window.ethereum !== "undefined") {
            try {
                // Request wallet connection
        //@ts-expect-error
                const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
                const account =  accounts[0];
                setWalletAddress(account);

                // Setup ethers provider and contract instance
                //@ts-expect-error
                provider = new ethers.BrowserProvider(window.ethereum);
                signer = await provider.getSigner();

                const userBalance = await provider.getBalance(account);
                setBalance(ethers.formatEther(userBalance));

                const contractInstance = new ethers.Contract(contractAddress, contractABI as any, signer);

                setContract(contractInstance);
                
                const contractBalance = await provider.getBalance(contractAddress);
                setContractBalance(ethers.formatEther(contractBalance));

                setStatus("Wallet Connected");
            } catch (e:any) {
                console.error("Failed to connect wallet", e)
                setStatus("Failed to connect wallet");
            }
        }else{
                provider = ethers.getDefaultProvider();
                setStatus("Metamask not detected");
        }
    }

    const transferEther = async () => {
        if(!contract){
            setStatus("Contract is not initialized");
            return;
        }

        try {
                const amountInWei = ethers.parseEther(amountToSend);

                console.log(contract)

                const tx = await contract.transferEther(recipientAddress, amountInWei);
                await tx.wait();
                setStatus("Transfer completed");
        } catch (e:any) {
            console.error("Failed to transfer Ether", e);
            setStatus("Failed to transfer Ether");
        }
    }

    const disconnectWallet = () => {
    setWalletAddress("");
    setBalance("");
    setContract(null);
    setStatus("Wallet disconnected");
  };

    return(
        <div>
            <h1>Ethereum Wallet Connection </h1>

            {walletAddress ? (
                <div>
                    <p>Connected Wallet: {walletAddress}</p>
                    <p>Balance: {balance} ETH</p>

                      <button onClick={disconnectWallet}>Disconnect Wallet</button>
                </div>
            ): (
                <button onClick={connectWallet}>Connect Wallet</button>
            )
            }

            {walletAddress && (
                <div>
                    <h2>Transfer Ether</h2>
                    <input type="text" placeholder="Recipient Address" value={recipientAddress} onChange={(e)=> setRecipientAddress(e.target.value)}/>

                    <input type="text" placeholder="Amount in Ether" value={amountToSend} onChange={(e)=> setAmountToSend(e.target.value)}/>

                    <button onClick={transferEther}>Send Ether</button>
                </div>
            )}

            <p>Status: {status}</p>
        </div>
    )
};

export default WalletConnect;