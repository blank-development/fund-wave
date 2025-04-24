// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Campaign.sol";
import "./interfaces/ICampaign.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title CampaignFactory
 * @dev Factory contract for creating and managing fundraising campaigns.
 * This contract maintains a registry of all created campaigns and provides
 * functionality to create new campaigns and query existing ones.
 */
contract CampaignFactory {
    // Custom errors for better gas efficiency and error handling
    error InvalidGoal();      // Thrown when campaign goal is zero
    error InvalidDuration();  // Thrown when campaign duration is zero
    error InvalidToken();     // Thrown when token address is zero
    error InvalidSemaphore(); // Thrown when semaphore address is zero

    /// @notice The implementation contract that will be cloned
    address public immutable implementation;

    /// @notice Array of all created campaign addresses
    address[] public campaigns;
    
    /// @notice Event emitted when a new campaign is created
    event CampaignCreated(
        address indexed campaign,
        address indexed owner,
        uint256 goal,
        uint256 duration
    );

    /**
     * @dev Creates a new factory with a campaign implementation contract
     * The implementation contract will be used as a template for all new campaigns
     */
    constructor() {
        implementation = address(new Campaign());
    }

    /**
     * @dev Creates a new campaign with specified parameters using Clones
     * @param _goal The fundraising goal in token units
     * @param _duration The duration of the campaign in seconds
     * @param _token The address of the ERC20 token used for contributions
     * @param _semaphoreAddress The address of the Semaphore contract for anonymous comments
     * @return The address of the newly created campaign
     * Requirements:
     * - Goal must be greater than zero
     * - Duration must be greater than zero
     * - Token address must not be zero
     * - Semaphore address must not be zero
     */
    function createCampaign(
        uint256 _goal,
        uint256 _duration,
        address _token,
        address _semaphoreAddress
    ) external returns (address) {
        if (_goal == 0) revert InvalidGoal();
        if (_duration == 0) revert InvalidDuration();
        if (_token == address(0)) revert InvalidToken();
        if (_semaphoreAddress == address(0)) revert InvalidSemaphore();

        address clone = Clones.clone(implementation);
        Campaign(clone).initialize(_goal, _duration, _token, _semaphoreAddress);
        
        campaigns.push(clone);

        emit CampaignCreated(clone, msg.sender, _goal, _duration);
    }

    /**
     * @dev Returns all created campaign addresses
     * @return Array of campaign addresses
     */
    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }
} 