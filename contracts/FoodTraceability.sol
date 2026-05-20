// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FoodTraceability
 * @dev ERC721-based food traceability smart contract
 * Each product batch is minted as an NFT
 */
contract FoodTraceability is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    // Trusted farmers who can create new product batches
    mapping(address => bool) public trustedFarmers;

    // Product status enum
    enum Status { Harvested, InTransit, Verified, Rejected, Sold }

    // Product data structure
    struct Product {
        string productName;
        string farmLocation;
        string harvestDate;
        string ipfsCertHash;
        string ipfsImageHash;
        string ipfsMetadataHash;
        address farmer;
        address retailer;
        Status status;
        uint256 createdAt;
    }

    // Transit update structure
    struct TransitUpdate {
        string location;
        string temperature;
        string humidity;
        string notes;
        address carrier;
        uint256 timestamp;
    }

    // Storage
    mapping(uint256 => Product) public products;
    mapping(uint256 => TransitUpdate[]) public transitHistory;

    // Events
    event ProductHarvested(uint256 indexed tokenId, address indexed farmer, string productName, string ipfsMetadataHash);
    event TransitStatusUpdated(uint256 indexed tokenId, address indexed carrier, string location, string temperature);
    event ProductVerified(uint256 indexed tokenId, address indexed retailer, bool verified);
    event ProductSold(uint256 indexed tokenId);
    event FarmerAdded(address indexed farmer);
    event FarmerRemoved(address indexed farmer);

    constructor() ERC721("GreenFarm Product", "GFP") Ownable(msg.sender) {
        _tokenIdCounter = 1000;
        // Contract deployer is automatically a trusted farmer
        trustedFarmers[msg.sender] = true;
    }

    // Modifiers
    modifier onlyTrustedFarmer() {
        require(trustedFarmers[msg.sender], "Access Denied: Not a trusted farmer");
        _;
    }

    modifier productExists(uint256 tokenId) {
        require(ownerOf(tokenId) != address(0), "Product does not exist");
        _;
    }

    modifier notSold(uint256 tokenId) {
        require(products[tokenId].status != Status.Sold, "Cannot update: Product already sold");
        _;
    }

    // ============ Admin Functions ============

    function addTrustedFarmer(address farmer) external onlyOwner {
        trustedFarmers[farmer] = true;
        emit FarmerAdded(farmer);
    }

    function removeTrustedFarmer(address farmer) external onlyOwner {
        trustedFarmers[farmer] = false;
        emit FarmerRemoved(farmer);
    }

    // ============ Core Business Functions ============

    /**
     * @dev Farmer creates a new product batch (mints NFT)
     */
    function harvestProduct(
        string memory _productName,
        string memory _farmLocation,
        string memory _harvestDate,
        string memory _ipfsCertHash,
        string memory _ipfsImageHash,
        string memory _ipfsMetadataHash
    ) external onlyTrustedFarmer returns (uint256) {
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _mint(msg.sender, newTokenId);

        products[newTokenId] = Product({
            productName: _productName,
            farmLocation: _farmLocation,
            harvestDate: _harvestDate,
            ipfsCertHash: _ipfsCertHash,
            ipfsImageHash: _ipfsImageHash,
            ipfsMetadataHash: _ipfsMetadataHash,
            farmer: msg.sender,
            retailer: address(0),
            status: Status.Harvested,
            createdAt: block.timestamp
        });

        emit ProductHarvested(newTokenId, msg.sender, _productName, _ipfsMetadataHash);
        return newTokenId;
    }

    /**
     * @dev Logistics updates transit status (can be called multiple times)
     */
    function updateTransitStatus(
        uint256 tokenId,
        string memory _location,
        string memory _temperature,
        string memory _humidity,
        string memory _notes
    ) external productExists(tokenId) notSold(tokenId) {
        products[tokenId].status = Status.InTransit;

        transitHistory[tokenId].push(TransitUpdate({
            location: _location,
            temperature: _temperature,
            humidity: _humidity,
            notes: _notes,
            carrier: msg.sender,
            timestamp: block.timestamp
        }));

        emit TransitStatusUpdated(tokenId, msg.sender, _location, _temperature);
    }

    /**
     * @dev Retailer receives and verifies the product
     * If verified, NFT is transferred to retailer
     */
    function receiveAndVerify(
        uint256 tokenId,
        bool verified
    ) external productExists(tokenId) notSold(tokenId) {
        if (verified) {
            products[tokenId].status = Status.Verified;
            products[tokenId].retailer = msg.sender;
            // Transfer NFT from farmer to retailer
            address currentOwner = ownerOf(tokenId);
            _transfer(currentOwner, msg.sender, tokenId);
        } else {
            products[tokenId].status = Status.Rejected;
        }

        emit ProductVerified(tokenId, msg.sender, verified);
    }

    /**
     * @dev Mark product as sold (by retailer/current owner)
     */
    function markAsSold(uint256 tokenId) external productExists(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Only current owner can mark as sold");
        products[tokenId].status = Status.Sold;
        emit ProductSold(tokenId);
    }

    // ============ View Functions ============

    function getProduct(uint256 tokenId) external view returns (Product memory) {
        return products[tokenId];
    }

    function getTransitHistory(uint256 tokenId) external view returns (TransitUpdate[] memory) {
        return transitHistory[tokenId];
    }

    function getTransitCount(uint256 tokenId) external view returns (uint256) {
        return transitHistory[tokenId].length;
    }

    function getTokenCounter() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function isTrustedFarmer(address farmer) external view returns (bool) {
        return trustedFarmers[farmer];
    }
}
