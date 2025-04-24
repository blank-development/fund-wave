// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

/**
 * @title SemaphoreMock
 * @dev Mock implementation of the Semaphore protocol for testing purposes.
 * This contract simulates the behavior of the Semaphore protocol without actual
 * zero-knowledge proof verification.
 */
contract SemaphoreMock is ISemaphore {
    uint256 private _groupCounter;
    mapping(uint256 => bool) public groups;
    mapping(uint256 => mapping(uint256 => bool)) public members;
    mapping(uint256 => address) public groupAdmins;
    mapping(uint256 => uint256) public merkleTreeDurations;

    error InvalidGroup();
    error MemberAlreadyExists();
    error NotGroupAdmin();

    /**
     * @dev Returns the current group counter
     */
    function groupCounter() external view override returns (uint256) {
        return _groupCounter;
    }

    /**
     * @dev Creates a new group with the caller as admin
     */
    function createGroup() external override returns (uint256) {
        _groupCounter++;
        groups[_groupCounter] = true;
        groupAdmins[_groupCounter] = msg.sender;
        return _groupCounter;
    }

    /**
     * @dev Creates a new group with the specified admin
     */
    function createGroup(address admin) external override returns (uint256) {
        _groupCounter++;
        groups[_groupCounter] = true;
        groupAdmins[_groupCounter] = admin;
        return _groupCounter;
    }

    /**
     * @dev Creates a new group with the specified admin and merkle tree duration
     */
    function createGroup(address admin, uint256 merkleTreeDuration) external override returns (uint256) {
        _groupCounter++;
        groups[_groupCounter] = true;
        groupAdmins[_groupCounter] = admin;
        merkleTreeDurations[_groupCounter] = merkleTreeDuration;
        return _groupCounter;
    }

    /**
     * @dev Updates the admin of a group
     */
    function updateGroupAdmin(uint256 groupId, address newAdmin) external override {
        if (!groups[groupId]) revert InvalidGroup();
        if (msg.sender != groupAdmins[groupId]) revert NotGroupAdmin();
        groupAdmins[groupId] = newAdmin;
    }

    /**
     * @dev Accepts the role of group admin
     */
    function acceptGroupAdmin(uint256 groupId) external override {
        if (!groups[groupId]) revert InvalidGroup();
        groupAdmins[groupId] = msg.sender;
    }

    /**
     * @dev Updates the merkle tree duration of a group
     */
    function updateGroupMerkleTreeDuration(uint256 groupId, uint256 newMerkleTreeDuration) external override {
        if (!groups[groupId]) revert InvalidGroup();
        if (msg.sender != groupAdmins[groupId]) revert NotGroupAdmin();
        merkleTreeDurations[groupId] = newMerkleTreeDuration;
    }

    /**
     * @dev Adds a member to a group
     */
    function addMember(uint256 groupId, uint256 identityCommitment) external override {
        if (!groups[groupId]) revert InvalidGroup();
        if (members[groupId][identityCommitment]) revert MemberAlreadyExists();
        members[groupId][identityCommitment] = true;
    }

    /**
     * @dev Adds multiple members to a group
     */
    function addMembers(uint256 groupId, uint256[] calldata identityCommitments) external override {
        if (!groups[groupId]) revert InvalidGroup();
        for (uint256 i = 0; i < identityCommitments.length; i++) {
            if (!members[groupId][identityCommitments[i]]) {
                members[groupId][identityCommitments[i]] = true;
            }
        }
    }

    /**
     * @dev Updates a member's identity commitment
     */
    function updateMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external override {
        if (!groups[groupId]) revert InvalidGroup();
        if (!members[groupId][identityCommitment]) revert InvalidGroup();
        members[groupId][identityCommitment] = false;
        members[groupId][newIdentityCommitment] = true;
    }

    /**
     * @dev Removes a member from a group
     */
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external override {
        if (!groups[groupId]) revert InvalidGroup();
        if (!members[groupId][identityCommitment]) revert InvalidGroup();
        members[groupId][identityCommitment] = false;
    }

    /**
     * @dev Validates a zero-knowledge proof
     * For testing purposes, this function accepts any proof where:
     * - The group exists
     * - The points array contains non-zero values
     */
    function validateProof(
        uint256 groupId,
        SemaphoreProof calldata proof
    ) external view override {
        if (!groups[groupId]) revert InvalidGroup();

        // Simple mock validation: check if all points are non-zero
        for (uint256 i = 0; i < proof.points.length; i++) {
            require(proof.points[i] != 0, "Invalid proof points");
        }
    }

    /**
     * @dev Verifies a zero-knowledge proof
     * For testing purposes, this function returns true if validateProof doesn't revert
     */
    function verifyProof(
        uint256 groupId,
        SemaphoreProof calldata proof
    ) external view override returns (bool) {
        try this.validateProof(groupId, proof) {
            return true;
        } catch {
            return false;
        }
    }
} 