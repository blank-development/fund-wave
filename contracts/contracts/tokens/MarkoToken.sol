// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MarkoToken
 * This token is used in the fundraising campaigns for testing and development.
 */
contract MarkoToken is ERC20 {

    /**
     * @dev Creates a new token with the name "Marko Token" and symbol "MTK"
     * Mints an initial supply of 1,000,000 tokens to the deployer
     */
    constructor() ERC20("Marko Token", "MTK") {
        uint256 initialSupply = 1000000 * 10 ** decimals();

        _mint(msg.sender, initialSupply);
    }
}
