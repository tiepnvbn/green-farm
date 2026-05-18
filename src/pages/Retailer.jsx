import { useState } from "react";
import { receiveAndVerify, getAllProducts } from "../store/blockchainStore";

export default function Retailer() {
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const retailerAddress = "0xRetailer001";
  const products = getAllProducts();
  const pendingProducts = products.filter((p) => p.status === "In Transit");
  const verifiedProducts = products.filter((p) => p.status === "Verified & On Sale");

  const handleVerify = (verified) => {
    setError("");
    setResult(null);
    try {
      const txResult = receiveAndVerify({
        productId: selectedId,
        retailerAddress,
        verified,
        notes,
      });
      setResult({ ...txResult, verified });
      setSelectedId("");
      setNotes("");
    } catch (err) {
      setError(err.message);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-purple-800">🏪 Retailer Page</h2>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
          Retailer: {retailerAddress}
        </span>
      </div>

      {/* Receive & Verify */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Nhận hàng & Xác minh (receiveAndVerify)</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lô hàng đang vận chuyển</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
            <option value="">-- Chọn lô hàng cần xác nhận --</option>
            {pendingProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.id} - {p.productName}</option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="bg-gray-50 rounded p-4 text-sm space-y-2">
            <p><strong>Sản phẩm:</strong> {selectedProduct.productName}</p>
            <p><strong>Nông trại:</strong> {selectedProduct.farmLocation}</p>
            <p><strong>Ngày thu hoạch:</strong> {selectedProduct.harvestDate}</p>
            <p><strong>Số lần cập nhật vận chuyển:</strong> {selectedProduct.transitUpdates.length}</p>
            {selectedProduct.transitUpdates.length > 0 && (
              <p><strong>Nhiệt độ cuối:</strong> {selectedProduct.transitUpdates[selectedProduct.transitUpdates.length - 1].temperature}°C</p>
            )}
            <p><strong>IPFS Cert:</strong> <a href={`https://ipfs.io/ipfs/${selectedProduct.ipfsCertHash}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">{selectedProduct.ipfsCertHash}</a></p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú xác nhận</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" rows={2} placeholder="VD: Hàng đạt chuẩn, nhiệt độ ổn định" />
        </div>

        <div className="flex gap-3">
          <button onClick={() => handleVerify(true)} disabled={!selectedId} className="bg-green-600 text-white px-5 py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50 transition">
            ✅ Xác nhận & Bày bán
          </button>
          <button onClick={() => handleVerify(false)} disabled={!selectedId} className="bg-red-500 text-white px-5 py-2 rounded font-medium hover:bg-red-600 disabled:opacity-50 transition">
            ❌ Từ chối
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">❌ {error}</div>}
      {result && (
        <div className={`p-4 rounded border text-sm ${result.verified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="font-semibold">{result.verified ? '✅ Đã xác nhận nhận hàng!' : '❌ Đã từ chối lô hàng'}</p>
          <p><strong>Tx Hash:</strong> <a href={`https://etherscan.io/tx/${result.txHash}`} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{result.txHash}</a></p>
          <p><strong>Block:</strong> #{result.blockNumber}</p>
        </div>
      )}

      {/* On sale products */}
      {verifiedProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">🛒 Đang bày bán ({verifiedProducts.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {verifiedProducts.map((p) => (
              <div key={p.id} className="border rounded p-3 text-sm">
                <p className="font-medium">{p.productName}</p>
                <p className="text-gray-500">ID: {p.id} | Từ: {p.farmLocation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
