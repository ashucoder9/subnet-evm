// (c) 2022-2023, Ava Labs, Inc. All rights reserved.
// See the file LICENSE for licensing terms.

// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;
import "./IAllowList.sol";

interface IMd5 is IAllowList {
    
    function md5Hash(string calldata input) external view returns (bytes16 result);

}