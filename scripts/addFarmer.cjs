// Add a trusted farmer to the contract
// Usage: npx hardhat --config hardhat.config.cjs run scripts/addFarmer.cjs --network sepolia
// Set FARMER_ADDRESS env variable or edit the address below

require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const farmerAddress = process.env.FARMER_ADDRESS || "PASTE_ADDRESS_HERE";
  
  if (farmerAddress === "PASTE_ADDRESS_HERE") {
    console.error("❌ Set FARMER_ADDRESS env variable or edit the script");
    process.exit(1);
  }

  const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
  const [deployer] = await ethers.getSigners();
  
  console.log("Adding trusted farmer...");
  console.log("Contract:", contractAddress);
  console.log("Farmer:", farmerAddress);
  console.log("Signed by:", deployer.address);

  const artifact = require("../src/artifacts/contracts/FoodTraceability.sol/FoodTraceability.json");
  const contract = new ethers.Contract(contractAddress, artifact.abi, deployer);

  const tx = await contract.addTrustedFarmer(farmerAddress);
  await tx.wait();

  console.log("✅ Farmer added successfully!");
  console.log("Tx hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
