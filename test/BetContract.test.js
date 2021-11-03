const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledBetFactory = require("../bin/ethereum/contracts/BetContractFactory.json");
const compiledBetContract = require("../bin/ethereum/contracts/BetContract.json");

describe("Bet Contract Factory", () => {
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

	test("createBetContract pushes contract to existing list", async () => {
		await betFactory.methods
			.createBetContract(4500, 40, 3, Date.now())
			.send({ from: accounts[1], gas: "5000000", value: "1000" });
		const contracts = await betFactory.methods.fetchBetContracts(accounts[1]).call();
		expect(contracts.length).toBe(2);
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

	test("calling createBetContract with startTimestamp more than 5 minutes prior to block.timestamp results in error", async () => {
		try {
			await betFactory.methods
				.createBetContract(4500, 40, 1, Date.now() - 600000)
				.send({ from: accounts[1], gas: "5000000", value: "100" });
			expect(false);
		} catch (err) {
			console.log(err.message)
			expect(err).toBeTruthy();
		}
	});

	describe("Bet Contract", () => {
		test("setting potential reward for bet contract updates potentialReward variable", async () => {
			await betContract.methods.setPotentialReward("1000001000000000").send({ from: accounts[0], gas: "5000000" });
			const potentialReward = await betContract.methods.potentialReward().call();

			expect(potentialReward).toBe("1000001000000000");
		});

		test("only manager can call setPotentialReward", async () => {
			try {
				await betContract.methods.setPotentialReward("1000").send({ from: accounts[1], gas: "5000000" });
				expect(false);
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		test("endTimestamp is set correctly when bet contract is created", async () => {
			await betFactory.methods
				.createBetContract(4500, 40, 1, Date.now())
				.send({ from: accounts[2], gas: "5000000", value: "1000" });
			contractAddress1 = await betFactory.methods.addressToContracts(accounts[2], 0).call();
			betContract1 = await new web3.eth.Contract(compiledBetContract.abi, contractAddress1);
			startTimestamp1 = await betContract1.methods.startTimestamp().call();
			endTimestamp1 = await betContract1.methods.endTimestamp().call();

			await betFactory.methods
				.createBetContract(4500, 40, 2, Date.now())
				.send({ from: accounts[3], gas: "5000000", value: "1000" });
			contractAddress2 = await betFactory.methods.addressToContracts(accounts[3], 0).call();
			betContract2 = await new web3.eth.Contract(compiledBetContract.abi, contractAddress2);
			startTimestamp2 = await betContract2.methods.startTimestamp().call();
			endTimestamp2 = await betContract2.methods.endTimestamp().call();

			expect(parseInt(endTimestamp1)).toBe(parseInt(startTimestamp1) + 86400000);
			expect(parseInt(endTimestamp2)).toBe(parseInt(startTimestamp2) + 86400000 * 2);
		});
	});
});
