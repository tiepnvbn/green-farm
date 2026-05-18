import { useState } from "react";
import { harvestProduct, getAllProducts } from "../store/blockchainStore";
import { uploadToIPFS, uploadMetadataToIPFS } from "../store/ipfsStore";

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
  const [certFile, setCertFile] = useState(null);
  const [productImage, setProductImage] = useState(null);

  const farmerAddress = "0xFarmer001"; // Simulated wallet

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      // Upload to IPFS
      const certResult = uploadToIPFS(certFile || { name: "VietGAP_Certificate.pdf", size: 1024000 }, "certificate");
      const imgResult = uploadToIPFS(productImage || { name: "product_batch.jpg", size: 2048000 }, "image");
      const metaResult = uploadMetadataToIPFS({
        productName: form.productName,
        variety: form.variety,
        fertilizer: form.fertilizer,
        idealTemp: form.idealTemp,
        farmLocation: form.farmLocation,
        harvestDate: form.harvestDate,
      });

      // Call smart contract
      const txResult = harvestProduct({
        farmerAddress,
        ...form,
        ipfsCertHash: certResult.cid,
        ipfsImageHash: imgResult.cid,
        ipfsMetadataHash: metaResult.cid,
      });

      setResult({ ...txResult, ipfsCert: certResult.cid, ipfsImage: imgResult.cid, ipfsMeta: metaResult.cid });
      setForm({ productName: "", farmLocation: "", harvestDate: "", variety: "", fertilizer: "", idealTemp: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const products = getAllProducts().filter((p) => p.farmerAddress === farmerAddress);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-green-800">🧑‍🌾 Farmer App</h2>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Wallet: {farmerAddress}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Đăng ký lô hàng mới (harvestProduct)</h3>

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

        {/* IPFS Upload */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium text-sm text-gray-600">📎 Upload lên IPFS</h4>
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

        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 transition">
          🌱 Tạo lô hàng (Mint to Blockchain)
        </button>
      </form>

      {/* Result */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">❌ {error}</div>
      )}
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded space-y-2">
          <p className="font-semibold text-green-800">✅ Lô hàng đã được ghi lên Blockchain!</p>
          <div className="text-sm space-y-1">
            <p><strong>Product ID:</strong> {result.productId}</p>
            <p><strong>Tx Hash:</strong> <a href={`https://etherscan.io/tx/${result.txHash}`} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{result.txHash}</a></p>
            <p><strong>Block:</strong> #{result.blockNumber}</p>
            <p><strong>IPFS Cert:</strong> <a href={`https://ipfs.io/ipfs/${result.ipfsCert}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">{result.ipfsCert}</a></p>
            <p><strong>IPFS Image:</strong> <a href={`https://ipfs.io/ipfs/${result.ipfsImage}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">{result.ipfsImage}</a></p>
          </div>
        </div>
      )}

      {/* Product List */}
      {products.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">📦 Lô hàng của bạn ({products.length})</h3>
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex justify-between items-center border rounded p-3 text-sm">
                <div>
                  <span className="font-medium">{p.id}</span> - {p.productName}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  p.status === 'Harvested' ? 'bg-yellow-100 text-yellow-700' :
                  p.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                  p.status === 'Verified & On Sale' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
