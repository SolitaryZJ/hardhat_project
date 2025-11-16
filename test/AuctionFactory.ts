import { expect } from 'chai'
import { network} from 'hardhat'
import {before, describe, it} from "node:test";
import { keccak256, encodeAbiParameters, parseAbiParameters, parseEther,zeroAddress } from 'viem';
import { setTimeout } from "timers/promises";


describe("NFTAuctionFactory", async function () {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();
    const [deployer, seller, alice, bob] = await viem.getWalletClients();
    console.log("deployer: ", deployer.account.address);
    console.log("seller: ", seller.account.address);
    console.log("alice: ", alice.account.address);
    console.log("bob: ", bob.account.address);

    it("Should deploy factory & create auction", async function () {

        // 1. 先部署一个 NFT（示例用 ERC721）
        const nft = await viem.deployContract("TestERC721");
        const tokenId = 1n;
        await nft.write.mint([seller.account.address, tokenId]); // 给seller nft
        await nft.write.setTokenURI(["https://bafybeiajzchab2upbavpoyfctu3t4qyyrgeee2robmjmy2wpf5bwivasd4.ipfs.dweb.link?filename=my-nft-image.png"]);

        // 2. 部署Auction Template合约
        const template = await viem.deployContract("NFTAuction");
        // 3. 部署工厂
        const factory = await viem.deployContract("NFTAuctionFactory", [template.address]);

        const salt = keccak256(
            encodeAbiParameters(
                parseAbiParameters('address, uint256'),
                [nft.address, tokenId]
            )
        );
        const predicted = await factory.read.predictAuctionAddress([salt]);
        console.log("predicted auction contract address", predicted)
        
        // 4. seller 把 NFT approve 给acution合约
        await nft.write.approve([predicted, tokenId], {
            account: seller.account, // 指定seller发起交易发起交易
            });

        // 5. 调用 createAuction
        await factory.write.createAuction([
            nft.address,
            tokenId, // tokenId
            100n, // _minBid
            10n, // _duration (秒)
            salt
        ], {
            account: seller.account, //seller 发起创建 这样就能直接将seller nft转给auction合约
        });

        // 6. 获取新拍卖合约地址
        const auction = await viem.getContractAt("NFTAuction", predicted);

        // 7. 进行拍卖前需要进行设置pricefeed（本地网络没有chainlink）
        await auction.write.setPriceFeed([zeroAddress, '0x694AA1769357215DE4FAC081bf1f309aDC325306']);

        const bobBalanceWeiBefore = await publicClient.getBalance({
            address: bob.account.address,
            });
        console.log("bob before balance: ", bobBalanceWeiBefore);

        const sellerBalanceWeiBefore = await publicClient.getBalance({
            address: seller.account.address,
            });
        console.log("seller before balance: ", sellerBalanceWeiBefore);

        // 8. alice进行拍卖(ETH)
        await auction.write.bid([zeroAddress, 1n],{
            account: alice.account,
            value: 101n
        });

        // 9. bob进行拍卖(ETH)
        await auction.write.bid([zeroAddress, 2n], {
            account: bob.account,
            value: 102n
        });

        // 10. 判断是否是bob获取
        const highestBidder = await auction.read.highestBidder();
        expect(bob.account.address == highestBidder, "not match the highestBidder");
        
        // 等待 15 秒（10 000 ms）
        await setTimeout(15_000);
        // 11. auction清算
        await auction.write.settle();

        const bobBalanceWeiAfter = await publicClient.getBalance({
            address: bob.account.address,
            });
        console.log("bob balance: ", bobBalanceWeiAfter);

        const sellerBalanceWeiAfter = await publicClient.getBalance({
            address: seller.account.address,
            });
        console.log("seller balance: ", sellerBalanceWeiAfter);

        // 12. 判断bob是否获取到了nft
        const bobNFTBalance = await nft.read.balanceOf([bob.account.address]);
        expect(bobNFTBalance > 0, "Bob don't have the NFT");


    });
});
