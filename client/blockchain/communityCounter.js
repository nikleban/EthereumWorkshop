import { Contract } from "ethers";
import { getProvider } from "./provider.js";


export const COMMUNITY_COUNTER_ABI = [
    "function communityLeader() view returns (address)",
    "function counter() view returns (uint256)",
    "function wallet() view returns (uint256)",
    "function userIsInCommunity(address) view returns (bool)",
    "function getCommunityCount() view returns (uint256)",
    "function joinCommunity()",
    "function leaveCommunity()",
    "function donateToCommunity() payable",
    "function withdrawFundsFromCommunity()",
];

export const COMMUNITY_COUNTER_ADDRESSES = {
    local: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    sepolia: "0x11441FC4312938AaF02EcBE4373A2395cE2b7c4B",
    mainnet: null,
};

// Reads need only a provider, no private key
const readContract = (address) => new Contract(address, COMMUNITY_COUNTER_ABI, getProvider());

export const getCommunityCounterState = async (address) => {
    const provider = getProvider();
    const code = await provider.getCode(address);
    if (code === "0x") return { deployed: false };

    const contract = readContract(address);
    const [leader, counter, wallet, balance] = await Promise.all([
        contract.communityLeader(),
        contract.counter(),
        contract.wallet(),
        provider.getBalance(address),
    ]);
    return { deployed: true, leader, counter, wallet, balance };
}

export const isUserInCommunity = (address, user) => readContract(address).userIsInCommunity(user);

export const getCommunityCount = (address) => readContract(address).getCommunityCount();


// The require() message when there is one, else ethers' short error
export const getRevertReason = (error) => error?.reason ?? error?.shortMessage ?? error?.message ?? String(error);
