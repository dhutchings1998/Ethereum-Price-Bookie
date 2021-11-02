const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledBetFactory = require("../bin/ethereum/contracts/BetContractFactory.json");
const compiledBetContract = require("../bin/ethereum/contracts/BetContract.json");

describe("Bet Contract", () => {
	let accounts;
	let betFactory;
	let initialBalance;
	let betAmount;
	let contractAddress;
	let betContract;
	beforeEach(async () => {
		accounts = await web3.eth.getAccounts();

		// Creating factory contract
		betFactory = await new web3.eth.Contract(compiledBetFactory.abi)
			.deploy({ data: compiledBetFactory.bytecode })
			.send({ from: accounts[0], gas: "5000000" });

		// Funding factory contract
		initialBalance = "10000000000000000";
		await betFactory.methods.fundBalance().send({ from: accounts[0], value: initialBalance });

		// Creating bet contract
		betAmount = "1000000000000000";
		await betFactory.methods
			.createBetContract(4500, 40, 3, Date.now())
			.send({ from: accounts[1], gas: "5000000", value: betAmount });

		// Fetch new bet contract address and configure with web3
		contractAddress = await betFactory.methods.addressToContracts(accounts[1], 0).call();
		betContract = await new web3.eth.Contract(compiledBetContract.abi, contractAddress);

        console.log(await betContract.methods.startTimestamp().call())
        console.log(await betContract.methods.endTimestamp().call())
	});

	test("deploys a factory", () => {
		expect(betFactory.options.address).toBeTruthy();
	});

	test("factory creates bet contract", async () => {
		expect(contractAddress).toBeTruthy();
	});

	test("creating new contract funds factory contract", async () => {
		const factoryBalance = await web3.eth.getBalance(betFactory.options.address);
		expect(factoryBalance).toBe("11000000000000000");
	});

	test("throws error when bet contract is created with no bet amount", async () => {
		try {
			await betFactory.methods
				.createBetContract(4500, 40, 3, Date.now())
				.send({ from: accounts[1], gas: "5000000", value: "0" });
			expect(false);
		} catch (err) {
			expect(err).toBeTruthy();
		}
	});

	test("throws error during bet contract creation when bet amount exceeds 20% of value of the pot", async () => {
        try {
			await betFactory.methods
				.createBetContract(4500, 40, 3, Date.now())
				.send({ from: accounts[1], gas: "5000000", value: "55000000000000000" });
			expect(false);
		} catch (err) {
			expect(err).toBeTruthy();
		}
    });

    test("throws error during bet contract creation when numDays < 1", async () => {
        try {
			await betFactory.methods
				.createBetContract(4500, 40, 0, Date.now())
				.send({ from: accounts[1], gas: "5000000", value: "100" });
			expect(false);
		} catch (err) {
			expect(err).toBeTruthy();
		}
    });

    test("throws error during bet contract creation when margin of error > 50", async () => {
        try {
			await betFactory.methods
				.createBetContract(4500, 51, 1, Date.now())
				.send({ from: accounts[1], gas: "5000000", value: "100" });
			expect(false);
		} catch (err) {
			expect(err).toBeTruthy();
		}
    });
});
