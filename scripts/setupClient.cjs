// Quick script to add farmer + transfer ownership
// Uses ethers directly (not hardhat's ethers) to avoid resolveName issue
require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const RPC_URL = process.env.SEPOLIA_RPC_URL;
  const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
  const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;
  const FARMER_ADDRESS = "0xbe3AC2FAF7E81B412D1677eE264509b1f8738352";

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const artifact = require("../src/artifacts/contracts/FoodTraceability.sol/FoodTraceability.json");
  const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);

  console.log("Owner:", wallet.address);
  console.log("Adding farmer:", FARMER_ADDRESS);

  // 1. Add as trusted farmer
  const tx1 = await contract.addTrustedFarmer(FARMER_ADDRESS);
  await tx1.wait();
  console.log("✅ Added as trusted farmer. Tx:", tx1.hash);

  // 2. Transfer ownership so client can manage farmers
  const tx2 = await contract.transferOwnership(FARMER_ADDRESS);
  await tx2.wait();
  console.log("✅ Ownership transferred. Tx:", tx2.hash);
  console.log("New owner:", FARMER_ADDRESS);
}

main().catch(console.error);
