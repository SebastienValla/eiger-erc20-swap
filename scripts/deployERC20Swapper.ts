import { ethers, run } from "hardhat";
import routerAddresses from "../routerAddresses.json";

async function main() {
  try {
    const [deployer] = await ethers.getSigners();

    const SimpleERC20Swapper = await ethers.getContractFactory(
      "SimpleERC20Swapper"
    );

    const uniswapRouterAddress = routerAddresses.EthereumSepolia.V2Router02ContractAddress;
    const simpleERC20SwapperInstance = await SimpleERC20Swapper.deploy(
      uniswapRouterAddress
    );

    await simpleERC20SwapperInstance.deployed();

    console.log(
      `SimpleERC20Swapper contract deployed to ${simpleERC20SwapperInstance.address} by ${deployer.address}`
    );

    // Contract verification process if VERIFY is set to true
    if (process.env.VERIFY === "true") {
      console.log("Contract verification process initiated...");
      console.log("Waiting 60 seconds before starting verification...");
      await delay(60000);

      for (let i = 0; i < 3; i++) {
        try {
          console.log(
            `Verification attempt ${i + 1} for SimpleERC20Swapper contract...`
          );
          await run("verify:verify", {
            address: simpleERC20SwapperInstance.address,
            constructorArguments: [uniswapRouterAddress],
          });
          console.log("Contract verified on Etherscan.");
          break;
        } catch (error) {
          console.error(`Verification attempt ${i + 1} failed:`, error.message);
          if (i === 2) {
            console.log(
              "Final attempt failed. Verification was not successful."
            );
          } else {
            console.log("Retrying verification in 30 seconds...");
            await delay(30000);
          }
        }
      }
    } else {
      console.log("Skipping contract verification (VERIFY not set to true).");
    }
  } catch (error) {
    console.error("Deployment script encountered an error:", error.message);
    process.exitCode = 1;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error("Main function encountered an error:", error.message);
  process.exitCode = 1;
});
