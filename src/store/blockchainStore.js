// Simulated blockchain store - in real app this would interact with smart contract via ethers.js
// This simulates the FoodTraceability smart contract

const products = new Map();
let productCounter = 1000;

// Simulated trusted farmers
const trustedFarmers = ['0xFarmer001', '0xFarmer002', '0xFarmer003'];

function generateTxHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)];
  return hash;
}

function generateBlockNumber() {
  return Math.floor(18000000 + Math.random() * 1000000);
}

// harvestProduct() - Farmer creates new batch
export function harvestProduct({ farmerAddress, productName, farmLocation, harvestDate, variety, fertilizer, idealTemp, ipfsCertHash, ipfsImageHash, ipfsMetadataHash }) {
  if (!trustedFarmers.includes(farmerAddress)) {
    throw new Error('Access Denied: Address not in Trusted Farmers list');
  }

  const productId = `GF-${++productCounter}`;
  const txHash = generateTxHash();
  const blockNumber = generateBlockNumber();

  const product = {
    id: productId,
    productName,
    farmLocation,
    harvestDate,
    variety,
    fertilizer,
    idealTemp,
    farmerAddress,
    status: 'Harvested',
    ipfsCertHash,
    ipfsImageHash,
    ipfsMetadataHash,
    timeline: [
      {
        action: 'Harvested',
        actor: farmerAddress,
        timestamp: new Date().toISOString(),
        txHash,
        blockNumber,
        details: `Product harvested at ${farmLocation}`,
      }
    ],
    transitUpdates: [],
    createdAt: new Date().toISOString(),
  };

  products.set(productId, product);
  return { productId, txHash, blockNumber };
}

// updateTransitStatus() - Logistics updates location & conditions
export function updateTransitStatus({ productId, carrierAddress, location, temperature, humidity, notes }) {
  const product = products.get(productId);
  if (!product) throw new Error('Product not found');
  if (product.status === 'Sold') throw new Error('Cannot update: Product already marked as Sold');

  const txHash = generateTxHash();
  const blockNumber = generateBlockNumber();

  product.status = 'In Transit';
  const update = {
    location,
    temperature,
    humidity,
    notes,
    carrierAddress,
    timestamp: new Date().toISOString(),
    txHash,
    blockNumber,
  };
  product.transitUpdates.push(update);
  product.timeline.push({
    action: 'Transit Update',
    actor: carrierAddress,
    timestamp: update.timestamp,
    txHash,
    blockNumber,
    details: `Location: ${location} | Temp: ${temperature}°C`,
  });

  products.set(productId, product);
  return { txHash, blockNumber };
}

// receiveAndVerify() - Retailer confirms receipt
export function receiveAndVerify({ productId, retailerAddress, verified, notes }) {
  const product = products.get(productId);
  if (!product) throw new Error('Product not found');
  if (product.status === 'Sold') throw new Error('Product already sold');

  const txHash = generateTxHash();
  const blockNumber = generateBlockNumber();

  product.status = verified ? 'Verified & On Sale' : 'Rejected';
  product.retailerAddress = retailerAddress;
  product.timeline.push({
    action: verified ? 'Received & Verified' : 'Received & Rejected',
    actor: retailerAddress,
    timestamp: new Date().toISOString(),
    txHash,
    blockNumber,
    details: notes || (verified ? 'Product verified and ready for sale' : 'Product rejected'),
  });

  products.set(productId, product);
  return { txHash, blockNumber };
}

// Mark as sold
export function markAsSold({ productId }) {
  const product = products.get(productId);
  if (!product) throw new Error('Product not found');
  product.status = 'Sold';
  const txHash = generateTxHash();
  product.timeline.push({
    action: 'Sold',
    actor: 'Consumer',
    timestamp: new Date().toISOString(),
    txHash,
    blockNumber: generateBlockNumber(),
    details: 'Product purchased by consumer',
  });
  products.set(productId, product);
  return { txHash };
}

// Query product
export function getProduct(productId) {
  return products.get(productId) || null;
}

// Get all products
export function getAllProducts() {
  return Array.from(products.values());
}

// Search products by keyword (contains, case-insensitive)
export function searchProducts(keyword) {
  if (!keyword) return [];
  const kw = keyword.trim().toLowerCase();
  return Array.from(products.values()).filter((p) =>
    p.id.toLowerCase().includes(kw) ||
    p.productName.toLowerCase().includes(kw) ||
    p.farmLocation.toLowerCase().includes(kw)
  );
}

// Seed demo data
export function seedDemoData() {
  if (products.size > 0) return;

  harvestProduct({
    farmerAddress: '0xFarmer001',
    productName: 'Xoài Cát Hòa Lộc',
    farmLocation: 'Tiền Giang, Việt Nam',
    harvestDate: '2026-05-10',
    variety: 'Cát Hòa Lộc',
    fertilizer: 'Phân hữu cơ vi sinh',
    idealTemp: '13',
    ipfsCertHash: 'QmXoaiCert123abc456def789ghi012jkl345mno678pqr',
    ipfsImageHash: 'QmXoaiImg123abc456def789ghi012jkl345mno678pqr',
    ipfsMetadataHash: 'QmXoaiMeta123abc456def789ghi012jkl345mno678pq',
  });

  const firstId = Array.from(products.keys())[0];

  updateTransitStatus({
    productId: firstId,
    carrierAddress: '0xLogistics001',
    location: 'Kho lạnh Bình Dương',
    temperature: '14',
    humidity: '85',
    notes: 'Đóng gói xong, bắt đầu vận chuyển',
  });

  updateTransitStatus({
    productId: firstId,
    carrierAddress: '0xLogistics001',
    location: 'Trung tâm phân phối TP.HCM',
    temperature: '13',
    humidity: '82',
    notes: 'Đã đến trung tâm phân phối',
  });

  receiveAndVerify({
    productId: firstId,
    retailerAddress: '0xRetailer001',
    verified: true,
    notes: 'Hàng đạt chuẩn, nhiệt độ ổn định',
  });
}
