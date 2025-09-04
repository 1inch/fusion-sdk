pragma solidity ^0.8.23;

import {NativeOrderFactory, IWETH, IERC20} from '../lib/limit-order-protocol/contracts/extensions/NativeOrderFactory.sol';

contract TestNativeOrderFactory is NativeOrderFactory {
    constructor(
        IWETH weth,
        address nativeOrderImplementation,
        address limitOrderProtocol,
        IERC20 accessToken
    )
        NativeOrderFactory(
            weth,
            nativeOrderImplementation,
            limitOrderProtocol,
            accessToken
        )
    {}
}
