// (c) 2019-2022, Ava Labs, Inc. All rights reserved.
// See the file LICENSE for licensing terms.

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";

// make sure this is always an admin for the precompile
const adminAddress: string = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";
const MD5_ADDRESS = "0x0300000000000000000000000000000000000009";

describe("ExampleMd5", function () {
  let md5Contract: Contract;
  let adminSigner: SignerWithAddress;
  let adminSignerPrecompile: Contract;

  before(async function () {
    // Deploy precompile contract
    const ContractF: ContractFactory = await ethers.getContractFactory(
      "ExampleMd5"
    );
    md5Contract = await ContractF.deploy();
    await md5Contract.deployed();
    const md5ContractAddress: string = md5Contract.address;
    console.log(`Contract deployed to: ${md5ContractAddress}`);

    adminSigner = await ethers.getSigner(adminAddress);
    adminSignerPrecompile = await ethers.getContractAt(
      "IMd5",
      MD5_ADDRESS,
      adminSigner
    );
  });

  it("contract should not be able to compute has without being enabled", async function () {
    const inputString = "Hello";
    let contractRole = await adminSignerPrecompile.readAllowList(
      md5Contract.address
    );
    expect(contractRole).to.be.equal(0); // 0 = NONE
    try {
      let tx = await md5Contract.md5Hash(inputString);
      await tx.wait();
    } catch (err) {
      return;
    }
    expect.fail("should have thrown error");
  });

  it("should add contract to enabled list", async function () {
    let contractRole = await adminSignerPrecompile.readAllowList(
      md5Contract.address
    );
    expect(contractRole).to.be.equal(0);

    let enableTx = await adminSignerPrecompile.setEnabled(
      md5Contract.address
    );
    await enableTx.wait();
    contractRole = await adminSignerPrecompile.readAllowList(
      md5Contract.address
    );
    expect(contractRole).to.be.equal(1); // 1 = ENABLED
  });

  it("should compute correct hash", async function () {
    const inputString = "Hello";
    let tx = await md5Contract.md5Hash(inputString);
    console.log(tx);

    expect(tx).to.be.equal(
      "0x8b1a9953c4611296a827abf8c47804d7"
    );
  });
});