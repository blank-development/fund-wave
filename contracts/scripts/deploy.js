const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Deploy MarkoToken
  console.log("Deploying MarkoToken...");
  const MarkoToken = await hre.ethers.getContractFactory("MarkoToken");
  const markoToken = await MarkoToken.deploy();
  await markoToken.waitForDeployment();
  console.log("MarkoToken deployed to:", markoToken.target);

  // Deploy CampaignFactory
  console.log("Deploying CampaignFactory...");
  const CampaignFactory = await hre.ethers.getContractFactory(
    "CampaignFactory"
  );
  const campaignFactory = await CampaignFactory.deploy();
  await campaignFactory.waitForDeployment();
  console.log("CampaignFactory deployed to:", campaignFactory.target);

  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
