// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ICampaign
 * @dev Interface for the Campaign contract that manages fundraising campaigns
 * with anonymous comment functionality using Semaphore protocol.
 */
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
    event AnonymousCommentSubmitted(uint256 indexed nullifier, uint256 comment);

    function contribute(uint256 amount) external;
    function endCampaign() external;
    function withdrawFunds() external;
    function getCampaignInfo() external view returns (CampaignInfo memory);
    function getContribution(address contributor) external view returns (uint256);
    
    function joinGroup(uint256 identityCommitment) external;
    function submitAnonymousComment(
        uint256 merkleTreeDepth,
        uint256 merkleTreeRoot,
        uint256 nullifier,
        uint256 comment,
        uint256[8] calldata points
    ) external;
} 