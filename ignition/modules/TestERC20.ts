import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TestERC20Module", (m) => {
  const testERC20 = m.contract("TestERC20");
  return { testERC20: testERC20 };
});
