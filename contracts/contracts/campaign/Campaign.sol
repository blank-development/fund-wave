// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ICampaign.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

/**
 * @title Campaign
 * @dev A contract that manages a fundraising campaign with a specific goal and deadline.
 * Campaigns can receive contributions in ERC20 tokens and allow the owner to withdraw funds
 * once the campaign has ended. Supports anonymous comments using Semaphore for zero-knowledge proofs.
 */
contract Campaign is ICampaign, Ownable {
    error CampaignNotEnded();
    error InvalidContribution();
    error NotOwner();
    error NoFundsToWithdraw();
    error AlreadyInitialized();
    error InvalidSemaphoreAddress();
    error InvalidProof();
    error InvalidGoal();
    error InvalidDuration();
    error InvalidToken();
    error CampaignHasEnded();

    /// @notice Campaign information including owner, goal, raised amount, deadline, and token
    CampaignInfo public campaignInfo;

    /// @notice Mapping of contributor addresses to their contribution amounts
    mapping(address => uint256) public contributions;

    /// @notice Flag to track if the campaign has been initialized
    bool private initialized;

    /// @notice The Semaphore contract instance used for zero-knowledge proofs
    ISemaphore public semaphore;

    /// @notice The ID of the group where users can submit anonymous comments
    uint256 public groupId;

    /// @notice Event emitted when an anonymous comment is submitted
    event AnonymousCommentSubmitted(uint256 indexed nullifier, uint256 comment);

    /**
     * @dev Constructor is only used for the implementation contract
     * The actual campaigns will be initialized using the initialize function
     */
    constructor() Ownable(msg.sender) {
        // This constructor is only used for the implementation contract
        // The actual campaigns will be initialized using the initialize function
    }

    /**
     * @dev Initializes a new campaign with specified parameters
     * @param _goal The fundraising goal in token units
     * @param _duration The duration of the campaign in seconds
     * @param _token The address of the ERC20 token used for contributions
     * @param _semaphoreAddress The address of the Semaphore contract
     * Requirements:
     * - Campaign must not be already initialized
     * - Semaphore address must not be zero
     */
    function initialize(
        uint256 _goal,
        uint256 _duration,
        address _token,
        address _semaphoreAddress
    ) external {
        if (initialized) revert AlreadyInitialized();

        if (_goal == 0) revert InvalidGoal();
        if (_duration == 0) revert InvalidDuration();
        if (_token == address(0)) revert InvalidToken();
        if (_semaphoreAddress == address(0)) revert InvalidSemaphoreAddress();

        initialized = true;
        // semaphore = ISemaphore(_semaphoreAddress);
        // groupId = semaphore.createGroup();

        campaignInfo = CampaignInfo({
            owner: tx.origin,
            goal: _goal,
            raised: 0,
            deadline: block.timestamp + _duration,
            token: _token
        });
    }

    /**
     * @dev Allows a user to join the anonymous comment group
     * @param identityCommitment The user's identity commitment
     */
    function joinGroup(uint256 identityCommitment) external {
        semaphore.addMember(groupId, identityCommitment);
    }

    /**
     * @dev Allows a user to submit an anonymous comment
     * @param merkleTreeDepth The depth of the Merkle tree
     * @param merkleTreeRoot The root of the Merkle tree
     * @param nullifier The nullifier to prevent double submissions
     * @param comment The comment message
     * @param points The zero-knowledge proof points
     * Requirements:
     * - Proof must be valid according to Semaphore protocol
     */
    function submitAnonymousComment(
        uint256 merkleTreeDepth,
        uint256 merkleTreeRoot,
        uint256 nullifier,
        uint256 comment,
        uint256[8] calldata points
    ) external {
        ISemaphore.SemaphoreProof memory proof = ISemaphore.SemaphoreProof(
            merkleTreeDepth,
            merkleTreeRoot,
            nullifier,
            comment,
            groupId,
            points
        );

        try semaphore.validateProof(groupId, proof) {
            emit AnonymousCommentSubmitted(nullifier, comment);
        } catch {
            revert InvalidProof();
        }
    }

    /**
     * @dev Allows users to contribute to the campaign
     * @param amount The amount of tokens to contribute
     * Requirements:
     * - Campaign must not have ended (current time <= deadline)
     * - Contribution amount must be greater than zero
     * - User must have approved the contract to spend their tokens
     */
    function contribute(uint256 amount) external override {
        if (block.timestamp > campaignInfo.deadline) revert CampaignHasEnded();
        if (amount == 0) revert InvalidContribution();

        IERC20(campaignInfo.token).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        contributions[msg.sender] += amount;
        campaignInfo.raised += amount;

        emit ContributionMade(msg.sender, amount);
    }

    /**
     * @dev Allows the campaign owner to end the campaign
     * Requirements:
     * - Caller must be the campaign owner
     * - Campaign must have ended (current time > deadline)
     */
    function endCampaign() external override {
        if (msg.sender != campaignInfo.owner) revert NotOwner();
        if (block.timestamp <= campaignInfo.deadline) revert CampaignNotEnded();

        emit CampaignEnded(campaignInfo.raised);
    }

    /**
     * @dev Allows the campaign owner to withdraw all raised funds
     * Requirements:
     * - Caller must be the campaign owner
     * - Campaign must have ended (current time > deadline)
     * - Campaign must have raised funds
     */
    function withdrawFunds() external override {
        if (msg.sender != campaignInfo.owner) revert NotOwner();
        if (block.timestamp <= campaignInfo.deadline) revert CampaignNotEnded();
        if (campaignInfo.raised == 0) revert NoFundsToWithdraw();

        uint256 amount = campaignInfo.raised;
        campaignInfo.raised = 0;

        IERC20(campaignInfo.token).transfer(msg.sender, amount);
        emit FundsWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Returns the campaign information
     * @return CampaignInfo struct containing all campaign details
     */
    function getCampaignInfo()
        external
        view
        override
        returns (CampaignInfo memory)
    {
        return campaignInfo;
    }

    /**
     * @dev Returns the contribution amount for a specific address
     * @param contributor The address to check contributions for
     * @return The amount contributed by the specified address
     */
    function getContribution(
        address contributor
    ) external view override returns (uint256) {
        return contributions[contributor];
    }
}
