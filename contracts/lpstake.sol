// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';


contract lpstake {
    address owner;
    uint8 immutable _decimalsUSDC = 6;
    ISwapRouter public immutable swapRouter;


    address public constant USDC =0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C ;//goerli
    address public constant WETH9 = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6;//goerli
    address public constant WBTC=0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6 ;//goerli
    address public constant DAI=0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60 ;//goerli


    uint24 public constant poolFee = 3000;

    constructor(ISwapRouter _swapRouter) {
        swapRouter = _swapRouter;//0xE592427A0AEce92De3Edee1F18E0157C05861564
        owner = msg.sender;
    }

    function swapToAll(uint256 _amount) public {
        // amount should be > 0
        require(_amount>0);
        uint256 division= _amount/3;

        TransferHelper.safeTransferFrom(USDC, msg.sender, address(this), _amount);

        TransferHelper.safeApprove(USDC, address(swapRouter),_amount);

        swapExactInputSingle(division,USDC,WBTC);
        swapExactInputSingle(division,USDC,WETH9);
        swapExactInputSingle(division,USDC,DAI);
    }

    function swapToDai(uint256 _amount) public {
        // amount should be > 0
        require(_amount>0);
        TransferHelper.safeTransferFrom(USDC, msg.sender, address(this), _amount);

        TransferHelper.safeApprove(USDC, address(swapRouter),_amount);

      
        swapExactInputSingle(_amount,USDC,DAI);
    }

    function swapToWeth(uint256 _amount) public {
        // amount should be > 0
        require(_amount>0);
        TransferHelper.safeTransferFrom(USDC, msg.sender, address(this), _amount);

        TransferHelper.safeApprove(USDC, address(swapRouter),_amount);

      
        swapExactInputSingle(_amount,USDC,WETH9);
    }

    function swapToWbtc(uint256 _amount) public {
        // amount should be > 0
        require(_amount>0);
        TransferHelper.safeTransferFrom(USDC, msg.sender, address(this), _amount);

        TransferHelper.safeApprove(USDC, address(swapRouter),_amount);

      
        swapExactInputSingle(_amount,USDC,WBTC);
    }


    function swapExactInputSingle(uint256 amountIn,address inToken,address outToken) internal returns (uint256 amountOut) {
          
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: inToken,
                tokenOut: outToken,
                fee: poolFee,
                recipient: msg.sender,
                // recipient:address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }


  
}
