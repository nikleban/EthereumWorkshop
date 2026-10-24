// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

contract CommunityCounter {
    address public communityLeader;
    uint public counter = 0;
    uint public wallet = 0;
    mapping(address => bool) public userIsInCommunity;


    constructor(address leader) {
        communityLeader = leader;        
    }

    function joinCommunity() public {
        require(!userIsInCommunity[msg.sender], "User is already in the community");
        userIsInCommunity[msg.sender] = true;
        counter += 1;
    }
    
    function leaveCommunity() public {
        require(userIsInCommunity[msg.sender], "User is not in the community");
        userIsInCommunity[msg.sender] = false;
        counter -= 1;
    }

    function getCommunityCount() view public returns (uint) {
        return counter;
    }

    function donateToCommunity() payable public {
        require(msg.value > 0, "Value should be more than 0");
        wallet += msg.value;
    }


    function withdrawFundsFromCommunity() public {
        require(msg.sender == communityLeader, "No one but community leader can withdraw :)");
        require(wallet > 0, "Value should be more than 0");

        uint amount = wallet;
        wallet = 0;

        (bool ok, ) = communityLeader.call{value: amount}("");
        require(ok, "Transfer failed");
    }

}