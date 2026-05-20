// Blockchain Store - Real Web3 interaction with deployed Smart Contract
import { getContract, getReadOnlyContract, getEtherscanUrl } from "./web3Provider";

const STATUS_MAP = ["Harvested", "In Transit", "Verified & On Sale", "Rejected", "Sold"];

/**
 * Parse product data from contract to frontend format
 */
function parseProduct(tokenId, productData, transitData) {
  const timeline = [];

  // Add harvest event
  timeline.push({
    action: "Harvested",
    actor: productData.farmer,
    timestamp: new Date(Number(productData.createdAt) * 1000).toISOString(),
    details: `Product harvested at ${productData.farmLocation}`,
  });

  // Add transit events
  const transitUpdates = [];
  if (transitData && transitData.length > 0) {
    for (const t of transitData) {
      const update = {
        location: t.location,
        temperature: t.temperature,
        humidity: t.humidity,
        notes: t.notes,
        carrierAddress: t.carrier,
        timestamp: new Date(Number(t.timestamp) * 1000).toISOString(),
      };
      transitUpdates.push(update);
      timeline.push({
        action: "Transit Update",
        actor: t.carrier,
        timestamp: update.timestamp,
        details: `Location: ${t.location} | Temp: ${t.temperature}°C`,
      });
    }
  }

  // Add verify event if applicable
  if (Number(productData.status) >= 2 && productData.retailer !== "0x0000000000000000000000000000000000000000") {
    timeline.push({
      action: Number(productData.status) === 3 ? "Received & Rejected" : "Received & Verified",
      actor: productData.retailer,
      timestamp: new Date().toISOString(),
      details: Number(productData.status) === 3 ? "Product rejected" : "Product verified and ready for sale",
    });
  }

  return {
    id: `GF-${tokenId}`,
    tokenId: Number(tokenId),
    productName: productData.productName,
    farmLocation: productData.farmLocation,
    harvestDate: productData.harvestDate,
    ipfsCertHash: productData.ipfsCertHash,
    ipfsImageHash: productData.ipfsImageHash,
    ipfsMetadataHash: productData.ipfsMetadataHash,
    farmerAddress: productData.farmer,
    retailerAddress: productData.retailer,
    status: STATUS_MAP[Number(productData.status)] || "Unknown",
    createdAt: new Date(Number(productData.createdAt) * 1000).toISOString(),
    timeline,
    transitUpdates,
  };
}

/**
 * harvestProduct - Farmer mints new product NFT
 * Triggers MetaMask popup for signing
 */
export async function harvestProduct({ productName, farmLocation, harvestDate, ipfsCertHash, ipfsImageHash, ipfsMetadataHash }) {
  const contract = await getContract();

  const tx = await contract.harvestProduct(
    productName,
    farmLocation,
    harvestDate,
    ipfsCertHash || "",
    ipfsImageHash || "",
    ipfsMetadataHash || ""
  );

  // Wait for transaction to be mined
  const receipt = await tx.wait();
  const tokenId = await contract.getTokenCounter();

  return {
    productId: `GF-${tokenId}`,
    tokenId: Number(tokenId),
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    etherscanUrl: getEtherscanUrl(receipt.hash),
  };
}

/**
 * updateTransitStatus - Logistics updates location
 * Triggers MetaMask popup
 */
export async function updateTransitStatus({ tokenId, location, temperature, humidity, notes }) {
  const contract = await getContract();

  const tx = await contract.updateTransitStatus(
    tokenId,
    location,
    temperature || "N/A",
    humidity || "N/A",
    notes || ""
  );

  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    etherscanUrl: getEtherscanUrl(receipt.hash),
  };
}

/**
 * receiveAndVerify - Retailer verifies product
 * If verified, NFT is transferred to retailer
 * Triggers MetaMask popup
 */
export async function receiveAndVerify({ tokenId, verified }) {
  const contract = await getContract();

  const tx = await contract.receiveAndVerify(tokenId, verified);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    verified,
    etherscanUrl: getEtherscanUrl(receipt.hash),
  };
}

/**
 * markAsSold - Owner marks product as sold
 */
export async function markAsSold({ tokenId }) {
  const contract = await getContract();
  const tx = await contract.markAsSold(tokenId);
  const receipt = await tx.wait();
  return {
    txHash: tx.hash,
    etherscanUrl: getEtherscanUrl(receipt.hash),
  };
}

/**
 * getProduct - Read product data from blockchain
 */
export async function getProduct(tokenId) {
  try {
    const contract = await getReadOnlyContract();
    const numericId = typeof tokenId === "string" ? parseInt(tokenId.replace("GF-", "")) : tokenId;
    const productData = await contract.getProduct(numericId);
    if (!productData.farmer || productData.farmer === "0x0000000000000000000000000000000000000000") {
      return null;
    }
    const transitData = await contract.getTransitHistory(numericId);
    return parseProduct(numericId, productData, transitData);
  } catch (e) {
    console.error("getProduct error:", e);
    return null;
  }
}

/**
 * getAllProducts - Fetch all products from blockchain
 */
export async function getAllProducts() {
  try {
    const contract = await getReadOnlyContract();
    const counter = await contract.getTokenCounter();
    const total = Number(counter);
    const products = [];

    for (let id = 1001; id <= total; id++) {
      try {
        const productData = await contract.getProduct(id);
        if (productData.farmer && productData.farmer !== "0x0000000000000000000000000000000000000000") {
          const transitData = await contract.getTransitHistory(id);
          products.push(parseProduct(id, productData, transitData));
        }
      } catch (e) {
        continue;
      }
    }
    return products;
  } catch (e) {
    console.error("getAllProducts error:", e);
    return [];
  }
}

/**
 * searchProducts - Search products by keyword
 */
export async function searchProducts(keyword) {
  if (!keyword) return [];
  const kw = keyword.trim().toLowerCase();
  const all = await getAllProducts();
  return all.filter(
    (p) =>
      p.id.toLowerCase().includes(kw) ||
      p.productName.toLowerCase().includes(kw) ||
      p.farmLocation.toLowerCase().includes(kw)
  );
}

/**
 * Check if address is trusted farmer
 */
export async function isTrustedFarmer(address) {
  try {
    const contract = await getReadOnlyContract();
    return await contract.isTrustedFarmer(address);
  } catch (e) {
    return false;
  }
}

/**
 * Add trusted farmer (only contract owner)
 */
export async function addTrustedFarmer(farmerAddress) {
  const contract = await getContract();
  const tx = await contract.addTrustedFarmer(farmerAddress);
  await tx.wait();
  return { txHash: tx.hash };
}
