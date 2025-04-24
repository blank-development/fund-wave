import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  CampaignFactory,
  Campaign,
  ISemaphore,
  MockToken,
} from "../typechain-types";
import { getAddress, parseEther, ZeroAddress } from "./helpers";

describe("CampaignFactory", () => {
  let factory: CampaignFactory;
  let token: MockToken;
  let semaphore: ISemaphore;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const GOAL = parseEther("100");
  const DURATION = 7 * 24 * 60 * 60; // 7 days

  beforeEach(async () => {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy MockToken
    const MockToken = await ethers.getContractFactory("MockToken");
    token = await MockToken.deploy();
    await token.waitForDeployment();

    // Deploy Semaphore mock
    const SemaphoreMock = await ethers.getContractFactory("SemaphoreMock");
    const semaphoreMock = await SemaphoreMock.deploy();
    await semaphoreMock.waitForDeployment();
    semaphore = semaphoreMock as unknown as ISemaphore;

    // Deploy CampaignFactory
    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.deploy();
    await factory.waitForDeployment();
  });

  describe("Deployment", () => {
    it("should deploy with correct implementation", async () => {
      expect(await factory.implementation()).to.not.equal(ZeroAddress);
    });

    it("should initialize with empty campaigns array", async () => {
      expect(await factory.getCampaigns()).to.deep.equal([]);
    });
  });

  describe("Campaign Creation", () => {
    it("should create new campaign with correct parameters", async () => {
      const tx = await factory.createCampaign(
        GOAL,
        DURATION,
        token.target,
        semaphore.target
      );
      const receipt = await tx.wait();
      const event = receipt?.logs[0];
      const campaignAddress = event?.topics[1] as string;

      const campaign = await ethers.getContractAt(
        "Campaign",
        getAddress(campaignAddress)
      );
      const info = await campaign.getCampaignInfo();

      expect(info.owner).to.equal(owner.address);
      expect(info.goal).to.equal(GOAL);
      expect(info.raised).to.equal(0);
      expect(info.token).to.equal(token.target);
      const block = await ethers.provider.getBlock("latest");
      expect(block).to.not.be.null;
      expect(info.deadline).to.equal(block!.timestamp + DURATION);
    });

    it("should not allow zero goal", async () => {
      await expect(
        factory.createCampaign(0, DURATION, token.target, semaphore.target)
      ).to.be.revertedWithCustomError(factory, "InvalidGoal");
    });

    it("should not allow zero duration", async () => {
      await expect(
        factory.createCampaign(GOAL, 0, token.target, semaphore.target)
      ).to.be.revertedWithCustomError(factory, "InvalidDuration");
    });

    it("should not allow zero token address", async () => {
      await expect(
        factory.createCampaign(GOAL, DURATION, ZeroAddress, semaphore.target)
      ).to.be.revertedWithCustomError(factory, "InvalidToken");
    });

    it("should not allow zero semaphore address", async () => {
      await expect(
        factory.createCampaign(GOAL, DURATION, token.target, ZeroAddress)
      ).to.be.revertedWithCustomError(factory, "InvalidSemaphore");
    });

    it("should not allow double initialization of a campaign", async () => {
      const tx = await factory.createCampaign(
        GOAL,
        DURATION,
        token.target,
        semaphore.target
      );
      const receipt = await tx.wait();
      const event = receipt?.logs[0];
      const campaignAddress = event?.topics[1] as string;

      const campaign = await ethers.getContractAt(
        "Campaign",
        getAddress(campaignAddress)
      );
      await expect(
        campaign.initialize(GOAL, DURATION, token.target, semaphore.target)
      ).to.be.revertedWithCustomError(campaign, "AlreadyInitialized");
    });

    it("should increment campaign count", async () => {
      const campaigns = await factory.getCampaigns();
      expect(campaigns.length).to.equal(0);

      await factory.createCampaign(
        GOAL,
        DURATION,
        token.target,
        semaphore.target
      );
      const campaignsAfter = await factory.getCampaigns();
      expect(campaignsAfter.length).to.equal(1);

      await factory.createCampaign(
        GOAL,
        DURATION,
        token.target,
        semaphore.target
      );
      const campaignsAfter2 = await factory.getCampaigns();
      expect(campaignsAfter2.length).to.equal(2);
    });

    it("should add campaign to campaigns array", async () => {
      await factory.createCampaign(
        GOAL,
        DURATION,
        token.target,
        semaphore.target
      );
      await factory.createCampaign(
        GOAL,
        DURATION,
        token.target,
        semaphore.target
      );

      const campaigns = await factory.getCampaigns();
      expect(campaigns.length).to.equal(2);
    });
  });

  describe("View Functions", () => {
    beforeEach(async () => {
      await factory.createCampaign(
        GOAL,
        DURATION,
        token.target,
        semaphore.target
      );
      await factory.createCampaign(
        GOAL,
        DURATION,
        token.target,
        semaphore.target
      );
    });

    it("should return correct campaign count", async () => {
      const campaigns = await factory.getCampaigns();
      expect(campaigns.length).to.equal(2);
    });

    it("should return all campaigns", async () => {
      const campaigns = await factory.getCampaigns();
      expect(campaigns.length).to.equal(2);

      for (const campaignAddress of campaigns) {
        const campaign = await ethers.getContractAt(
          "Campaign",
          campaignAddress
        );
        const info = await campaign.getCampaignInfo();
        expect(info.owner).to.equal(owner.address);
      }
    });
  });

  describe("Integration Tests", () => {
    it("should allow full campaign lifecycle through factory", async () => {
      // Create campaign
      const tx = await factory.createCampaign(
        GOAL,
        DURATION,
        token.target,
        semaphore.target
      );
      const receipt = await tx.wait();
      const event = receipt?.logs[0];
      const campaignAddress = event?.topics[1] as string;

      // Get campaign instance
      const campaign = await ethers.getContractAt(
        "Campaign",
        getAddress(campaignAddress)
      );

      // Setup contributor
      await token.transfer(user1.address, GOAL);
      await token.connect(user1).approve(getAddress(campaignAddress), GOAL);

      // Make contribution
      await campaign.connect(user1).contribute(GOAL);
      expect(await campaign.getContribution(user1.address)).to.equal(GOAL);

      // End campaign and withdraw
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");
      await campaign.endCampaign();
      await campaign.withdrawFunds();
    });

    it("should allow multiple campaigns to operate independently", async () => {
      // Create two campaigns
      const tx1 = await factory.createCampaign(
        GOAL,
        DURATION,
        token.target,
        semaphore.target
      );
      const tx2 = await factory.createCampaign(
        GOAL * 2n,
        DURATION * 2,
        token.target,
        semaphore.target
      );

      const receipt1 = await tx1.wait();
      const receipt2 = await tx2.wait();
      const event1 = receipt1?.logs[0];
      const event2 = receipt2?.logs[0];
      const campaignAddress1 = event1?.topics[1] as string;
      const campaignAddress2 = event2?.topics[1] as string;

      const campaign1 = await ethers.getContractAt(
        "Campaign",
        getAddress(campaignAddress1)
      );
      const campaign2 = await ethers.getContractAt(
        "Campaign",
        getAddress(campaignAddress2)
      );

      // Verify different parameters
      const info1 = await campaign1.getCampaignInfo();
      const info2 = await campaign2.getCampaignInfo();

      expect(info1.goal).to.equal(GOAL);
      expect(info2.goal).to.equal(GOAL * 2n);
      const block1 = await ethers.provider.getBlock("latest");
      expect(block1).to.not.be.null;

      // Make contributions to both
      await token.transfer(user1.address, GOAL * 3n);
      await token.connect(user1).approve(getAddress(campaignAddress1), GOAL);
      await token
        .connect(user1)
        .approve(getAddress(campaignAddress2), GOAL * 2n);

      await campaign1.connect(user1).contribute(GOAL);
      await campaign2.connect(user1).contribute(GOAL * 2n);

      // Verify independent states
      expect(await campaign1.getContribution(user1.address)).to.equal(GOAL);
      expect(await campaign2.getContribution(user1.address)).to.equal(
        GOAL * 2n
      );

      expect(await campaign1.getCampaignInfo()).to.be.deep.equal([
        owner.address,
        GOAL,
        GOAL,
        info1.deadline,
        token.target,
      ]);
      expect(await campaign2.getCampaignInfo()).to.be.deep.equal([
        owner.address,
        GOAL * 2n,
        GOAL * 2n,
        info2.deadline,
        token.target,
      ]);
    });
  });
});
