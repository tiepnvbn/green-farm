import { useState } from "react";
import { updateTransitStatus, getAllProducts } from "../store/blockchainStore";

export default function Logistics() {
  const [form, setForm] = useState({
    productId: "",
    location: "",
    temperature: "",
    humidity: "",
    notes: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const carrierAddress = "0xLogistics001";
  const products = getAllProducts().filter((p) => p.status !== "Sold");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const txResult = updateTransitStatus({
        ...form,
        carrierAddress,
      });
      setResult(txResult);
      setForm({ ...form, location: "", temperature: "", humidity: "", notes: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-blue-800">🚚 Logistics Simulator</h2>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          Carrier: {carrierAddress}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Cập nhật vận chuyển (updateTransitStatus)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn lô hàng *</label>
            <select required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.id} - {p.productName} [{p.status}]</option>
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

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition">
          📡 Gửi cập nhật lên Blockchain
        </button>
      </form>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">❌ {error}</div>}
      {result && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded space-y-1 text-sm">
          <p className="font-semibold text-blue-800">✅ Cập nhật thành công!</p>
          <p><strong>Tx Hash:</strong> <a href={`https://etherscan.io/tx/${result.txHash}`} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{result.txHash}</a></p>
          <p><strong>Block:</strong> #{result.blockNumber}</p>
        </div>
      )}

      {/* Transit history for selected product */}
      {form.productId && (() => {
        const product = products.find(p => p.id === form.productId);
        if (!product || product.transitUpdates.length === 0) return null;
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">📍 Lịch sử vận chuyển - {product.id}</h3>
            <div className="space-y-2">
              {product.transitUpdates.map((u, i) => (
                <div key={i} className="border-l-4 border-blue-400 pl-3 py-2 text-sm">
                  <p className="font-medium">{u.location}</p>
                  <p className="text-gray-500">🌡 {u.temperature}°C | 💧 {u.humidity}% | {new Date(u.timestamp).toLocaleString('vi-VN')}</p>
                  <p className="text-xs text-gray-400 break-all">Tx: {u.txHash}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
