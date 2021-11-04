const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const compiledBetFactory = require("../bin/ethereum/contracts/BetContractFactory.json");


const provider = new HDWalletProvider(
  "cattle thank wood smooth park wasp pyramid fossil planet square cart country",
  "https://rinkeby.infura.io/v3/e75aefbe639842058738eab5fa291556"
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  const result = await new web3.eth.Contract(compiledBetFactory.abi)
    .deploy({ data: compiledBetFactory.bytecode })
    .send({ gas: "5000000", gasPrice: '5000000000', from: accounts[0] });

  console.log("Contract deployed to", result.options.address);
};
deploy();