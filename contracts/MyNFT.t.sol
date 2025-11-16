pragma solidity ^0.8.26;

import "forge-std/src/Test.sol";
import {MyNFT} from "./MyNFT.sol";
import {Test} from "forge-std/Test.sol";

contract MyNFTTest is Test{
    MyNFT myNFT;
    function setUp() public {
        myNFT = new MyNFT();
    }
    function testMint() public {
        myNFT.mint(address(this), "https://bafybeiajzchab2upbavpoyfctu3t4qyyrgeee2robmjmy2wpf5bwivasd4.ipfs.dweb.link?filename=my-nft-image.png");
        assertEq(myNFT.balanceOf(address(this)), 1);
    }
}