# NFT Auction Market
基于以太坊开发的NFT拍卖合约，支持多种ERC20代币以及ETH拍卖。

# 核心设计
- 多币种拍卖: 支持 ETH 和 ERC20 代币出价

- Chainlink 集成: 实时价格转换和美元价值计算

- 工厂模式: 类似 Uniswap V2 的拍卖实例管理

- 合约升级: UUPS 代理模式支持无损升级

# 开发环境
- Solidity@0.8.10
- Nodejs@24.11.0
- Hardhat@3.0.4
- Viem@2.39.0

# 核心合约
- NFTAuction.sol    NFT拍卖合约
- NFTAuctionV2.sol  NFT拍卖V2升级合约
- NFTAuctionFactory.sol 拍卖工厂
- TestERC20.sol ERC20代币
- TestERC721.sol   NFT

# Usage

## 安装依赖
```
npm install
```

## 编译合约
```
npx hardhat compile
```

## 运行测试
```
npx hardhat test
```

## 配置
To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

## 部署
```
npx hardhat ignition deploy ignition/modules/TestERC20.ts
npx hardhat ignition deploy ignition/modules/TestERC721.ts
npx hardhat ignition deploy ignition/modules/AuctionFactory.ts

-- network sepolia (部署到sepolia网络)
```

