import { expect } from "chai";
import hardhat from "hardhat";
const ethers = hardhat.ethers;

describe("StreamPayCore", function () {
  let contract, owner, recipient, token;

  beforeEach(async function () {
    [owner, recipient] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ERC20Mock");
    const parseEther = ethers.parseEther ? ethers.parseEther : ethers.utils.parseEther;
    const tokenTx = await Token.deploy("MockToken", "MTK", owner.address, parseEther("1000"));
    token = await tokenTx.waitForDeployment ? await tokenTx.waitForDeployment() : tokenTx;
    console.log('token.address:', token.address);
    console.log('token.target:', token.target);
    if (token.getAddress) {
      const addr = await token.getAddress();
      console.log('token.getAddress():', addr);
    }
    const StreamPayCore = await ethers.getContractFactory("StreamPayCore");
    const contractTx = await StreamPayCore.deploy();
    contract = await contractTx.waitForDeployment ? await contractTx.waitForDeployment() : contractTx;
  });

  it("deve criar um stream corretamente", async function () {
      // console.log('recipient:', recipient);
      // console.log('recipient.address:', recipient.address);
      // console.log('token:', token);
      // console.log('token.target:', token.target);
    const parseEther = ethers.parseEther ? ethers.parseEther : ethers.utils.parseEther;
    await token.approve(contract.target, parseEther("100"));
    const deposit = parseEther("1");
    const duration = 1;
    const ratePerSecond = deposit; // 1 ether por segundo, divisão exata
    const tokenAddress = await token.getAddress();
    console.log('recipient.address:', recipient.address);
    console.log('tokenAddress:', tokenAddress);
    console.log('deposit:', deposit);
    console.log('ratePerSecond:', ratePerSecond);
    console.log('duration:', duration);
    await expect(
      contract.createStream(
        recipient.address,
        tokenAddress,
        deposit,
        ratePerSecond,
        duration
      )
    ).to.emit(contract, "StreamCreated");
  });

  it("deve permitir claim do stream", async function () {
    const parseEther = ethers.parseEther ? ethers.parseEther : ethers.utils.parseEther;
    await token.approve(contract.target, parseEther("100"));
    const deposit = parseEther("1");
    const duration = 1;
    const ratePerSecond = deposit; // 1 ether por segundo, divisão exata
    const tokenAddress = await token.getAddress();
    console.log('recipient.address:', recipient.address);
    console.log('tokenAddress:', tokenAddress);
    console.log('deposit:', deposit);
    console.log('ratePerSecond:', ratePerSecond);
    console.log('duration:', duration);
    await contract.createStream(recipient.address, tokenAddress, deposit, ratePerSecond, duration);
    await expect(contract.connect(recipient).claim(0)).to.emit(contract, "StreamClaimed");
  });
});
