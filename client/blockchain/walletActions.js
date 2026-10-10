import { ethers, randomBytes, SigningKey, computeAddress, Wallet } from "ethers";
import { FUNDED_ETH_PRIVATE_KEYS } from "@blockchain/provider";

export const generateRandomPrivateKey = () =>{
    const privateKey = ethers.hexlify(randomBytes(32));
    return privateKey
}

export const generateRandomETHAddress = () =>{
    const privateKey = generateRandomPrivateKey();

    const ethAddress = computeAddress(privateKey);
    return ethAddress;
}

export const getBalance = async (provider, ethAddress) => {
    return await provider.getBalance(ethAddress);
}

export const getTransactionCount = async (provider, ethAddress) => {
    return await provider.getTransactionCount(ethAddress);
}

export const isEthAddressContract = async (provider, ethAddress) => {
    console.log(provider)
    const code = await provider.getCode(ethAddress);
    return code !== "0x";
}

export const sendEthTest = async (provider, ethAddress, amount) => {
    const network = await provider.getNetwork();

    if (![BigInt(import.meta.env.VITE_SEPOLIA_RPC_CHAIN_ID), BigInt(11155111),].includes(network.chainId)) {
        console.log("Wrong chain selected!!");
        return;
    }

    const isLocalChain = BigInt(import.meta.env.VITE_SEPOLIA_RPC_CHAIN_ID) === network.chainId;

    if (isLocalChain) sendTestEthOnLocalEnv(provider, ethAddress, amount);
    else sendTestEthOnSopheliaNetwork(provxider, ethAddress, amount);

    console.log("Not enough FUNDS in test accounts");
}

const sendTestEthOnLocalEnv = async (provider, ethAddress, amount) => {
    for (const privateKey of FUNDED_ETH_PRIVATE_KEYS) {
        const wallet = new Wallet(privateKey, provider)
        try {
            const transaction = await wallet.sendTransaction({
                to: ethAddress,
                value: amount,
            })
            return transaction;
        } catch (error) {
            console.log(error);
            continue;
        }
    }
}


const sendTestEthOnSopheliaNetwork = async (provider, ethAddress, amount) => {
    return;
}