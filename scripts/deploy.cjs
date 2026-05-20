const hre = require("hardhat");

async function main() {
  console.log("Deploying FoodTraceability contract...");

  const FoodTraceability = await hre.ethers.getContractFactory("FoodTraceability");
  const contract = await FoodTraceability.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`✅ FoodTraceability deployed to: ${address}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`\nAdd this to your .env file:`);
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
