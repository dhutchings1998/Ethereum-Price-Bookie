// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract BetContractFactory {
    address manager;
    mapping(address => BetContract[]) public addressToContracts;
    mapping(address => bool) public addressExists;
    mapping(address => uint) public addressToPayout;

    event NewContract(address creator);
    event PayoutWinnings(address recipient);
    
    constructor() {
        manager = msg.sender;
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function createBetContract(uint targetGuess, uint marginOfError, uint numDays, uint startTimestamp, uint endTimestamp) public payable {
        require(msg.value > 0, "Need to contribute ether in order to place bet");
        require(msg.value < address(this).balance / 5, "Can't bet more than 20% of the value of the pot");
        require(numDays >= 1, "Bet needs to be placed at least 1 day in the future");
        require(marginOfError <= 50, "Margin of error must be less than $50");
        
        BetContract newContract = new BetContract(msg.sender, manager, msg.value, targetGuess, marginOfError, numDays, startTimestamp, endTimestamp);
        
        if (addressExists[msg.sender] == true) {
            addressToContracts[msg.sender].push(newContract);
        } else {
            addressToContracts[msg.sender] = [newContract];
            addressExists[msg.sender] = true;
        }
        emit NewContract(msg.sender);
    }
    
    function calculatePayout(address bettor, uint[] memory correctPrices) public restricted {
        BetContract[] storage liveContracts = addressToContracts[bettor];

        for (uint i=0; i < liveContracts.length; i++) {
            BetContract bc = liveContracts[i];
            require(bc.potentialReward() > 0, "Potential reward must be greater than $0");
            
            uint currentTimestamp = block.timestamp;

            if (bc.didWin(correctPrices[i], currentTimestamp) == true) {
                addressToPayout[bettor] += bc.potentialReward();
            }
            
            if (currentTimestamp > bc.endTimestamp()) {
                removeContract(i, liveContracts);
            }
        }
    }
    
    function payoutWinnings(address recipient) public restricted {
        payable(recipient).transfer(addressToPayout[recipient]);
        addressToPayout[recipient] = 0;
        emit PayoutWinnings(recipient);
    }
    
    function removeContract(uint index, BetContract[] storage bets) internal {
          require(index < bets.length, "Index out of range");
          bets[index] = bets[bets.length-1];
          bets.pop();
    }
}

contract BetContract {
    address public bettor; // address
    address public manager;
    uint public betAmount; // wei
    uint public targetGuess; // 
    uint public marginOfError; 
    uint public numDays; // int
    uint public potentialReward; // wei
    uint public startTimestamp; // timestamp
    uint public endTimestamp; // timestamp

    
    modifier restricted() {
        require(msg.sender == manager, "Only manager can call this function");
        _;
    }
    
    constructor(address _bettor, address _manager, uint _betAmount, uint _targetGuess, uint _marginOfError, uint _numDays, uint _startTimestamp, uint _endTimestamp) {
        bettor = _bettor;
        manager = _manager;
        betAmount = _betAmount;
        targetGuess = _targetGuess;
        marginOfError = _marginOfError;
        numDays = _numDays;
        startTimestamp = _startTimestamp;
        endTimestamp = _endTimestamp;
        potentialReward = _betAmount;
    }
    
    function setPotentialReward(uint payout) public restricted {
        potentialReward = payout;
    }
    
    function didWin(uint correctPrice, uint currentTimestamp) public view returns (bool) {
        uint lowerBound = targetGuess - marginOfError;
        uint upperBound = targetGuess + marginOfError;
        
        if (correctPrice <= upperBound && correctPrice >= lowerBound && currentTimestamp > endTimestamp) {
            return true;
        }
        return false;
    }
}
