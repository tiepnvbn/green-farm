# 🌿 GreenFarm Traceability - Hướng Dẫn Demo

## 📋 Giới thiệu
GreenFarm là ứng dụng truy xuất nguồn gốc nông sản sử dụng **Blockchain (Ethereum)** và **IPFS**. Mỗi lô hàng được đại diện bởi một NFT (ERC-721) trên mạng Sepolia Testnet.

**Link ứng dụng:** https://greenfarmdemo.netlify.app/

**Contract trên Etherscan:** https://sepolia.etherscan.io/address/0x75679e2ba9AFc4165913CAcd058848a0c2f52c76

---

## 🔧 Chuẩn bị trước khi Demo (1 lần duy nhất)

### Bước 1: Cài đặt MetaMask
1. Truy cập https://metamask.io/download/
2. Click **"Install MetaMask for Chrome"**
3. Tạo ví mới → Đặt mật khẩu → **Lưu lại 12 từ bí mật** (Secret Recovery Phrase)

### Bước 2: Chuyển sang mạng Sepolia Testnet
1. Mở MetaMask → Click biểu tượng mạng (góc trên trái)
2. Bật **"Show test networks"**
3. Chọn **"Sepolia"**

### Bước 3: Lấy ETH miễn phí (dùng để trả phí giao dịch)
1. Copy địa chỉ ví của bạn (click vào tên account trong MetaMask)
2. Truy cập: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
3. Dán địa chỉ ví → Click **"Receive"** → Nhận 0.05 ETH miễn phí

> ⚠️ **Lưu ý:** ETH trên Sepolia là tiền test, không có giá trị thật. Phí mỗi giao dịch chỉ ~0.001 ETH.

---

## 🚀 Hướng Dẫn Demo Từng Bước

### 1️⃣ Farmer - Đăng ký lô hàng (Mint NFT)

1. Vào tab **Farmer** → Click **"Connect MetaMask"** → Approve kết nối
2. Điền thông tin:
   - Tên sản phẩm: `Xoài cát Hòa Lộc`
   - Nơi trồng: `Tiền Giang`
   - Ngày thu hoạch: chọn ngày
   - Giống cây, phân bón, nhiệt độ (tuỳ chọn)
3. Upload file:
   - **Chứng chỉ VietGAP**: upload file PDF/ảnh
   - **Ảnh lô hàng**: upload ảnh sản phẩm
4. Click **"Tạo lô hàng (Mint NFT to Blockchain)"**
5. MetaMask popup → Click **"Confirm"** để ký giao dịch
6. Đợi ~15-30 giây → Hiện mã lô hàng (VD: `GF-1001`) + link Etherscan

> ✅ Lúc này trên blockchain đã có NFT đại diện cho lô hàng, file ảnh/chứng chỉ đã lưu trên IPFS.

---

### 2️⃣ Logistics - Cập nhật vận chuyển

1. Vào tab **Logistics** → Connect MetaMask
2. Chọn lô hàng cần cập nhật (VD: `GF-1001`)
3. Điền thông tin:
   - Vị trí: `Kho lạnh quận 7, TP.HCM`
   - Nhiệt độ: `4°C`
   - Độ ẩm: `85%`
   - Ghi chú: `Vận chuyển bằng xe lạnh`
4. Click **"Cập nhật"** → Confirm trên MetaMask
5. Giao dịch được ghi nhận trên blockchain

> ✅ Có thể cập nhật nhiều lần trong quá trình vận chuyển.

---

### 3️⃣ Retailer - Xác nhận nhận hàng

1. Vào tab **Retailer** → Connect MetaMask
2. Chọn lô hàng → Xem thông tin chi tiết
3. Click **"Xác nhận (Verify)"** hoặc **"Từ chối (Reject)"**
4. Confirm trên MetaMask
5. Nếu Verify → NFT được chuyển sang ví của retailer

> ✅ NFT transfer chứng minh quyền sở hữu lô hàng đã chuyển giao trên blockchain.

---

### 4️⃣ Consumer - Tra cứu nguồn gốc

1. Vào tab **Consumer**
2. Nhập mã lô hàng (VD: `GF-1001`) hoặc tên sản phẩm
3. Xem toàn bộ thông tin:
   - Thông tin nông trại & farmer
   - Lịch sử vận chuyển (timeline)
   - Ảnh sản phẩm & chứng chỉ (link IPFS)
   - Link xem giao dịch trên Etherscan

> ✅ Người tiêu dùng có thể xác minh độc lập toàn bộ chuỗi cung ứng.

---

## 🔗 Công nghệ sử dụng

| Thành phần | Công nghệ |
|-----------|-----------|
| Smart Contract | Solidity, ERC-721 (OpenZeppelin) |
| Blockchain | Ethereum Sepolia Testnet |
| Lưu trữ file | IPFS (Pinata) |
| Ví & ký giao dịch | MetaMask |
| Frontend | React + Vite + TailwindCSS |
| RPC Provider | Alchemy |
| Deploy | Netlify |

---

## ❓ FAQ

**Q: Tại sao cần MetaMask?**
A: Vì mỗi thao tác (tạo lô hàng, cập nhật vận chuyển, xác nhận) đều là giao dịch thật trên blockchain, cần có ví để ký xác nhận.

**Q: Phí giao dịch có mất tiền thật không?**
A: Không. Sepolia là mạng test, ETH trên đó hoàn toàn miễn phí.

**Q: Dữ liệu có bị mất không?**
A: Không. Dữ liệu đã ghi lên blockchain và IPFS là vĩnh viễn, không thể xoá hay sửa.

**Q: Tại sao phải đợi 15-30 giây?**
A: Đó là thời gian để mạng Ethereum xác nhận giao dịch (mining block).

---

## 📌 Thông tin kỹ thuật

- **Contract Address:** `0x75679e2ba9AFc4165913CAcd058848a0c2f52c76`
- **Network:** Sepolia Testnet (Chain ID: 11155111)
- **Etherscan:** https://sepolia.etherscan.io/address/0x75679e2ba9AFc4165913CAcd058848a0c2f52c76
- **Source Code:** https://github.com/tiepnvbn/green-farm
