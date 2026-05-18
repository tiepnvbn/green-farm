
# 🌿 GreenFarm Food Traceability System

Hệ thống truy xuất nguồn gốc thực phẩm trên Blockchain & IPFS.

## Mô tả

Ứng dụng cho phép theo dõi hành trình sản phẩm nông sản sạch từ nông trại đến tay người tiêu dùng:

```
🧑‍🌾 Farmer → 🚚 Logistics → 🏪 Retailer → 🔍 Consumer
```

## Tính năng

| Trang | Chức năng |
|-------|-----------|
| **Farmer App** | Nhập thông tin mùa vụ, upload chứng chỉ/ảnh IPFS, gọi `harvestProduct()` |
| **Logistics** | Cập nhật vị trí + nhiệt độ (nhiều lần), gọi `updateTransitStatus()` |
| **Retailer** | Xác nhận nhận hàng, kiểm tra dữ liệu, gọi `receiveAndVerify()` |
| **Consumer** | Tra cứu sản phẩm, xem Timeline, chứng chỉ IPFS, Tx Hash Etherscan |

## Smart Contract Logic

- `harvestProduct()` — Nông dân tạo lô hàng mới
- `updateTransitStatus()` — Logistics cập nhật vận chuyển
- `receiveAndVerify()` — Retailer xác nhận nhận hàng

**Ràng buộc:**
- Chỉ Trusted Farmers mới được tạo sản phẩm
- Sản phẩm đã "Sold" không thể cập nhật transit

## IPFS Storage

- Chứng chỉ VietGAP/GlobalGAP (PDF/IMG)
- Ảnh lô hàng tại thời điểm đóng gói
- Metadata JSON (giống cây, phân bón, nhiệt độ bảo quản)

## Công nghệ

- **Frontend:** React 18 + Vite 5
- **Styling:** TailwindCSS 3.4
- **Blockchain:** Ethereum (Ethers.js 6)
- **Storage:** IPFS (simulated)
- **Routing:** React Router DOM 6

## Cài đặt & Chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Truy cập: http://localhost:5173

## Build Production

```bash
npm run build
npm run preview
```

## Cấu trúc thư mục

```
src/
├── App.jsx              # Root component + routing
├── main.jsx             # Entry point + seed demo data
├── index.css            # TailwindCSS
├── pages/
│   ├── Farmer.jsx       # Farmer interface
│   ├── Logistics.jsx    # Logistics interface
│   ├── Retailer.jsx     # Retailer interface
│   └── Consumer.jsx     # Consumer lookup
└── store/
    ├── blockchainStore.js  # Simulated smart contract
    └── ipfsStore.js        # Simulated IPFS
```

## Tài liệu

- [Báo cáo đồ án](docs/REPORT.md)
- [ERD & Class Diagram](diagrams/erd.md)
- [Sequence Diagrams](diagrams/sequence.md)
- [Flowchart & Architecture](diagrams/flowchart.md)

## Demo Data

Hệ thống seed sẵn 1 sản phẩm **Xoài Cát Hòa Lộc** (ID: `GF-1001`) với đầy đủ timeline để test trang Consumer.