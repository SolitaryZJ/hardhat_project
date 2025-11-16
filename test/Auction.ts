import {before, describe, it} from "node:test";
import hre, { network } from 'hardhat'
import { encodeFunctionData  } from 'viem';


describe("NFTAuction UUPS", async function () {
    const { viem } = await network.connect();
    let nft: any, proxy: any, v1Impl: any, v2Impl: any;
    let deployer: any, seller: any, bob: any;
    let publicClient: any;

    before(async () => {
        const net = await network.connect();
        [deployer, seller, bob] = await net.viem.getWalletClients();
        publicClient = await net.viem.getPublicClient();
    });
    it("Deploy V1 implementation + UUPS proxy", async function () {
        // 1. NFT
        nft = await viem.deployContract("TestERC721");
        const tokenId = 1n;
        await nft.write.mint([seller.account.address, tokenId]); // 给seller nft
        await nft.write.setTokenURI(["https://bafybeiajzchab2upbavpoyfctu3t4qyyrgeee2robmjmy2wpf5bwivasd4.ipfs.dweb.link?filename=my-nft-image.png"]);

        // 2. V1 实现
        v1Impl = await viem.deployContract("NFTAuction");
        console.log("V1 impl:", v1Impl.address);

        await nft.write.approve([v1Impl.address, tokenId], {
            account: seller.account, // 指定seller发起交易发起交易
            });

        /* 3. 用升级插件部署 UUPS 代理（内部需要 ethers 工厂）*/
        const artifact = await hre.artifacts.readArtifact("NFTAuction");
        const initData = encodeFunctionData({
            abi: artifact.abi,
            functionName: "initialize",
            args: [nft, tokenId, 10n, 100n],
        });

        const proxy = await viem.deployContract("ERC1967Proxy", [
            v1Impl.address,
            initData,
        ]);

        const auction = await viem.getContractAt("NFTAuctionV2", proxy.target);

        await auction.read.upgradeTest();
    });
})