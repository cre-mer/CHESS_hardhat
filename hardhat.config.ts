import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

const envConfig = {
  testnetMnemonic: process.env.HARDHAT_TESTNET_MNEMONIC,
  reportGas: process.env.HARDHAT_REPORT_GAS === "true",
};

const testnetAccountConfig = {
  mnemonic: envConfig.testnetMnemonic,
  count: 20,
};

const hardhatNetworkConfig = {
  // this is the default value for 'hardhat' network
  // defining here to access it from `hre.config.network.chainId` when using `local-testnet` param
  chainId: 31337,
  blockGasLimit: 50e6, // 50.000.000
  accounts: testnetAccountConfig,
};

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(`${account.address} => ${await account.getBalance()}`);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  defaultNetwork: "hardhat",
  networks: {
    // NOTE: we use same config for 'local-testnet' and 'hardhat' because we can only use
    // `npx hardhat node --network hardhat` to start local node, and need another network name to
    // run tasks / testsuite (using `--network hardhat` will start an in-process node)
    hardhat: hardhatNetworkConfig,
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
