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

  it("should readCounter properly", async function () {
    let result = await counterContract.callStatic.readCounter();
    expect(result).to.equal("0");
  });

  it("contract should not be able to increment without enabled", async function () {
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
    expect.fail("should have errored");
  });

  it("should be add contract to enabled list", async function () {
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

  it("should setCounter and readCounter", async function () {
    const modifiedCounter = "11";
    let tx = await counterContract.setCounter(modifiedCounter);
    await tx.wait();

    expect(await counterContract.callStatic.readCounter()).to.be.equal(
      modifiedCounter
    );
  });
});