import { useState, useEffect } from "react";
import { harvestProduct, getAllProducts, isTrustedFarmer, addTrustedFarmer } from "../store/blockchainStore";
import { uploadToIPFS, uploadMetadataToIPFS, getIPFSUrl } from "../store/ipfsStore";
import { connectWallet, isMetaMaskInstalled, getContract } from "../store/web3Provider";

export default function Farmer() {
  const [form, setForm] = useState({
    productName: "",
    farmLocation: "",
    harvestDate: "",
    variety: "",
    fertilizer: "",
    idealTemp: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [certFile, setCertFile] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [products, setProducts] = useState([]);
  const [isFarmer, setIsFarmer] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [newFarmerAddr, setNewFarmerAddr] = useState("");
  const [adminMsg, setAdminMsg] = useState("");

  useEffect(() => {
    if (isMetaMaskInstalled()) {
      connectWallet()
        .then(async ({ address }) => {
          setWallet(address);
          const trusted = await isTrustedFarmer(address);
          setIsFarmer(trusted);
          // Check if connected wallet is contract owner
          try {
            const contract = await getContract();
            const owner = await contract.owner();
            setIsOwner(owner.toLowerCase() === address.toLowerCase());
          } catch {}
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (wallet) {
      getAllProducts().then((all) => {
        setProducts(all.filter((p) => p.farmerAddress.toLowerCase() === wallet.toLowerCase()));
      });
    }
  }, [wallet, result]);

  const handleConnect = async () => {
    try {
      const { address } = await connectWallet();
      setWallet(address);
      const trusted = await isTrustedFarmer(address);
      setIsFarmer(trusted);
      try {
        const contract = await getContract();
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === address.toLowerCase());
      } catch {}
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddFarmer = async () => {
    if (!newFarmerAddr) return;
    setAdminMsg("");
    try {
      await addTrustedFarmer(newFarmerAddr);
      setAdminMsg(`✅ Đã thêm ${newFarmerAddr} làm Trusted Farmer`);
      setNewFarmerAddr("");
      // Refresh own status
      const trusted = await isTrustedFarmer(wallet);
      setIsFarmer(trusted);
    } catch (err) {
      setAdminMsg(`❌ Lỗi: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      let ipfsCertHash = "";
      let ipfsImageHash = "";
      let ipfsMetadataHash = "";

      if (certFile) {
        const certResult = await uploadToIPFS(certFile, "certificate");
        ipfsCertHash = certResult.cid;
      }

      if (productImage) {
        const imgResult = await uploadToIPFS(productImage, "image");
        ipfsImageHash = imgResult.cid;
      }

      const metaResult = await uploadMetadataToIPFS({
        productName: form.productName,
        variety: form.variety,
        fertilizer: form.fertilizer,
        idealTemp: form.idealTemp,
        farmLocation: form.farmLocation,
        harvestDate: form.harvestDate,
      });
      ipfsMetadataHash = metaResult.cid;

      // Triggers MetaMask popup
      const txResult = await harvestProduct({
        productName: form.productName,
        farmLocation: form.farmLocation,
        harvestDate: form.harvestDate,
        ipfsCertHash,
        ipfsImageHash,
        ipfsMetadataHash,
      });

      setResult({ ...txResult, ipfsCert: ipfsCertHash, ipfsImage: ipfsImageHash, ipfsMeta: ipfsMetadataHash });
      setForm({ productName: "", farmLocation: "", harvestDate: "", variety: "", fertilizer: "", idealTemp: "" });
      setCertFile(null);
      setProductImage(null);
    } catch (err) {
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-green-800">🧑‍🌾 Farmer App</h2>
        {wallet ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-mono">
            🔗 {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </span>
        ) : (
          <button onClick={handleConnect} className="text-xs bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600">
            🦊 Connect MetaMask
          </button>
        )}
        {isFarmer === false && wallet && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">⚠️ Not a Trusted Farmer</span>
        )}
        {isFarmer === true && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Trusted Farmer</span>
        )}
      </div>

      {!isMetaMaskInstalled() && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          ⚠️ MetaMask chưa được cài đặt. Vui lòng cài extension MetaMask để sử dụng.
        </div>
      )}

      {isFarmer === false && wallet && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded">
          ⚠️ Ví <strong className="font-mono text-xs break-all">{wallet}</strong> chưa được đăng ký Trusted Farmer. 
          Liên hệ quản trị viên (contract owner) để được thêm vào danh sách.
          <br/><span className="text-xs text-gray-500">Gửi địa chỉ ví trên cho admin để được cấp quyền.</span>
        </div>
      )}

      {isOwner && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded space-y-3">
          <h3 className="font-semibold text-blue-800">🔐 Admin Panel - Quản lý Trusted Farmer</h3>
          <p className="text-sm text-blue-700">Bạn là Contract Owner. Thêm địa chỉ ví vào danh sách Trusted Farmer để cho phép họ tạo lô hàng.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFarmerAddr}
              onChange={(e) => setNewFarmerAddr(e.target.value)}
              placeholder="0x... (địa chỉ ví farmer)"
              className="flex-1 border rounded px-3 py-2 text-sm font-mono"
            />
            <button
              onClick={handleAddFarmer}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              ➕ Thêm Farmer
            </button>
          </div>
          {adminMsg && <p className="text-sm">{adminMsg}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Đăng ký lô hàng mới (harvestProduct → Mint NFT)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
            <input type="text" required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: Xoài Cát Hòa Lộc" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nơi trồng *</label>
            <input type="text" required value={form.farmLocation} onChange={(e) => setForm({ ...form, farmLocation: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: Tiền Giang, Việt Nam" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thu hoạch *</label>
            <input type="date" required value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giống cây</label>
            <input type="text" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: Cát Hòa Lộc" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại phân bón</label>
            <input type="text" value={form.fertilizer} onChange={(e) => setForm({ ...form, fertilizer: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: Phân hữu cơ vi sinh" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhiệt độ bảo quản (°C)</label>
            <input type="number" value={form.idealTemp} onChange={(e) => setForm({ ...form, idealTemp: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: 13" />
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium text-sm text-gray-600">📎 Upload lên IPFS (Pinata)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Chứng chỉ VietGAP/GlobalGAP</label>
              <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setCertFile(e.target.files[0])} className="text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ảnh lô hàng</label>
              <input type="file" accept=".jpg,.png" onChange={(e) => setProductImage(e.target.files[0])} className="text-sm" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !wallet || isFarmer === false}
          className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "⏳ Đang xử lý (check MetaMask)..." : "🌱 Tạo lô hàng (Mint NFT to Blockchain)"}
        </button>
      </form>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">❌ {error}</div>}

      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded space-y-2">
          <p className="font-semibold text-green-800">✅ Lô hàng đã được ghi lên Blockchain (NFT Minted)!</p>
          <div className="text-sm space-y-1">
            <p><strong>Product ID:</strong> {result.productId}</p>
            <p><strong>Token ID (NFT):</strong> #{result.tokenId}</p>
            <p><strong>Tx Hash:</strong> <a href={result.etherscanUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{result.txHash}</a></p>
            <p><strong>Block:</strong> #{result.blockNumber}</p>
            {result.ipfsCert && <p><strong>IPFS Cert:</strong> <a href={getIPFSUrl(result.ipfsCert)} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{result.ipfsCert}</a></p>}
            {result.ipfsImage && <p><strong>IPFS Image:</strong> <a href={getIPFSUrl(result.ipfsImage)} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{result.ipfsImage}</a></p>}
            {result.ipfsMeta && <p><strong>IPFS Metadata:</strong> <a href={getIPFSUrl(result.ipfsMeta)} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{result.ipfsMeta}</a></p>}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">📦 Lô hàng của bạn ({products.length})</h3>
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex justify-between items-center border rounded p-3 text-sm">
                <div><span className="font-medium">{p.id}</span> - {p.productName}</div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  p.status === 'Harvested' ? 'bg-yellow-100 text-yellow-700' :
                  p.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                  p.status === 'Verified & On Sale' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
