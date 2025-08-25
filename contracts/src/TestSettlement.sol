pragma solidity ^0.8.23;

import {SimpleSettlement, IERC20} from '../lib/fusion-protocol/contracts/SimpleSettlement.sol';
import {ETHOrders, IWETH} from '../lib/limit-order-protocol/contracts/extensions/ETHOrders.sol';

contract TestSettlement is SimpleSettlement {
    constructor(
        address limitOrderProtocol,
        IERC20 accessToken,
        address weth,
        address owner
    ) SimpleSettlement(limitOrderProtocol, accessToken, weth, owner) {}
}

contract TestEthOrders is ETHOrders {
    constructor(
        IWETH weth,
        address limitOrderProtocol,
        IERC20 accessToken
    ) ETHOrders(weth, limitOrderProtocol, accessToken) {}
}
