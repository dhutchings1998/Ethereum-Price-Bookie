import web3 from "./web3";
const compiledBetFactory = require("../bin/ethereum/contracts/BetContractFactory.json");

const factoryInstance = new web3.eth.Contract(compiledBetFactory.abi, "0x5594F441553D2F2e4F1e05d64a1A472b9eaBba16");

export default factoryInstance;
