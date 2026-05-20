// IPFS Storage via Pinata API
// Uploads real files to IPFS and returns real CIDs

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs";

/**
 * Upload a file (image/PDF) to IPFS via Pinata
 * @param {File} file - The file to upload
 * @param {string} type - Type label (certificate, image)
 * @returns {Promise<{cid: string, url: string}>}
 */
export async function uploadToIPFS(file, type = "image") {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API keys not configured. Check .env file.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: `${type}_${file.name}`,
    keyvalues: { type, uploadedAt: new Date().toISOString() },
  });
  formData.append("pinataMetadata", metadata);

  const response = await fetch(PINATA_UPLOAD_URL, {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`IPFS upload failed: ${err}`);
  }

  const data = await response.json();
  return {
    cid: data.IpfsHash,
    url: `${IPFS_GATEWAY}/${data.IpfsHash}`,
  };
}

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param {Object} metadata - The metadata object
 * @returns {Promise<{cid: string, url: string}>}
 */
export async function uploadMetadataToIPFS(metadata) {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API keys not configured. Check .env file.");
  }

  const body = {
    pinataContent: metadata,
    pinataMetadata: {
      name: `metadata_${Date.now()}.json`,
    },
  };

  const response = await fetch(PINATA_JSON_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`IPFS metadata upload failed: ${err}`);
  }

  const data = await response.json();
  return {
    cid: data.IpfsHash,
    url: `${IPFS_GATEWAY}/${data.IpfsHash}`,
  };
}

/**
 * Get IPFS gateway URL from CID
 */
export function getIPFSUrl(cid) {
  if (!cid) return null;
  return `${IPFS_GATEWAY}/${cid}`;
}

