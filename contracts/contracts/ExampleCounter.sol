//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ICounter.sol";

contract ExampleCounter {
  address constant COUNTER_ADDRESS = 0x0300000000000000000000000000000000000009;
  ICounter ck = ICounter(COUNTER_ADDRESS);

  function readCounter() public view returns (string memory) {
    return ck.getCounter();
  }

  function setCounter(string calldata X) public {
    ck.increaseCounter(X);
  }
}