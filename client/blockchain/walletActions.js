import provider from "@blockchain/provider";
import { ethers, randomBytes } from "ethers";

export const generateRandomPrivateKey = () =>{
    const privateKey = ethers.hexlify(randomBytes(32));
    return privateKey
}