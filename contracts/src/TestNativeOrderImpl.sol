pragma solidity ^0.8.23;

import {NativeOrderImpl, IWETH, IERC20} from '../lib/limit-order-protocol/contracts/extensions/NativeOrderImpl.sol';

contract TestNativeOrderImpl is NativeOrderImpl {
    constructor(
        IWETH weth,
        address nativeOrderImplementation,
        address limitOrderProtocol,
        IERC20 accessToken
    )
        NativeOrderImpl(
            weth,
            nativeOrderImplementation,
            limitOrderProtocol,
            accessToken
        )
    {}
}
