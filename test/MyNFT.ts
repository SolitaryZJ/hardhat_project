import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("MyNFT", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  console.log(publicClient);
  const addr = (await viem.getWalletClients())[0].account.address
  console.log(addr);

  it("The mint result", async function () {
    const myNFT = await viem.deployContract("MyNFT");
    await myNFT.write.mint([addr, "https://bafybeiajzchab2upbavpoyfctu3t4qyyrgeee2robmjmy2wpf5bwivasd4.ipfs.dweb.link?filename=my-nft-image.png"]);
    assert.equal(await myNFT.read.balanceOf([addr]), 1n)
  });

});
