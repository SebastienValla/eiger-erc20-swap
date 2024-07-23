import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import dotenv from "dotenv";

dotenv.config();

const { PK_1, ETHERSCAN_API_KEY, MAINNET_RPC, SEPOLIA_RPC } = process.env;

if (!PK_1 || !ETHERSCAN_API_KEY ||!MAINNET_RPC || !SEPOLIA_RPC) {
  throw new Error("Please set the environment variables");
}

const privateKey1 = PK_1
const etherscanApiKey = ETHERSCAN_API_KEY
const mainnetRpc= MAINNET_RPC
const sepoliaRpc = SEPOLIA_RPC

function isPrivateKeyValid(pk: string): boolean {
  return /^(0x)?[0-9a-fA-F]{64}$/.test(pk);
}

const privateKeys = [privateKey1];

if (!privateKeys.every(isPrivateKeyValid)) {
  throw new Error("Invalid private key detected");
}

const networkConfig = (url: string) => ({
  url,
  accounts: privateKeys,
});

const config: HardhatUserConfig = {
  gasReporter: {
    currency: "USD",
    gasPrice: 27,
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: mainnetRpc,
      },
    },
    sepolia: networkConfig(sepoliaRpc),
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: {
      mainnet: etherscanApiKey,
      sepolia: etherscanApiKey,
    },
  },
};

export default config;
