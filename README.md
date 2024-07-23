Check Deployment on : https://sepolia.etherscan.io/address/0x0c7f75679cd43BE9d44a3498F21F804C2e4676f3#writeContract

Installation

    Clone the repository:

    sh

git clone https://github.com/SebastienValla/eiger-erc20-swap.git
cd eiger-erc20-swap

Install dependencies:

sh

    npm install

Environment Variables

Create a .env file in the root directory and configure the following environment variables:

makefile

PK_1=
ETHERSCAN_API_KEY=
POLYGONSCAN_API_KEY=
VERIFY=true
MAINNET_RPC=
SEPOLIA_RPC=

Compile and Deploy

    Compile the contracts:

    sh

npx hardhat compile

Deploy the contract:

sh

    npx hardhat run scripts/deployERC20Swapper.ts --network sepolia

Verification

If VERIFY is set to true in the environment variables, the deployment script will attempt to verify the contract on Etherscan or Polygonscan.
Testing

The repository includes a comprehensive test suite written in TypeScript using Hardhat and Chai.
Running Tests

To run the tests, execute:

sh

npx hardhat test

Scripts
Deployment Script

Located at scripts/deployERC20Swapper.ts, the deployment script handles contract deployment and optional verification.