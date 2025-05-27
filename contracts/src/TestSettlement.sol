pragma solidity ^0.8.23;

import '../lib/fusion-protocol/contracts/SimpleSettlement.sol';

contract TestSettlement is SimpleSettlement {
    // solhint-disable-next-line no-empty-blocks
    constructor(
        address limitOrderProtocol,
        IERC20 accessToken,
        address weth,
        address owner
    ) SimpleSettlement(limitOrderProtocol, accessToken, weth, owner) {}
}
