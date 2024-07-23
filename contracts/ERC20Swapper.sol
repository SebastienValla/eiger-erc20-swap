// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IERC20.sol";

interface IERC20Swapper {
    /// @dev swaps the `msg.value` Ether to at least `minAmount` of tokens in `address`, or reverts
    /// @param token The address of ERC-20 token to swap
    /// @param minAmount The minimum amount of tokens transferred to msg.sender
    /// @return The actual amount of transferred tokens
    function swapEtherToToken(
        address token,
        uint minAmount
    ) external payable returns (uint);
}

contract SimpleERC20Swapper is IERC20Swapper {
    IUniswapV2Router02 public uniswapRouter;
    address public owner;

    event SwapExecuted(
        address indexed user,
        address indexed token,
        uint ethAmount,
        uint tokenAmount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor(address _uniswapRouter) {
        require(_uniswapRouter != address(0), "Invalid Uniswap router address");
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        owner = msg.sender;
    }

    /// @inheritdoc IERC20Swapper
    function swapEtherToToken(
        address token,
        uint minAmount
    ) external payable returns (uint) {
        require(msg.value > 0, "Must send ETH to swap");

        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = token;

        uint[] memory amounts = uniswapRouter.swapExactETHForTokens{
            value: msg.value
        }(minAmount, path, msg.sender, block.timestamp + 300);

        uint amountTransferred = amounts[1];
        require(
            amountTransferred >= minAmount,
            "Received less than minimum amount"
        );

        emit SwapExecuted(msg.sender, token, msg.value, amountTransferred);

        return amountTransferred;
    }

    function changeUniswapRouterAddress(address newRouter) external onlyOwner {
        require(newRouter != address(0), "Invalid address");
        uniswapRouter = IUniswapV2Router02(newRouter);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
