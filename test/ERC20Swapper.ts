import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleERC20Swapper Contract Tests", function () {
  const UNISWAP_V2_ROUTER_ADDRESS =
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Mainnet Uniswap V2 Router

  async function deploySwapperFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const Swapper = await ethers.getContractFactory("SimpleERC20Swapper");
    const swapperInstance = await Swapper.deploy(UNISWAP_V2_ROUTER_ADDRESS);

    return {
      swapperInstance,
      owner,
      user1,
      user2,
    };
  }

  describe("Deployment Tests", function () {
    it("Should deploy the contract and set the Uniswap router address correctly", async function () {
      const { swapperInstance } = await loadFixture(deploySwapperFixture);

      expect(await swapperInstance.uniswapRouter()).to.equal(
        UNISWAP_V2_ROUTER_ADDRESS
      );
    });

    it("Should set the owner correctly", async function () {
      const { swapperInstance, owner } = await loadFixture(
        deploySwapperFixture
      );

      expect(await swapperInstance.owner()).to.equal(owner.address);
    });
  });

  describe("Swap Functionality Tests", function () {
    it("Should swap ETH for tokens and emit an event", async function () {
      const { swapperInstance, user1 } = await loadFixture(
        deploySwapperFixture
      );

      const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT Token address on mainnet
      const minAmount = ethers.utils.parseUnits("1", 6); // 1 USDT (6 decimals)

      const swapTx = await swapperInstance
        .connect(user1)
        .swapEtherToToken(tokenAddress, minAmount, {
          value: ethers.utils.parseEther("1"),
        });
      const receipt = await swapTx.wait();

      const swapEvent = receipt.events.find(
        (event) => event.event === "SwapExecuted"
      );
      expect(swapEvent.args.user).to.equal(user1.address);
      expect(swapEvent.args.token).to.equal(tokenAddress);
      expect(swapEvent.args.ethAmount).to.equal(ethers.utils.parseEther("1"));
      expect(swapEvent.args.tokenAmount).to.be.at.least(minAmount);
    });

    it("Should revert if no ETH is sent", async function () {
      const { swapperInstance, user1 } = await loadFixture(
        deploySwapperFixture
      );

      await expect(
        swapperInstance
          .connect(user1)
          .swapEtherToToken(
            "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            ethers.utils.parseUnits("1", 6)
          )
      ).to.be.revertedWith("Must send ETH to swap");
    });

    it("Should revert if received token amount is less than the minimum amount", async function () {
      const { swapperInstance, user1 } = await loadFixture(
        deploySwapperFixture
      );

      const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT Token address on mainnet
      const minAmount = ethers.utils.parseUnits("10000", 6); // 10000 USDT (unrealistically high for 1 ETH)

      await expect(
        swapperInstance
          .connect(user1)
          .swapEtherToToken(tokenAddress, minAmount, {
            value: ethers.utils.parseEther("1"),
          })
      ).to.be.revertedWith("UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT");
    });
  });

  describe("Owner-only Function Tests", function () {
    it("Should allow the owner to change the Uniswap router address", async function () {
      const { swapperInstance, owner } = await loadFixture(
        deploySwapperFixture
      );

      const newRouterAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"; // Uniswap V2 Factory address (for testing)

      await swapperInstance
        .connect(owner)
        .changeUniswapRouterAddress(newRouterAddress);

      expect(await swapperInstance.uniswapRouter()).to.equal(newRouterAddress);
    });

    it("Should revert if a non-owner tries to change the Uniswap router address", async function () {
      const { swapperInstance, user1 } = await loadFixture(
        deploySwapperFixture
      );

      await expect(
        swapperInstance
          .connect(user1)
          .changeUniswapRouterAddress(
            "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
          )
      ).to.be.revertedWith("Not the owner");
    });

    it("Should allow the owner to transfer ownership", async function () {
      const { swapperInstance, owner, user1 } = await loadFixture(
        deploySwapperFixture
      );

      await swapperInstance.connect(owner).transferOwnership(user1.address);

      expect(await swapperInstance.owner()).to.equal(user1.address);
    });

    it("Should revert if a non-owner tries to transfer ownership", async function () {
      const { swapperInstance, user1, user2 } = await loadFixture(
        deploySwapperFixture
      );

      await expect(
        swapperInstance.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWith("Not the owner");
    });

    it("Should revert if new owner address is invalid", async function () {
      const { swapperInstance, owner } = await loadFixture(
        deploySwapperFixture
      );

      await expect(
        swapperInstance
          .connect(owner)
          .transferOwnership(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid address");
    });
  });
});
