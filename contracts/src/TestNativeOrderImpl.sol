pragma solidity ^0.8.23;

import {NativeOrderImpl, IWETH, IERC20} from '../lib/limit-order-protocol/contracts/extensions/NativeOrderImpl.sol';

contract TestNativeOrderImpl is NativeOrderImpl {
    constructor(
        IWETH weth,
        address nativeOrderFactory,
        address limitOrderProtocol,
        IERC20 accessToken,
        uint256 cancellationDelay,
        string memory name,
        string memory version
    )
    NativeOrderImpl(
        weth,
        nativeOrderFactory,
        limitOrderProtocol,
        accessToken,
        cancellationDelay, // Recommended 60 seconds delay after order expiration for rewardable cancellation
        name,
        version
    )
    {}
}