// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "./NFTAuction.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

// 拍卖NFT合约工厂
contract NFTAuctionFactory {
    using Clones for address;

    address public immutable template;

    // 拍卖的地址列表
    address[] public nfts;
    // 拍品与拍卖的映射
    mapping(address _nft => address) public auctionOf;
    // 创建拍卖的Event
    event AuctionCreated(
        address indexed nft,
        uint indexed tokenId,
        address indexed auction
    );

    constructor(address _template) {
        template = _template;
    }

    // 创建拍卖
    function createAuction(
        address _nft,
        uint256 _tokenId,
        uint256 _duration,
        uint256 _startPrice,
        bytes32 _salt
    ) external payable returns (address auction) {
        auction = template.predictDeterministicAddress(_salt);
        if (auction.code.length != 0) revert("auction exist");
        template.cloneDeterministic(_salt);
        // 3. 初始化
        NFTAuction(payable(auction)).initialize(
            _nft,
            _tokenId,
            _duration,
            _startPrice
        );
        nfts.push(_nft);
        auctionOf[_nft] = address(auction);
        emit AuctionCreated(_nft, _tokenId, address(auction));
    }

    // 获取竞拍
    function getAuction(address _nft) external view returns (address) {
        return auctionOf[_nft];
    }

    function getNFTs() external view returns (address[] memory) {
        return nfts;
    }

    // 预测拍卖合约地址
    function predictAuctionAddress(
        bytes32 _salt
    ) external view returns (address) {
        return template.predictDeterministicAddress(_salt);
    }
}
