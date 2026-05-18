# Flowchart Diagrams - GreenFarm Food Traceability System

## 1. System Architecture (Kiến trúc tổng thể)

```mermaid
graph TB
    subgraph Frontend ["🖥️ Frontend (React + Vite)"]
        FA[Farmer App]
        LA[Logistics Page]
        RA[Retailer Page]
        CA[Consumer Page]
    end

    subgraph Blockchain ["⛓️ Ethereum Blockchain"]
        SC[Smart Contract<br/>FoodTraceability.sol]
        TF[Trusted Farmers List]
        PS[Product Storage]
    end

    subgraph Storage ["📦 IPFS Decentralized Storage"]
        CERT[Chứng chỉ VietGAP/GlobalGAP]
        IMG[Ảnh lô hàng]
        META[Metadata JSON]
    end

    FA -->|"harvestProduct()"| SC
    FA -->|upload files| Storage
    LA -->|"updateTransitStatus()"| SC
    RA -->|"receiveAndVerify()"| SC
    CA -->|"searchProducts()"| SC
    CA -->|view certificates| Storage
    SC --> TF
    SC --> PS
```

## 2. Business Flow (Luồng nghiệp vụ chính)

```mermaid
flowchart TD
    START([🌱 Bắt đầu]) --> HARVEST

    subgraph HARVEST ["Giai đoạn 1: Thu hoạch"]
        H1[Nông dân nhập thông tin lô hàng]
        H2[Upload chứng chỉ + ảnh lên IPFS]
        H3{Farmer ∈ Trusted List?}
        H4[Gọi harvestProduct trên blockchain]
        H5[❌ Từ chối - Access Denied]
        H1 --> H2 --> H3
        H3 -->|Có| H4
        H3 -->|Không| H5
    end

    H4 --> TRANSIT
    subgraph TRANSIT ["Giai đoạn 2: Vận chuyển"]
        T1[Logistics chọn lô hàng]
        T2[Nhập vị trí + nhiệt độ + độ ẩm]
        T3{Product.status = Sold?}
        T4[Gọi updateTransitStatus]
        T5[❌ Không thể cập nhật]
        T6{Cần cập nhật thêm?}
        T1 --> T2 --> T3
        T3 -->|Không| T4
        T3 -->|Có| T5
        T4 --> T6
        T6 -->|Có| T1
        T6 -->|Không| VERIFY
    end

    subgraph VERIFY ["Giai đoạn 3: Xác minh"]
        V1[Retailer xem thông tin lô hàng]
        V2[Kiểm tra nhiệt độ, chứng chỉ IPFS]
        V3{Hàng đạt chuẩn?}
        V4[✅ Xác nhận - Status: On Sale]
        V5[❌ Từ chối - Status: Rejected]
        V1 --> V2 --> V3
        V3 -->|Có| V4
        V3 -->|Không| V5
    end

    V4 --> CONSUMER
    subgraph CONSUMER ["Giai đoạn 4: Tra cứu"]
        C1[Consumer nhập ID / từ khóa]
        C2[Xem Timeline hành trình]
        C3[Xem chứng chỉ IPFS]
        C4[Đối chiếu Tx Hash trên Etherscan]
        C1 --> C2 --> C3 --> C4
    end

    C4 --> DONE([✅ Hoàn tất truy xuất])
```

## 3. Smart Contract Logic Flow

```mermaid
flowchart TD
    subgraph SC ["Smart Contract - FoodTraceability"]
        direction TB
        
        HP["harvestProduct()"]
        UTS["updateTransitStatus()"]
        RAV["receiveAndVerify()"]
        
        HP --> |Tạo product mới| DB[(Products Mapping)]
        UTS --> |Cập nhật transit| DB
        RAV --> |Đổi status| DB
        
        subgraph Constraints ["⚠️ Ràng buộc Logic"]
            C1["✓ Chỉ Trusted Farmer<br/>mới gọi được harvestProduct"]
            C2["✓ Product 'Sold' → không<br/>cập nhật transit được nữa"]
            C3["✓ Chỉ product 'In Transit'<br/>mới được verify"]
        end
    end

    HP -.->|check| C1
    UTS -.->|check| C2
    RAV -.->|check| C3
```

## 4. IPFS Integration Flow

```mermaid
flowchart LR
    subgraph Upload ["📤 Upload (Farmer)"]
        U1[Chọn file chứng chỉ PDF/IMG]
        U2[Chọn ảnh lô hàng JPG/PNG]
        U3[Tạo metadata JSON tự động]
    end

    subgraph IPFS ["🌐 IPFS Network"]
        I1[File được phân tán lưu trữ]
        I2[Tạo CID duy nhất cho mỗi file]
    end

    subgraph Chain ["⛓️ Blockchain"]
        B1[Lưu CID vào product data]
        B2[CID là bất biến - immutable]
    end

    subgraph Retrieve ["📥 Retrieve (Consumer)"]
        R1[Đọc CID từ blockchain]
        R2[Truy cập IPFS gateway]
        R3[Xem chứng chỉ gốc]
    end

    U1 --> I1
    U2 --> I1
    U3 --> I1
    I1 --> I2
    I2 --> B1
    B1 --> B2
    B2 --> R1
    R1 --> R2
    R2 --> R3
```

## 5. Product State Machine

```mermaid
stateDiagram-v2
    [*] --> Harvested : harvestProduct()
    Harvested --> InTransit : updateTransitStatus()
    InTransit --> InTransit : updateTransitStatus() (nhiều lần)
    InTransit --> VerifiedOnSale : receiveAndVerify(verified=true)
    InTransit --> Rejected : receiveAndVerify(verified=false)
    VerifiedOnSale --> Sold : markAsSold()
    
    Sold --> [*]
    Rejected --> [*]

    note right of Sold : Sau khi Sold,<br/>không thể update<br/>transit nữa
    note right of Harvested : Chỉ Trusted Farmer<br/>mới tạo được
```
