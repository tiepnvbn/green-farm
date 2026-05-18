import { useState } from "react";
import { getProduct } from "../store/blockchainStore";

export default function Consumer() {
  const [productId, setProductId] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");
    setProduct(null);

    const found = getProduct(productId.trim());
    if (!found) {
      setError("Không tìm thấy sản phẩm. Vui lòng kiểm tra lại mã ID.");
      return;
    }
    setProduct(found);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">🔍 Tra cứu nguồn gốc sản phẩm</h2>
      <p className="text-gray-500 text-sm">Nhập mã sản phẩm (Product ID) để xem toàn bộ hành trình từ nông trại đến tay bạn.</p>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="VD: GF-1001"
          className="flex-1 border rounded px-4 py-2 text-sm"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 transition">
          🔎 Tra cứu
        </button>
      </form>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm">❌ {error}</div>}

      {product && (
        <div className="space-y-6">
          {/* Product Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-green-800">{product.productName}</h3>
                <p className="text-sm text-gray-500">ID: {product.id}</p>
              </div>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                product.status === 'Harvested' ? 'bg-yellow-100 text-yellow-700' :
                product.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                product.status === 'Verified & On Sale' ? 'bg-green-100 text-green-700' :
                product.status === 'Sold' ? 'bg-gray-100 text-gray-700' :
                'bg-red-100 text-red-700'
              }`}>
                {product.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div><span className="text-gray-500">Nơi trồng:</span><p className="font-medium">{product.farmLocation}</p></div>
              <div><span className="text-gray-500">Ngày thu hoạch:</span><p className="font-medium">{product.harvestDate}</p></div>
              <div><span className="text-gray-500">Giống:</span><p className="font-medium">{product.variety || 'N/A'}</p></div>
              <div><span className="text-gray-500">Phân bón:</span><p className="font-medium">{product.fertilizer || 'N/A'}</p></div>
              <div><span className="text-gray-500">Nhiệt độ lý tưởng:</span><p className="font-medium">{product.idealTemp ? `${product.idealTemp}°C` : 'N/A'}</p></div>
              <div><span className="text-gray-500">Nông dân:</span><p className="font-medium font-mono text-xs">{product.farmerAddress}</p></div>
            </div>
          </div>

          {/* IPFS Certificates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-3">📜 Chứng chỉ & Tài liệu (IPFS)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <a href={`https://ipfs.io/ipfs/${product.ipfsCertHash}`} target="_blank" rel="noreferrer" className="border rounded p-3 hover:bg-green-50 transition block">
                <p className="font-medium">📄 Chứng chỉ VietGAP</p>
                <p className="text-xs text-gray-400 break-all mt-1">{product.ipfsCertHash}</p>
              </a>
              <a href={`https://ipfs.io/ipfs/${product.ipfsImageHash}`} target="_blank" rel="noreferrer" className="border rounded p-3 hover:bg-green-50 transition block">
                <p className="font-medium">📷 Ảnh lô hàng</p>
                <p className="text-xs text-gray-400 break-all mt-1">{product.ipfsImageHash}</p>
              </a>
              <a href={`https://ipfs.io/ipfs/${product.ipfsMetadataHash}`} target="_blank" rel="noreferrer" className="border rounded p-3 hover:bg-green-50 transition block">
                <p className="font-medium">📋 Metadata JSON</p>
                <p className="text-xs text-gray-400 break-all mt-1">{product.ipfsMetadataHash}</p>
              </a>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4">📍 Timeline hành trình</h3>
            <div className="space-y-0">
              {product.timeline.map((event, i) => (
                <div key={i} className="flex gap-4">
                  {/* Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      event.action === 'Harvested' ? 'bg-yellow-400 border-yellow-500' :
                      event.action === 'Transit Update' ? 'bg-blue-400 border-blue-500' :
                      event.action.includes('Verified') ? 'bg-green-400 border-green-500' :
                      'bg-gray-400 border-gray-500'
                    }`} />
                    {i < product.timeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 min-h-[40px]" />}
                  </div>
                  {/* Content */}
                  <div className="pb-6 text-sm">
                    <p className="font-semibold">{event.action}</p>
                    <p className="text-gray-600">{event.details}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.timestamp).toLocaleString('vi-VN')} | Block #{event.blockNumber}
                    </p>
                    <p className="text-xs mt-1">
                      <span className="text-gray-400">Tx: </span>
                      <a href={`https://etherscan.io/tx/${event.txHash}`} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
                        {event.txHash}
                      </a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
