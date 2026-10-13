import { ethers, randomBytes, SigningKey, formatEther, computeAddress, Wallet } from "ethers";
import { FUNDED_ETH_PRIVATE_KEYS, getProvider, getActiveNetwork } from "./provider.js";
import { DOCKER_CHAIN_ID, SEPOLIA_CHAIN_ID } from "./networks.js";
import axios from "axios";


export const generateRandomPrivateKey = () =>{
    const privateKey = ethers.hexlify(randomBytes(32));
    const wallet = new Wallet(privateKey)
    return privateKey
}

export const generateRandomETHAddress = () =>{
    const privateKey = generateRandomPrivateKey();

    const ethAddress = computeAddress(privateKey);
    return ethAddress;
}

export const getBalance = async (ethAddress) => {
    const provider = getProvider();
    return await provider.getBalance(ethAddress);
}

export const getTransactionCount = async (ethAddress) => {
    const provider = getProvider();
    return await provider.getTransactionCount(ethAddress);
}

export const isEthAddressContract = async (ethAddress) => {
    const provider = getProvider();
    const code = await provider.getCode(ethAddress);
    return code !== "0x";
}

export const sendEthTest = async (ethAddress, amount) => {
    const provider = getProvider();
    const network = await provider.getNetwork()
    console.log(network.chainId);
    if (Number(network.chainId) === DOCKER_CHAIN_ID) {
        return await sendEthLocally(ethAddress, amount);
    } else if (Number(network.chainId) === SEPOLIA_CHAIN_ID){
        // The server signs and broadcasts; we only get the hash back
        const { data } = await axios.post(`/api/faucet`, {address: ethAddress});
        return await provider.waitForTransaction(data.hash);
    } else {
        throw Error("Network does not exist!");
    }
}

// Only the local path takes an amount; the faucet sends a fixed amount set on the server
const sendEthLocally = async (ethAddress, amount) => {
    if (amount === undefined) throw Error("Amount is required!");
    if (Number(formatEther(amount)) > 0.5) {
        throw Error("Amount is to large!");
    }

    const provider = getProvider();
    for (const privateKey of FUNDED_ETH_PRIVATE_KEYS) {
        const wallet = new Wallet(privateKey, provider);
        const balance = await provider.getBalance(wallet.address);
        if (amount > balance) continue;

        const transaction = await wallet.sendTransaction({
            to: ethAddress,
            value: amount,
        })
        return await transaction.wait();
    }
    throw Error("No funded test account could send");
}

export const getTransactionHistory = async (ethAddress) => {
    console.log(ethAddress)
    const provider = getProvider();
    const network = getActiveNetwork();
    if (network === "local") {
        // get local transactions logic
    } else {
        const params = {
            withMetadata: true,
        }
        if (Number(network.chainId) === SEPOLIA_CHAIN_ID) {
            params["category"] = ["erc721", "erc1155", "external"]
        } else {
            params["category"] = ["erc721", "erc1155", "external", "internal"]
        }
        const fromParams = {...params, "fromAddress": ethAddress};
        const fromResults =await getTransactionHistoryAlchemy(fromParams, provider);
        const toParams = {...params, "toAddress": ethAddress};
        const toResults = await getTransactionHistoryAlchemy(fromParams, provider);

        return { fromCount: fromResults.length, toCount: toResults.length, fromTransaction: fromResults, toTransactions: toResults };
    }
}

const getTransactionHistoryAlchemy = async (fromParams, provider) => {
    let allResults = [];
    while(true) {
        const response = await provider.send("alchemy_getAssetTransfers", [fromParams]);
        console.log(response)
        allResults = allResults.concat(response?.transfers);
        if (!response?.pageKey) break;
        fromParams["pageKey"] = response.pageKey;
    }
    return allResults;
}