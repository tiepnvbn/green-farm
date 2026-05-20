import { useState, useEffect } from "react";
import { updateTransitStatus, getAllProducts } from "../store/blockchainStore";
import { connectWallet, isMetaMaskInstalled } from "../store/web3Provider";

export default function Logistics() {
  const [form, setForm] = useState({
    tokenId: "",
    location: "",
    temperature: "",
    humidity: "",
    notes: "",
  });
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
      setProducts(all.filter((p) => p.status !== "Sold" && p.status !== "Rejected"));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      // Triggers MetaMask popup
      const txResult = await updateTransitStatus({
        tokenId: parseInt(form.tokenId),
        location: form.location,
        temperature: form.temperature,
        humidity: form.humidity,
        notes: form.notes,
      });
      setResult(txResult);
      setForm({ ...form, location: "", temperature: "", humidity: "", notes: "" });
    } catch (err) {
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.tokenId === parseInt(form.tokenId));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-blue-800">🚚 Logistics Simulator</h2>
        {wallet ? (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
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

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Cập nhật vận chuyển (updateTransitStatus)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn lô hàng *</label>
            <select required value={form.tokenId} onChange={(e) => setForm({ ...form, tokenId: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((p) => (
                <option key={p.tokenId} value={p.tokenId}>GF-{p.tokenId} - {p.productName} [{p.status}]</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí hiện tại *</label>
            <input type="text" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: Kho lạnh Bình Dương" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhiệt độ container (°C) *</label>
            <input type="number" required value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: 14" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Độ ẩm (%)</label>
            <input type="number" value={form.humidity} onChange={(e) => setForm({ ...form, humidity: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: 85" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: Hàng ổn định" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !wallet}
          className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "⏳ Đang gửi (check MetaMask)..." : "📡 Gửi cập nhật lên Blockchain"}
        </button>
      </form>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">❌ {error}</div>}

      {result && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded space-y-1 text-sm">
          <p className="font-semibold text-blue-800">✅ Cập nhật thành công!</p>
          <p><strong>Tx Hash:</strong> <a href={result.etherscanUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{result.txHash}</a></p>
          <p><strong>Block:</strong> #{result.blockNumber}</p>
        </div>
      )}

      {/* Transit history */}
      {selectedProduct && selectedProduct.transitUpdates.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">📍 Lịch sử vận chuyển - GF-{selectedProduct.tokenId}</h3>
          <div className="space-y-2">
            {selectedProduct.transitUpdates.map((u, i) => (
              <div key={i} className="border-l-4 border-blue-400 pl-3 py-2 text-sm">
                <p className="font-medium">{u.location}</p>
                <p className="text-gray-500">🌡 {u.temperature}°C | 💧 {u.humidity}% | {new Date(u.timestamp).toLocaleString('vi-VN')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
