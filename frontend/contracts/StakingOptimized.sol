// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// A contract for staking Ether
contract Staking {
    // The owner of the contract
    address public owner;

    // A struct representing a staking position
    struct Position{
        address walletAddress; // The address of the wallet that staked the Ether
        uint createdDate; // The date the position was created
        uint unlockDate; // The date the position can be unlocked
        uint percentInterest; // The interest rate for the position
        uint WeiStaked; // The amount of Ether staked
        uint WeiInterest; // The amount of interest
        bool open; // Whether the position is open or closed
    }

    // The current position ID
    uint public currentPositionId;

    // A mapping from position IDs to positions
    mapping(uint => Position) public positions;
    // A mapping from wallet addresses to arrays of position IDs
    mapping(address => uint[]) public positionIdByAddress;
    // A mapping from numbers of days to interest rates
    mapping(uint => uint) public tiers;
    // An array of lock periods
    uint[] public lockPeriods;

    // The constructor initializes the owner, the current position ID, the tiers, and the lock periods
    constructor() payable {
        owner = msg.sender;
        currentPositionId = 0;

        // Initialize tiers and lockPeriods in a loop
        for(uint i = 0; i <= 90; i += 30) {
            tiers[i] = 700 + (i / 30) * 100;
            lockPeriods.push(i);
        }
    }

    // Stake Ether for a specified number of days
    function stakeEther(uint numDays) external payable {
        require(tiers[numDays] > 0, "Invalid number of days");

        // Increment currentPositionId before creating a new position to prevent race conditions
        currentPositionId++;

        // Create a new position and add it to the positions mapping and the position IDs by address mapping
        positions[currentPositionId] = Position(
            msg.sender,
            block.timestamp,
            block.timestamp + (numDays * 1 days),
            tiers[numDays],
            msg.value,
            calculateInterest(tiers[numDays], msg.value),
            true
        );

        positionIdByAddress[msg.sender].push(currentPositionId);
    }

    // Calculate the interest for a given amount of Ether and a basis point
    function calculateInterest(uint basisPoints, uint weiAmount) internal pure returns(uint) {
        return (basisPoints * weiAmount) / 10000;
    }

    // Get the lock periods
    function getLockPeriods() external view returns(uint[] memory) {
        return lockPeriods;
    }

    // Get the interest rate for a number of days
    function getInterestRate(uint numDays) external view returns(uint) {
        return tiers[numDays];
    }

    // Get a position by ID
    function getPositionById(uint positionId) external view returns(Position memory) {
        return positions[positionId];
    }

    // Get the position IDs for an address
    function getPositionIdForAddress(address walletAddress) external view returns(uint[] memory) {
        return positionIdByAddress[walletAddress];
    }

    // Close a position
    function closePosition(uint positionId) external {
        require(positions[positionId].walletAddress == msg.sender, "You are not the owner of this position");
        require(positions[positionId].open, "Position is already closed");

        // Close the position and transfer the staked amount plus the interest to the caller
        positions[positionId].open = false;

        uint amount = positions[positionId].WeiStaked + positions[positionId].WeiInterest;
        
        // Use transfer instead of call for safety and gas efficiency
        payable(msg.sender).transfer(amount);
    }
}