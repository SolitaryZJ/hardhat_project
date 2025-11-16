// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {
    AggregatorV3Interface
} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract NFTAuction is ERC721Holder, OwnableUpgradeable, UUPSUpgradeable {
    /* 状态变量 */
    // 拍品
    IERC721 public nft;
    // 拍品id
    uint256 public tokenId;
    // 拍卖结束时间
    uint256 public endTime;
    // 最高出价者
    address public highestBidder;
    // 最高出价（统一转换成USD）
    uint256 public highestBid;
    // 是否清算
    bool public settled;

    /* chainlink price feed*/
    mapping(address => AggregatorV3Interface) public priceFeed;

    // 记录用户实际支付的是什么
    struct Bid {
        uint256 amount;
        address token; // 0xEee...EEE 代表 ETH
    }
    mapping(address => Bid) public bids;

    //address constant USD = 0xa0B869a91c6218F36c1d19D4A2e9eB0cE3606eB4;

    /* 初始化 */
    function initialize(
        address _nft,
        uint256 _tokenId,
        uint256 _duration,
        uint256 _startPrice
    ) external payable initializer {
        require(address(nft) == address(0), "already initialied");
        // 初始化owner
        _transferOwnership(tx.origin);
        nft = IERC721(_nft);
        tokenId = _tokenId;
        endTime = block.timestamp + _duration;
        highestBid = _startPrice;
        nft.safeTransferFrom(tx.origin, address(this), tokenId);
    }

    /* 设置pricefeed 内容, address(0)为ETH/UDC 其他为*/
    function setPriceFeed(address _token, address _priceFeed) external {
        priceFeed[_token] = AggregatorV3Interface(_priceFeed);
    }

    /* 获取priceFeed价格 */
    function quoteToUSD(
        address _token,
        uint256 amount
    ) public view returns (uint256) {
        return amount;
        // AggregatorV3Interface priceFeed = priceFeed[_token];
        // require(address(priceFeed) != address(0), "no price feed");
        // (
        //     ,
        //     /* uint80 roundId */ int256 answer,
        //     ,
        //     ,

        // ) = /*uint256 startedAt*/ /*uint256 updatedAt*/ /*uint80 answeredInRound*/ priceFeed
        //         .latestRoundData();
        // return uint256(answer) * amount;
        // TODO comment out above when using seplio network
    }

    /* 参与竞拍 支持ETH以及ERC20代币*/
    function bid(address _token, uint256 amount) external payable {
        require(block.timestamp < endTime, "Auction ended"); // 检查拍卖是否已结束
        require(!settled, "settled");
        // token 0地址，value为0表示无效的代币或者ETH
        require(_token == address(0) || msg.value == 0, "no currency");
        uint256 payAmount = (_token == address(0)) ? msg.value : amount;
        require(payAmount > 0, "zore bid");

        // 调用chainlink获取代币换算
        uint256 usdValue = quoteToUSD(_token, payAmount);
        require(usdValue > highestBid, "low bid");

        // 退币
        if (highestBidder != address(0)) {
            Bid memory old = bids[highestBidder];
            if (old.token == address(0)) {
                (bool s, ) = highestBidder.call{value: old.amount}("");
                require(s, "refund eth");
            } else {
                IERC20(old.token).transfer(highestBidder, old.amount);
            }
        }

        // 记录新的竞拍者
        highestBidder = msg.sender;
        highestBid = usdValue;
        bids[msg.sender] = Bid(payAmount, _token);

        // 收款
        if (_token != address(0)) {
            IERC20(_token).transferFrom(msg.sender, address(this), amount);
        }
    }

    /* 清算 */
    function settle() external {
        require(!settled, "settled");
        require(block.timestamp <= endTime, "auction not ended"); // 检查拍卖是否已结束
        settled = true;
        // 1.将nft转给价高者
        nft.transferFrom(address(this), highestBidder, tokenId);
        // 2.将拍卖所得给到卖家，由于最终只有一人得到拍品，所以只需将最高者转给拍卖合约的token转给卖家即可
        if (highestBidder != address(0)) {
            Bid memory bidder = bids[highestBidder];
            if (bidder.token == address(0)) {
                (bool s, bytes memory data) = owner().call{
                    value: bidder.amount
                }("");
                require(s, "refund eth falied");
            } else {
                IERC20(bidder.token).transfer(owner(), bidder.amount);
            }
        }
    }

    // 授权升级
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    /* 接受ETH */
    receive() external payable {}

    function version() external pure returns (string memory) {
        return "V1";
    }
}
