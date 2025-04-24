import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Campaign, ISemaphore, MockToken } from "../typechain-types";
import { increaseTime, parseEther, ZeroAddress } from "./helpers";

describe("Campaign", () => {
  let campaign: Campaign;
  let token: MockToken;
  let semaphore: ISemaphore;
  let owner: SignerWithAddress;
  let contributor1: SignerWithAddress;
  let contributor2: SignerWithAddress;
  let identityCommitment1: bigint;
  let identityCommitment2: bigint;

  const CAMPAIGN_GOAL = parseEther("100");
  const CAMPAIGN_DURATION = 7 * 24 * 60 * 60; // 7 days
  const CONTRIBUTION_AMOUNT = parseEther("10");

  beforeEach(async () => {
    // Get signers
    [owner, contributor1, contributor2] = await ethers.getSigners();

    // Deploy MockToken
    const MockToken = await ethers.getContractFactory("MockToken");
    token = await MockToken.deploy();
    await token.waitForDeployment();

    // Deploy Semaphore mock
    const SemaphoreMock = await ethers.getContractFactory("SemaphoreMock");
    const semaphoreMock = await SemaphoreMock.deploy();
    await semaphoreMock.waitForDeployment();
    semaphore = semaphoreMock as unknown as ISemaphore;

    // Deploy Campaign
    const Campaign = await ethers.getContractFactory("Campaign");
    campaign = await Campaign.deploy();
    await campaign.waitForDeployment();

    // Initialize campaign
    await campaign.initialize(
      CAMPAIGN_GOAL,
      CAMPAIGN_DURATION,
      token.target,
      semaphore.target
    );

    // Setup initial states
    await token.transfer(contributor1.address, CONTRIBUTION_AMOUNT * 2n);
    await token.transfer(contributor2.address, CONTRIBUTION_AMOUNT * 2n);
    await token
      .connect(contributor1)
      .approve(campaign.target, CONTRIBUTION_AMOUNT * 2n);
    await token
      .connect(contributor2)
      .approve(campaign.target, CONTRIBUTION_AMOUNT * 2n);

    // Generate mock identity commitments
    identityCommitment1 = BigInt(1);
    identityCommitment2 = BigInt(2);
  });

  describe("Initialization", () => {
    it("should initialize with correct parameters", async () => {
      const campaignInfo = await campaign.getCampaignInfo();
      expect(campaignInfo.owner).to.equal(owner.address);
      expect(campaignInfo.goal).to.equal(CAMPAIGN_GOAL);
      expect(campaignInfo.raised).to.equal(0);
      expect(campaignInfo.token).to.equal(token.target);
      expect(campaignInfo.deadline).to.be.gt(0);
    });

    it("should not allow zero goal", async () => {
      const Campaign = await ethers.getContractFactory("Campaign");
      const newCampaign = await Campaign.deploy();
      await newCampaign.waitForDeployment();
      await expect(
        newCampaign.initialize(
          0,
          CAMPAIGN_DURATION,
          token.target,
          semaphore.target
        )
      ).to.be.revertedWithCustomError(newCampaign, "InvalidGoal");
    });

    it("should not allow zero duration", async () => {
      const Campaign = await ethers.getContractFactory("Campaign");
      const newCampaign = await Campaign.deploy();
      await newCampaign.waitForDeployment();
      await expect(
        newCampaign.initialize(CAMPAIGN_GOAL, 0, token.target, semaphore.target)
      ).to.be.revertedWithCustomError(newCampaign, "InvalidDuration");
    });

    it("should not allow zero token address", async () => {
      const Campaign = await ethers.getContractFactory("Campaign");
      const newCampaign = await Campaign.deploy();
      await newCampaign.waitForDeployment();
      await expect(
        newCampaign.initialize(
          CAMPAIGN_GOAL,
          CAMPAIGN_DURATION,
          ZeroAddress,
          semaphore.target
        )
      ).to.be.revertedWithCustomError(newCampaign, "InvalidToken");
    });

    it("should not allow zero semaphore address", async () => {
      const Campaign = await ethers.getContractFactory("Campaign");
      const newCampaign = await Campaign.deploy();
      await newCampaign.waitForDeployment();
      await expect(
        newCampaign.initialize(
          CAMPAIGN_GOAL,
          CAMPAIGN_DURATION,
          token.target,
          ZeroAddress
        )
      ).to.be.revertedWithCustomError(newCampaign, "InvalidSemaphoreAddress");
    });

    it("should not allow double initialization", async () => {
      await expect(
        campaign.initialize(
          CAMPAIGN_GOAL,
          CAMPAIGN_DURATION,
          token.target,
          semaphore.target
        )
      ).to.be.revertedWithCustomError(campaign, "AlreadyInitialized");
    });
  });

  describe("Contributions", () => {
    it("should accept valid contributions", async () => {
      await campaign.connect(contributor1).contribute(CONTRIBUTION_AMOUNT);

      const contribution = await campaign.getContribution(contributor1.address);
      const campaignInfo = await campaign.getCampaignInfo();

      expect(contribution).to.equal(CONTRIBUTION_AMOUNT);
      expect(campaignInfo.raised).to.equal(CONTRIBUTION_AMOUNT);
    });

    it("should emit ContributionMade event", async () => {
      await expect(
        campaign.connect(contributor1).contribute(CONTRIBUTION_AMOUNT)
      )
        .to.emit(campaign, "ContributionMade")
        .withArgs(contributor1.address, CONTRIBUTION_AMOUNT);
    });

    it("should not accept zero contributions", async () => {
      await expect(
        campaign.connect(contributor1).contribute(0)
      ).to.be.revertedWithCustomError(campaign, "InvalidContribution");
    });

    it("should not accept contributions after deadline", async () => {
      await increaseTime(CAMPAIGN_DURATION + 1);
      await expect(
        campaign.connect(contributor1).contribute(CONTRIBUTION_AMOUNT)
      ).to.be.revertedWithCustomError(campaign, "CampaignHasEnded");
    });

    it("should track multiple contributions from same address", async () => {
      await campaign.connect(contributor1).contribute(CONTRIBUTION_AMOUNT);
      await campaign.connect(contributor1).contribute(CONTRIBUTION_AMOUNT);

      const contribution = await campaign.getContribution(contributor1.address);
      expect(contribution).to.equal(CONTRIBUTION_AMOUNT * 2n);
    });
  });

  describe("Campaign End", () => {
    it("should allow owner to end campaign after deadline", async () => {
      await increaseTime(CAMPAIGN_DURATION + 1);
      await expect(campaign.endCampaign())
        .to.emit(campaign, "CampaignEnded")
        .withArgs(0);
    });

    it("should not allow non-owner to end campaign", async () => {
      await increaseTime(CAMPAIGN_DURATION + 1);
      await expect(
        campaign.connect(contributor1).endCampaign()
      ).to.be.revertedWithCustomError(campaign, "NotOwner");
    });

    it("should not allow ending campaign before deadline", async () => {
      await expect(campaign.endCampaign()).to.be.revertedWithCustomError(
        campaign,
        "CampaignNotEnded"
      );
    });
  });

  describe("Fund Withdrawal", () => {
    beforeEach(async () => {
      await campaign.connect(contributor1).contribute(CONTRIBUTION_AMOUNT);
      await increaseTime(CAMPAIGN_DURATION + 1);
      await campaign.endCampaign();
    });

    it("should allow owner to withdraw funds", async () => {
      const initialBalance = await token.balanceOf(owner.address);

      await campaign.withdrawFunds();

      const finalBalance = await token.balanceOf(owner.address);
      expect(finalBalance - initialBalance).to.equal(CONTRIBUTION_AMOUNT);
    });

    it("should emit FundsWithdrawn event", async () => {
      await expect(campaign.withdrawFunds())
        .to.emit(campaign, "FundsWithdrawn")
        .withArgs(owner.address, CONTRIBUTION_AMOUNT);
    });

    it("should not allow non-owner to withdraw", async () => {
      await expect(
        campaign.connect(contributor1).withdrawFunds()
      ).to.be.revertedWithCustomError(campaign, "NotOwner");
    });

    it("should not allow withdrawal before campaign ends", async () => {
      const Campaign = await ethers.getContractFactory("Campaign");
      const newCampaign = await Campaign.deploy();
      await newCampaign.waitForDeployment();
      await newCampaign.initialize(
        CAMPAIGN_GOAL,
        CAMPAIGN_DURATION,
        token.target,
        semaphore.target
      );

      await expect(newCampaign.withdrawFunds()).to.be.revertedWithCustomError(
        newCampaign,
        "CampaignNotEnded"
      );
    });

    it("should not allow withdrawal with no funds", async () => {
      await campaign.withdrawFunds();
      await expect(campaign.withdrawFunds()).to.be.revertedWithCustomError(
        campaign,
        "NoFundsToWithdraw"
      );
    });
  });

  describe("Anonymous Comments", () => {
    it("should allow users to join the comment group", async () => {
      await expect(campaign.joinGroup(identityCommitment1)).to.not.be.reverted;
    });

    it("should allow submitting valid anonymous comments", async () => {
      const merkleTreeDepth = 20;
      const merkleTreeRoot = BigInt(123);
      const nullifier = BigInt(456);
      const comment = BigInt(789);
      const points = Array(8).fill(BigInt(1));

      await campaign.joinGroup(identityCommitment1);

      await expect(
        campaign.submitAnonymousComment(
          merkleTreeDepth,
          merkleTreeRoot,
          nullifier,
          comment,
          points
        )
      )
        .to.emit(campaign, "AnonymousCommentSubmitted")
        .withArgs(nullifier, comment);
    });

    it("should revert with InvalidProof for invalid proof", async () => {
      const merkleTreeDepth = 20;
      const merkleTreeRoot = BigInt(1);
      const nullifier = BigInt(1);
      const comment = BigInt(1);
      const invalidPoints = [
        BigInt(0),
        BigInt(0),
        BigInt(0),
        BigInt(0),
        BigInt(0),
        BigInt(0),
        BigInt(0),
        BigInt(0),
      ];

      await expect(
        campaign.submitAnonymousComment(
          merkleTreeDepth,
          merkleTreeRoot,
          nullifier,
          comment,
          invalidPoints
        )
      ).to.be.revertedWithCustomError(campaign, "InvalidProof");
    });
  });

  describe("View Functions", () => {
    it("should return correct campaign info", async () => {
      const info = await campaign.getCampaignInfo();
      expect(info.owner).to.equal(owner.address);
      expect(info.goal).to.equal(CAMPAIGN_GOAL);
      expect(info.raised).to.equal(0);
      expect(info.token).to.equal(token.target);
    });

    it("should return correct contribution amount", async () => {
      await campaign.connect(contributor1).contribute(CONTRIBUTION_AMOUNT);
      const contribution = await campaign.getContribution(contributor1.address);
      expect(contribution).to.equal(CONTRIBUTION_AMOUNT);
    });

    it("should return zero for addresses that haven't contributed", async () => {
      const contribution = await campaign.getContribution(contributor2.address);
      expect(contribution).to.equal(0);
    });
  });
});
