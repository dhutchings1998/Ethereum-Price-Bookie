const web3 = require('./web3')
const compiledBetFactory = require( "../bin/ethereum/contracts/BetContractFactory.json")

const factoryInstance = new web3.eth.Contract(compiledBetFactory.abi, "0x8d44dec932FC607c7A4da7f35f76e919CDe6248a");
module.exports = factoryInstance
