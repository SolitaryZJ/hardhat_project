import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";
export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      //url: configVariable("SEPOLIA_RPC_URL", "{sepolia_url}"),
      //accounts: [configVariable("SEPOLIA_PRIVATE_KEY", "{sepolia_account}")],
      url: "https://eth-sepolia.g.alchemy.com/v2/OLIHAnkdXwaywPvwWxXiA",
      accounts: ["143611b795be4190b2c15a47e287a4c512fd71c4cdd9c8a9a28be628d81146b5"],
    },
  },
});
