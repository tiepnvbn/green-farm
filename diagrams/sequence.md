```mermaid
sequenceDiagram
    participant Supplier
    participant Manufacturer
    participant Distributor
    participant Retailer

    Supplier->>Manufacturer: Send Raw Product
    Manufacturer->>Distributor: Process & Ship
    Distributor->>Retailer: Distribute Product
    Retailer->>Customer: Sell Product