// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICampaign {
    struct CampaignInfo {
        address owner;
        uint256 goal;
        uint256 raised;
        uint256 deadline;
        address token;
    }

    event ContributionMade(address indexed contributor, uint256 amount);
    event CampaignEnded(uint256 totalRaised);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    function contribute(uint256 amount) external;
    function endCampaign() external;
    function withdrawFunds() external;
    function getCampaignInfo() external view returns (CampaignInfo memory);
    function getContribution(address contributor) external view returns (uint256);
}