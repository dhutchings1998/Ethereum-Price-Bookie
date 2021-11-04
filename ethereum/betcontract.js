import web3 from "./web3";
const compiledBetContract = require("../bin/ethereum/contracts/BetContract.json");

const fetchBetContract = (address) => {
	return new web3.eth.Contract(compiledBetContract.abi, address);
};

export default fetchBetContract;
