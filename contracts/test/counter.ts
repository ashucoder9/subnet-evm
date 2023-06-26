// (c) 2019-2022, Ava Labs, Inc. All rights reserved.
// See the file LICENSE for licensing terms.

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";

// make sure this is always an admin for the precompile
const adminAddress: string = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";
const COUNTER_ADDRESS = "0x0300000000000000000000000000000000000009";

describe("ExampleCounter", function () {
  let counterContract: Contract;
  let adminSigner: SignerWithAddress;
  let adminSignerPrecompile: Contract;

  before(async function () {
    const ContractF: ContractFactory = await ethers.getContractFactory(
      "ExampleCounter"
    );
    counterContract = await ContractF.deploy();
    await counterContract.deployed();
    const counterContractAddress: string = counterContract.address;
    console.log(`Contract deployed to: ${counterContractAddress}`);

    adminSigner = await ethers.getSigner(adminAddress);
    adminSignerPrecompile = await ethers.getContractAt(
      "ICounter",
      COUNTER_ADDRESS,
      adminSigner
    );
  });

  // Reads initial value from the counter, expected 0
  it("should readCounter properly", async function () {
    let result = await counterContract.callStatic.readCounter();
    expect(result).to.equal("0");
    console.log(`Result: ${result}`);
  });

  // Counter is not enabled yet
  it("contract should not be able to increment without being enabled", async function () {
    const modifiedCounter = "11";
    let contractRole = await adminSignerPrecompile.readAllowList(
      counterContract.address
    );
    expect(contractRole).to.be.equal(0); // 0 = NONE
    try {
      let tx = await counterContract.setCounter(modifiedCounter);
      await tx.wait();
    } catch (err) {
      return;
    }
    expect.fail("should have thrown error");
  });

  // Adds counter precompile to enabled Allowlist
  it("should add contract to enabled list", async function () {
    let contractRole = await adminSignerPrecompile.readAllowList(
      counterContract.address
    );
    expect(contractRole).to.be.equal(0);

    let enableTx = await adminSignerPrecompile.setEnabled(
      counterContract.address
    );
    await enableTx.wait();
    contractRole = await adminSignerPrecompile.readAllowList(
      counterContract.address
    );
    expect(contractRole).to.be.equal(1); // 1 = ENABLED
  });

  // Increments counter by 11 now
  it("should increaseCounter by 11 now", async function () {
    let res = await counterContract.callStatic.readCounter();

    const modifiedCounter = "11";
    let tx = await counterContract.setCounter(modifiedCounter);
    await tx.wait();

    expect(await counterContract.callStatic.readCounter()).to.be.equal(
      String(+res + +modifiedCounter)
    );
  });

  // Again reads the counter value
  it("should readCounter properly for updated value", async function () {
    let result = await counterContract.callStatic.readCounter();
    console.log(`Result: ${result}`); // Shows the modified counter value
    expect(result).to.equal("11");
  });

  // Increased counter by default value now
  it("should increaseCounter by 1 now", async function () {
    let res = await counterContract.callStatic.readCounter();

    const modifiedCounter = "";
    let tx = await counterContract.setCounter(modifiedCounter);
    await tx.wait();

    expect(await counterContract.callStatic.readCounter()).to.be.equal(
      String(+res + 1) // hardcoded 1 because that is the default value precompile uses when input = ""
    );
  });

  it("should readCounter properly for updated value", async function () {
    let result = await counterContract.callStatic.readCounter();
    console.log(`Result: ${result}`); // Shows the modified counter value
    expect(result).to.equal("12");
  });
  
});