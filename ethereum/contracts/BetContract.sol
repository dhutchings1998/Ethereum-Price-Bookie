// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BetContractFactory {
    using SafeMath for uint256;
    address public manager;
    mapping(address => BetContract[]) public addressToContracts;
    mapping(address => bool) public addressExists;
    mapping(address => uint256) public addressToPayout;

    event NewContract(address creator);
    event PayoutWinnings(address recipient);

    constructor() {
        manager = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function fundBalance() external payable {}

    function fetchBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function createBetContract(
        uint256 targetGuess,
        uint256 marginOfError,
        uint256 numDays,
        uint256 startTimestamp
    ) public payable {
        require(
            msg.value > 0,
            "Need to contribute ether in order to place bet"
        );
        require(
            msg.value < address(this).balance.div(5),
            "Can't bet more than 20% of the value of the pot"
        );
        require(
            numDays >= 1,
            "Bet needs to be placed at least 1 day in the future"
        );
        require(marginOfError <= 50, "Margin of error must be less than $50");
        require(
            block.timestamp.mul(1000).add(5000) > startTimestamp,
            "Start timestamp can't be greater than block timestamp"
        );
        require(
            block.timestamp.mul(1000).add(5000).sub(startTimestamp) < 300000,
            "Starting timestamp must be within 5 minutes of block timestamp"
        );

        BetContract newContract = new BetContract(
            msg.sender,
            manager,
            msg.value,
            targetGuess,
            marginOfError,
            numDays,
            startTimestamp
        );

        if (addressExists[msg.sender] == true) {
            addressToContracts[msg.sender].push(newContract);
        } else {
            addressToContracts[msg.sender] = [newContract];
            addressExists[msg.sender] = true;
        }
        emit NewContract(msg.sender);
    }

    function calculatePayout(address bettor, uint256[] memory correctPrices)
        public
        restricted
    {
        BetContract[] storage liveContracts = addressToContracts[bettor];
        uint256 currentTimestamp = block.timestamp;

        // Loop through contracts and update payout
        for (uint256 i = 0; i < liveContracts.length; i++) {
            BetContract bc = liveContracts[i];
            require(
                bc.potentialReward() > 0,
                "Potential reward must be greater than $0"
            );

            if (bc.didWin(correctPrices[i], currentTimestamp) == true) {
                addressToPayout[bettor] += bc.potentialReward();
            }
        }

        // Remove expired contracts
        for (uint256 i = 0; i < liveContracts.length; i++) {
            BetContract bc = liveContracts[i];

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

    function fetchBetContracts(address bettor)
        public
        view
        returns (BetContract[] memory)
    {
        return addressToContracts[bettor];
    }

    function removeContract(uint256 index, BetContract[] storage bets)
        internal
    {
        require(index < bets.length, "Index out of range");
        bets[index] = bets[bets.length - 1];
        bets.pop();
    }
}

contract BetContract {
    using SafeMath for uint256;
    address public bettor;
    address public manager;
    uint256 public betAmount;
    uint256 public targetGuess;
    uint256 public marginOfError;
    uint256 public numDays;
    uint256 public potentialReward;
    uint256 public startTimestamp;
    uint256 public endTimestamp;

    modifier restricted() {
        require(msg.sender == manager, "Only manager can call this function");
        _;
    }

    constructor(
        address _bettor,
        address _manager,
        uint256 _betAmount,
        uint256 _targetGuess,
        uint256 _marginOfError,
        uint256 _numDays,
        uint256 _startTimestamp
    ) {
        bettor = _bettor;
        manager = _manager;
        betAmount = _betAmount;
        targetGuess = _targetGuess;
        marginOfError = _marginOfError;
        numDays = _numDays;
        startTimestamp = _startTimestamp;
        potentialReward = _betAmount;
        endTimestamp = _startTimestamp.add(_numDays.mul(86400000));
    }

    function setPotentialReward(uint256 payout) public restricted {
        potentialReward = payout;
    }

    function didWin(uint256 correctPrice, uint256 currentTimestamp)
        public
        view
        returns (bool)
    {
        uint256 lowerBound = targetGuess - marginOfError;
        uint256 upperBound = targetGuess + marginOfError;

        if (
            correctPrice <= upperBound &&
            correctPrice >= lowerBound &&
            currentTimestamp > endTimestamp
        ) {
            return true;
        }
        return false;
    }
}
