# Sequence Diagrams - GreenFarm Food Traceability System

## 1. Farmer tạo lô hàng (harvestProduct)

```mermaid
sequenceDiagram
    participant F as 🧑‍🌾 Farmer
    participant UI as Frontend (React)
    participant IPFS as IPFS Network
    participant SC as Smart Contract
    participant BC as Ethereum Blockchain

    F->>UI: Nhập thông tin lô hàng
    F->>UI: Upload chứng chỉ VietGAP + Ảnh lô hàng
    UI->>IPFS: uploadToIPFS(certificate)
    IPFS-->>UI: Return CID (certHash)
    UI->>IPFS: uploadToIPFS(productImage)
    IPFS-->>UI: Return CID (imageHash)
    UI->>IPFS: uploadMetadataToIPFS(metadata JSON)
    IPFS-->>UI: Return CID (metadataHash)
    UI->>SC: harvestProduct(farmerAddress, productInfo, ipfsHashes)
    SC->>SC: Verify farmerAddress ∈ trustedFarmers[]
    alt Farmer NOT trusted
        SC-->>UI: ❌ Revert "Access Denied"
    else Farmer IS trusted
        SC->>BC: Ghi transaction lên blockchain
        BC-->>SC: txHash + blockNumber
        SC-->>UI: ✅ {productId, txHash, blockNumber}
        UI-->>F: Hiển thị kết quả thành công
    end
```

## 2. Logistics cập nhật vận chuyển (updateTransitStatus)

```mermaid
sequenceDiagram
    participant L as 🚚 Logistics
    participant UI as Frontend (React)
    participant SC as Smart Contract
    participant BC as Ethereum Blockchain

    L->>UI: Chọn lô hàng + Nhập vị trí, nhiệt độ
    UI->>SC: updateTransitStatus(productId, location, temperature, humidity)
    SC->>SC: Check product exists
    SC->>SC: Check product.status ≠ "Sold"
    alt Product is Sold
        SC-->>UI: ❌ Revert "Cannot update: Product already Sold"
    else Product updatable
        SC->>SC: Update status → "In Transit"
        SC->>SC: Push transitUpdate to array
        SC->>BC: Ghi transaction lên blockchain
        BC-->>SC: txHash + blockNumber
        SC-->>UI: ✅ {txHash, blockNumber}
        UI-->>L: Hiển thị cập nhật thành công
    end

    Note over L,BC: Logistics có thể gọi nhiều lần<br/>để cập nhật vị trí liên tục
```

## 3. Retailer xác nhận nhận hàng (receiveAndVerify)

```mermaid
sequenceDiagram
    participant R as 🏪 Retailer
    participant UI as Frontend (React)
    participant SC as Smart Contract
    participant BC as Ethereum Blockchain

    R->>UI: Chọn lô hàng "In Transit"
    UI-->>R: Hiển thị thông tin sản phẩm + lịch sử vận chuyển
    R->>R: Kiểm tra nhiệt độ, IPFS cert, tính toàn vẹn
    alt Hàng đạt chuẩn
        R->>UI: Click "Xác nhận & Bày bán"
        UI->>SC: receiveAndVerify(productId, retailerAddress, verified=true)
        SC->>SC: Update status → "Verified & On Sale"
        SC->>BC: Ghi transaction
        BC-->>SC: txHash + blockNumber
        SC-->>UI: ✅ Xác nhận thành công
    else Hàng KHÔNG đạt
        R->>UI: Click "Từ chối"
        UI->>SC: receiveAndVerify(productId, retailerAddress, verified=false)
        SC->>SC: Update status → "Rejected"
        SC->>BC: Ghi transaction
        BC-->>SC: txHash + blockNumber
        SC-->>UI: ❌ Đã từ chối lô hàng
    end
```

## 4. Consumer tra cứu sản phẩm

```mermaid
sequenceDiagram
    participant C as 🔍 Consumer
    participant UI as Frontend (React)
    participant SC as Smart Contract
    participant IPFS as IPFS Network

    C->>UI: Nhập Product ID hoặc từ khóa tìm kiếm
    UI->>SC: searchProducts(keyword)
    SC-->>UI: Return matching products[]
    alt Không tìm thấy
        UI-->>C: ❌ "Không tìm thấy sản phẩm"
    else Tìm thấy 1 sản phẩm
        UI-->>C: Hiển thị chi tiết sản phẩm
    else Tìm thấy nhiều sản phẩm
        UI-->>C: Hiển thị danh sách để chọn
        C->>UI: Chọn sản phẩm cụ thể
    end
    UI-->>C: Hiển thị Timeline hành trình
    UI-->>C: Hiển thị Transaction Hash (link Etherscan)
    C->>IPFS: Truy cập IPFS link (xem chứng chỉ)
    IPFS-->>C: Trả về file chứng chỉ VietGAP/ảnh
```