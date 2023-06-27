//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IMd5.sol";

contract ExampleMd5 {
  address constant MD5_ADDRESS = 0x0300000000000000000000000000000000000009;
  IMd5 mdfive = IMd5(MD5_ADDRESS);

  function md5Hash(string calldata input) public view returns (bytes16) {
    return mdfive.md5Hash(input);
  }
}