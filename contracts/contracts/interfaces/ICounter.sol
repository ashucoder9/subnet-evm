// (c) 2022-2023, Ava Labs, Inc. All rights reserved.
// See the file LICENSE for licensing terms.

// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;
import "./IAllowList.sol";

interface ICounter is IAllowList {
  // getCounter returns the stored value
  function getCounter() external view returns (string calldata result);

  // increaseCounter changes the counter state
  function increaseCounter(string calldata response) external;
}