// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./NFTAuction.sol";

contract NFTAuctionV2 is NFTAuction {
    function upgradeTest() public pure returns (string memory) {
        return "Hello, World!";
    }
}
