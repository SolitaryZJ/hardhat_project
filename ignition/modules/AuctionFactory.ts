import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("NFTAuctionFactoryModule", (m) => {
  const template = m.contract("NFTAuction");
  // TODO 设置pricefeed地址, 可以添加其他初始化调用
  m.call(template, "setPriceFeed", ["0x0000000000000000000000000000000000000000", '0x694AA1769357215DE4FAC081bf1f309aDC325306']);
 
  const NFTAuctionFactory = m.contract("NFTAuctionFactory", [template.getAddress()]);

  return { NFTAuctionFactory: NFTAuctionFactory };
});
