pragma solidity ^0.8.23;

import {NativeOrderFactory, IWETH, IERC20} from '../lib/limit-order-protocol/contracts/extensions/NativeOrderFactory.sol';

contract TestNativeOrderFactory is NativeOrderFactory {
    constructor(
        IWETH weth,
        address limitOrderProtocol,
        IERC20 accessToken,
        uint256 cancellationDelay,
        string memory name,
        string memory version
    )
        NativeOrderFactory(
            weth,
            limitOrderProtocol,
            accessToken,
            cancellationDelay, // Recommended 60 seconds delay after order expiration for rewardable cancellation
            name,
            version
        )
    {}
}