// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

import {CommunityCounter} from "./CommunityCounter.sol";
import {Test} from "forge-std/Test.sol";

contract CommunityCounterTest is Test {
  CommunityCounter counter;
  address leader = makeAddr("leader");

  function setUp() public {
    counter = new CommunityCounter(leader);
  }

  function test_InitialValue() public view {
    require(counter.wallet() == 0, "Initial value should be 0");
    require(counter.communityLeader() == leader, "Leader should be the same as init.");
    require(counter.counter() == 0, "Counter should be 0!");
  }

    function test_joinCommunity() public {
        address testAddress = makeAddr("test");

        vm.prank(testAddress);
        counter.joinCommunity();

        require(counter.counter() == 1, "Counter should be 1!");
        require(counter.userIsInCommunity(testAddress) == true, "User should be in community!");
    }

    function test_joinCommunity_userAlreadyJoined() public {
        address testAddress = makeAddr("test");

        vm.prank(testAddress);
        counter.joinCommunity();

        vm.expectRevert(bytes("User is already in the community"));
        vm.prank(testAddress);
        counter.joinCommunity();
    }

    function test_leaveCommunity() public {
        address testAddress = makeAddr("test");

        vm.prank(testAddress);
        counter.joinCommunity();
        vm.prank(testAddress);
        counter.leaveCommunity();

        require(counter.counter() == 0, "Counter should be 0!");
        require(counter.userIsInCommunity(testAddress) == false, "User should not be in community!");
    }

    function test_leaveCommunity_userNotInCommunity() public {
        address testAddress = makeAddr("test");

        vm.expectRevert(bytes("User is not in the community"));
        vm.prank(testAddress);
        counter.leaveCommunity();
    }

    function test_getCommunityCount() public {
        address firstTestAddress = makeAddr("test1");
        address secondTestAddress = makeAddr("test2");

        vm.prank(firstTestAddress);
        counter.joinCommunity();
        vm.prank(secondTestAddress);
        counter.joinCommunity();

        require(counter.getCommunityCount() == 2, "Comunity count should be 2");
    }

    function test_donateToCommunity() public {
        address firstTestAddress = makeAddr("test");

        vm.deal(firstTestAddress, 1 ether);
        vm.prank(firstTestAddress);
        counter.donateToCommunity{value: 1 ether}();

        require(counter.wallet() == 1 ether, "Comunity wallet should have 1 ETH!");
    }

    function test_donateToCommunity_valueToSmall() public {
        address firstTestAddress = makeAddr("test");

        vm.expectRevert(bytes("Value should be more than 0"));
        vm.deal(firstTestAddress, 0 ether);
        vm.prank(firstTestAddress);
        counter.donateToCommunity{value: 0 ether}();
    }

    function test_withdrawFundsFromCommunity() public {
        address firstTestAddress = makeAddr("test");

        vm.deal(firstTestAddress, 1 ether);
        vm.prank(firstTestAddress);
        counter.donateToCommunity{value: 1 ether}();

        vm.prank(leader);
        counter.withdrawFundsFromCommunity();

        require(counter.wallet() == 0, "Community wallet should get robbed!");
    }

    function test_withdrawFundsFromCommunity_wrongCaller() public {
        address firstTestAddress = makeAddr("test");

        vm.deal(firstTestAddress, 1 ether);
        vm.prank(firstTestAddress);
        counter.donateToCommunity{value: 1 ether}();

        vm.expectRevert(bytes("No one but community leader can withdraw :)"));
        vm.prank(firstTestAddress);
        counter.withdrawFundsFromCommunity();
    }

    function test_withdrawFundsFromCommunity_emptyWallet() public {
        vm.expectRevert(bytes("Value should be more than 0"));
        vm.prank(leader);
        counter.withdrawFundsFromCommunity();
    }
}
