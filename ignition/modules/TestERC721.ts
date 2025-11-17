import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyNFTModule", (m) => {
  const testERC721 = m.contract("TestERC721");

  m.call(testERC721, "mint", ["0x9761Cd148E3f463156F2f8f1b65972cf8927C249",
    1n]);

  m.call(testERC721, "setTokenURI", [1n,
    "https://bafybeiajzchab2upbavpoyfctu3t4qyyrgeee2robmjmy2wpf5bwivasd4.ipfs.dweb.link?filename=my-nft-image.png"]);
  return { testERC721: testERC721 };
});
