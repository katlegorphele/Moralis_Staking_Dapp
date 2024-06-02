// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Staking {
    address public owner;

    struct Position{
        uint positionId;
        address walletAddress;
        uint createdDate;
        uint unlockDate;
        uint percentInterest;
        uint WeiStaked;
        uint WeiInterest;
        bool open;
    }

    Position position;

    uint public currentPositionId;

    mapping(uint => Position) public positions;
    mapping(address => uint[]) public positionIdByAddress;
    mapping(uint => uint) public tiers;
    uint[] public lockPeriods;

    constructor() payable {
        owner = msg.sender;
        currentPositionId = 0;

        tiers[0] = 700;
        tiers[30] = 800;
        tiers[60] = 900;
        tiers[90] = 1200;

        lockPeriods.push(0);
        lockPeriods.push(30);
        lockPeriods.push(60);
        lockPeriods.push(90);
    }

    function stakeEther( uint numDays) external payable {
        require(tiers[numDays] > 0, "Invalid number of days");

        positions[currentPositionId] = Position(
            currentPositionId,
            msg.sender,
            block.timestamp,
            block.timestamp + (numDays * 1 days),
            tiers[numDays],
            msg.value,
            calculateInterest(tiers[numDays], msg.value),
            true
        );

        positionIdByAddress[msg.sender].push(currentPositionId);
        currentPositionId++;
    }

    function calculateInterest(uint basisPoints, uint weiAmount) private pure returns(uint) {
        return (basisPoints * weiAmount) / 10000;
    }

}