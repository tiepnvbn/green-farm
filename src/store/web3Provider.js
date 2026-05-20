// Web3 Provider - MetaMask connection
import { BrowserProvider, Contract } from "ethers";

const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || "11155111";
const NETWORK_NAME = import.meta.env.VITE_NETWORK_NAME || "Sepolia";
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const ETHERSCAN_URL = import.meta.env.VITE_ETHERSCAN_URL || "https://sepolia.etherscan.io";

// ABI will be imported after contract compilation
let contractABI = null;

export function getEtherscanUrl(txHash) {
  return `${ETHERSCAN_URL}/tx/${txHash}`;
}

export function getEtherscanAddressUrl(address) {
  return `${ETHERSCAN_URL}/address/${address}`;
}

/**
 * Load contract ABI from compiled artifacts
 */
async function loadABI() {
  if (contractABI) return contractABI;
  try {
    const artifact = await import("../artifacts/contracts/FoodTraceability.sol/FoodTraceability.json");
    contractABI = artifact.default.abi || artifact.abi;
    return contractABI;
  } catch (e) {
    throw new Error("Contract ABI not found. Run 'npm run compile' first.");
  }
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled() {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

/**
 * Connect to MetaMask and return signer
 */
export async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask chưa được cài đặt. Vui lòng cài MetaMask extension.");
  }

  const provider = new BrowserProvider(window.ethereum);
  
  // Request account access
  await window.ethereum.request({ method: "eth_requestAccounts" });

  // Check network
  const network = await provider.getNetwork();
  if (network.chainId.toString() !== CHAIN_ID) {
    // Switch to correct network
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + parseInt(CHAIN_ID).toString(16) }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Add network if not available
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x" + parseInt(CHAIN_ID).toString(16),
            chainName: NETWORK_NAME,
            rpcUrls: ["https://rpc.sepolia.org"],
            blockExplorerUrls: [ETHERSCAN_URL],
            nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
          }],
        });
      } else {
        throw new Error(`Vui lòng chuyển sang mạng ${NETWORK_NAME} trong MetaMask.`);
      }
    }
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
}

/**
 * Get connected account address (without prompting)
 */
export async function getConnectedAddress() {
  if (!isMetaMaskInstalled()) return null;
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return accounts.length > 0 ? accounts[0] : null;
}

/**
 * Get contract instance with signer (for write operations)
 */
export async function getContract() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured. Check .env file (VITE_CONTRACT_ADDRESS).");
  }
  const abi = await loadABI();
  const { signer } = await connectWallet();
  return new Contract(CONTRACT_ADDRESS, abi, signer);
}

/**
 * Get contract instance with provider (for read-only operations)
 */
export async function getReadOnlyContract() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured. Check .env file (VITE_CONTRACT_ADDRESS).");
  }
  const abi = await loadABI();
  const provider = new BrowserProvider(window.ethereum);
  return new Contract(CONTRACT_ADDRESS, abi, provider);
}

/**
 * Listen for account/network changes
 */
export function onAccountChange(callback) {
  if (isMetaMaskInstalled()) {
    window.ethereum.on("accountsChanged", callback);
  }
}

export function onNetworkChange(callback) {
  if (isMetaMaskInstalled()) {
    window.ethereum.on("chainChanged", callback);
  }
}
