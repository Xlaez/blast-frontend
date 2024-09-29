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
    let provider;
    let signer: ethers.JsonRpcSigner | ethers.ContractRunner | null | undefined = null;

    const connectWallet = async () => {
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

    const transferEtherFromConnectedWallet = async () => {
        if(!recipientAddress || !amountToSend){
            setStatus("Please provide a recipient and an amount.");
            return;
        }

        try {
            if(signer?.sendTransaction){
                    const tx = await signer.sendTransaction({
                        to: recipientAddress,
                        value: ethers.parseEther(amountToSend),
                    });

                    await tx.wait();

                    setStatus("Transfer completed");
            }
        } catch (e:any) {
            console.error("Failed to transfer Ether", e);
            setStatus("Failed to transfer Ether");
        }
    }

    const transferEtherFromContract = async () => {
        if(!contract){
            setStatus("Contract is not initialized");
            return;
        }

        try {
                const amountInWei = ethers.parseEther(amountToSend);

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
         <div className="flex flex-col items-center bg-gray-900 text-purple-400 min-h-screen p-8">
      <h1 className="text-4xl font-bold text-purple-400 mb-6">
        Blast that ether!
      </h1>

       <h2 className="text-2xl font-bold mb-6">Ethereum Wallet Connection</h2>

      {walletAddress ? (
        <div className="w-full max-w-md bg-black shadow-lg rounded-lg p-6 text-center">
          <p className="text-lg text-gray-300">Connected Wallet:</p>
          <p className="text-xl font-bold text-purple-400 mb-4">
                {walletAddress ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(-3)}` : ""}
            </p>
          <p className="text-lg text-gray-300">Balance:</p>
          <p className="text-xl font-bold text-purple-400 mb-6">{balance} ETH</p>

          <button
            onClick={disconnectWallet}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
        >
          Connect Wallet
        </button>
      )}

     {walletAddress && (
        <div className="w-full max-w-md bg-black shadow-lg rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-300 mb-4">
            Transfer Ether
          </h2>
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 mb-4"
          />
          <input
            type="text"
            placeholder="Amount in Ether"
            value={amountToSend}
            onChange={(e) => setAmountToSend(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 mb-4"
          />

          <button
            onClick={transferEtherFromContract}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 mb-4"
          >
            Send Ether From Contract
          </button>

          <button
            onClick={transferEtherFromConnectedWallet}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Send Ether From Wallet
          </button>
        </div>
      )}

      <p className="text-lg text-gray-300 mt-6">{status}</p>
    </div>
    )
};

export default WalletConnect;