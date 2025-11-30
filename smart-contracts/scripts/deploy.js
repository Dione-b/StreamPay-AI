// scripts/deploy.js
import hre from "hardhat";

async function main() {
  const StreamPayCore = await hre.ethers.getContractFactory("StreamPayCore");
  const contract = await StreamPayCore.deploy();
  await contract.waitForDeployment();
  console.log("StreamPayCore implantado em:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
