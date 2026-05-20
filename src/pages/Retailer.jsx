import { useState, useEffect } from "react";
import { receiveAndVerify, getAllProducts } from "../store/blockchainStore";
import { connectWallet, isMetaMaskInstalled } from "../store/web3Provider";
import { getIPFSUrl } from "../store/ipfsStore";

export default function Retailer() {
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (isMetaMaskInstalled()) {
      connectWallet()
        .then(({ address }) => setWallet(address))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [wallet, result]);

  const loadProducts = async () => {
    try {
      const all = await getAllProducts();
      setProducts(all);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnect = async () => {
    try {
      const { address } = await connectWallet();
      setWallet(address);
    } catch (err) {
      setError(err.message);
    }
  };

  const pendingProducts = products.filter((p) => p.status === "In Transit");
  const verifiedProducts = products.filter((p) => p.status === "Verified & On Sale");
  const selectedProduct = products.find((p) => p.tokenId === parseInt(selectedId));

  const handleVerify = async (verified) => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      // Triggers MetaMask popup - if verified, NFT is transferred to retailer
      const txResult = await receiveAndVerify({
        tokenId: parseInt(selectedId),
        verified,
      });
      setResult({ ...txResult, verified });
      setSelectedId("");
      setNotes("");
    } catch (err) {
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-purple-800">🏪 Retailer Page</h2>
        {wallet ? (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono">
            🔗 {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </span>
        ) : (
          <button onClick={handleConnect} className="text-xs bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600">
            🦊 Connect MetaMask
          </button>
        )}
      </div>

      {!isMetaMaskInstalled() && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          ⚠️ MetaMask chưa được cài đặt.
        </div>
      )}

      {/* Receive & Verify */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Nhận hàng & Xác minh (receiveAndVerify)</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lô hàng đang vận chuyển</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
            <option value="">-- Chọn lô hàng cần xác nhận --</option>
            {pendingProducts.map((p) => (
              <option key={p.tokenId} value={p.tokenId}>GF-{p.tokenId} - {p.productName}</option>
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
            {selectedProduct.ipfsCertHash && (
              <p><strong>IPFS Cert:</strong> <a href={getIPFSUrl(selectedProduct.ipfsCertHash)} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">{selectedProduct.ipfsCertHash}</a></p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú xác nhận</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" rows={2} placeholder="VD: Hàng đạt chuẩn, nhiệt độ ổn định" />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleVerify(true)}
            disabled={!selectedId || loading || !wallet}
            className="bg-green-600 text-white px-5 py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? "⏳..." : "✅ Xác nhận & Nhận NFT"}
          </button>
          <button
            onClick={() => handleVerify(false)}
            disabled={!selectedId || loading || !wallet}
            className="bg-red-500 text-white px-5 py-2 rounded font-medium hover:bg-red-600 disabled:opacity-50 transition"
          >
            ❌ Từ chối
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">❌ {error}</div>}

      {result && (
        <div className={`p-4 rounded border text-sm ${result.verified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="font-semibold">{result.verified ? '✅ Đã xác nhận! NFT đã được transfer cho bạn.' : '❌ Đã từ chối lô hàng'}</p>
          <p><strong>Tx Hash:</strong> <a href={result.etherscanUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{result.txHash}</a></p>
          <p><strong>Block:</strong> #{result.blockNumber}</p>
        </div>
      )}

      {/* On sale products */}
      {verifiedProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">🛒 Đang bày bán ({verifiedProducts.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {verifiedProducts.map((p) => (
              <div key={p.tokenId} className="border rounded p-3 text-sm">
                <p className="font-medium">{p.productName}</p>
                <p className="text-gray-500">ID: GF-{p.tokenId} | Từ: {p.farmLocation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
