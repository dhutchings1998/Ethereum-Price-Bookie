import React from "react";
import factoryInstance from "../ethereum/factory";
import { Container, Row, Col } from "react-bootstrap";
import Layout from "../components/Layout";
import web3 from "../ethereum/web3";
import PriceChart from "../components/PriceChart";
import BetForm from "../components/BetForm";

class HomepageIndex extends React.Component {
	constructor(props) {
		super(props);
		this.state = { betAmount: "", priceGuess: "", marginOfError: "", numDays: "", errorMessage: "" };
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	static async getInitialProps() {
		try {
			// Fetch balance
			let balance = await web3.eth.getBalance("0x8d44dec932FC607c7A4da7f35f76e919CDe6248a");
			balance = web3.utils.fromWei(balance, "ether");
			balance = parseFloat(balance);

			// Fetch ETH price historical data
			let thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			const today = new Date();
			const path = `https://rest.coinapi.io/v1/exchangerate/ETH/USD/history?period_id=12HRS&time_start=${thirtyDaysAgo.toISOString()}&time_end=${today.toISOString()}`;
			console.log(path);
			const res = await fetch(path, { method: "GET", headers: { "X-CoinAPI-Key": "F2BD4749-3396-4875-8A4E-365494D609AB" } });
			const priceData = await res.json();

			return { balance, priceData };
		} catch (err) {
			return { error: err.message };
		}
	}

	async handleSubmit(event) {
		const { betAmount, priceGuess, marginOfError, numDays } = this.state;
        console.log(this.state)
		event.preventDefault();

		try {
			const accounts = await web3.eth.getAccounts();
			await factoryInstance.methods
				.createBetContract(priceGuess, marginOfError, numDays, Date.now())
				.send({ from: accounts[0], value: web3.utils.toWei(betAmount, 'ether') });
		} catch (err) {
			this.setState({ errorMessage: err.message });
		}
	}

	handleChange(event) {
		this.setState({
			[event.target.name]: event.target.value,
		});
	}

	render() {
		return (
			<Layout>
				<h1>
					Balance: <span>{this.props.balance} ether</span>
				</h1>
                <p>{this.state.errorMessage}</p>
				<Container>
					<Row>
						<Col>
							<BetForm
								handleSubmit={this.handleSubmit}
								handleChange={this.handleChange}
                                betAmount={this.state.betAmount}
								priceGuess={this.state.priceGuess}
								marginOfError={this.state.marginOfError}
								numDays={this.state.numDays}
							/>
						</Col>
					</Row>
					<Row>
						<Col>
							<PriceChart data={this.props.priceData} />
						</Col>
					</Row>
				</Container>
			</Layout>
		);
	}
}

export default HomepageIndex;
