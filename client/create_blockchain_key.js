import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

console.log("privateKey: " + privateKey);
console.log("publicKey: " + account.publicKey);
console.log("Address: " + account.address);