import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
export default provider;

try {
    const latestBlockNumber = await provider.getBlockNumber();
    console.log("Latest block number: ", latestBlockNumber);
} catch {
    console.log("Docker is not running!!");
}