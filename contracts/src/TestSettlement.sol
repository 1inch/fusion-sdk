pragma solidity ^0.8.23;

import {SimpleSettlement, IERC20} from '../lib/fusion-protocol/contracts/SimpleSettlement.sol';

contract TestSettlement is SimpleSettlement {
    constructor(
        address limitOrderProtocol,
        IERC20 accessToken,
        address weth,
        address owner
    ) SimpleSettlement(limitOrderProtocol, accessToken, weth, owner) {}
}
