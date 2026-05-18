// Simulated IPFS storage
// In production, this would use Pinata, Infura IPFS, or web3.storage

const ipfsFiles = new Map();

function generateCID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let cid = 'Qm';
  for (let i = 0; i < 44; i++) cid += chars[Math.floor(Math.random() * chars.length)];
  return cid;
}

// Upload file to IPFS (simulated)
export function uploadToIPFS(file, type = 'image') {
  const cid = generateCID();
  ipfsFiles.set(cid, {
    name: file.name || 'unnamed',
    type,
    size: file.size || 0,
    uploadedAt: new Date().toISOString(),
    // In real app, file content would be on IPFS network
    url: `https://ipfs.io/ipfs/${cid}`,
    gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
  });
  return { cid, url: `https://ipfs.io/ipfs/${cid}` };
}

// Upload JSON metadata to IPFS
export function uploadMetadataToIPFS(metadata) {
  const cid = generateCID();
  ipfsFiles.set(cid, {
    name: 'metadata.json',
    type: 'json',
    content: metadata,
    uploadedAt: new Date().toISOString(),
    url: `https://ipfs.io/ipfs/${cid}`,
  });
  return { cid, url: `https://ipfs.io/ipfs/${cid}` };
}

// Get file info from IPFS
export function getFromIPFS(cid) {
  return ipfsFiles.get(cid) || { url: `https://ipfs.io/ipfs/${cid}`, type: 'unknown' };
}

export function getAllIPFSFiles() {
  return Array.from(ipfsFiles.entries()).map(([cid, data]) => ({ cid, ...data }));
}
