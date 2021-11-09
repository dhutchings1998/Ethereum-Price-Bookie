import React from "react";
import factoryInstance from "../ethereum/factory";
import Layout from "../components/Layout";
import web3 from "../ethereum/web3";
import PriceChart from "../components/PriceChart";

class HomepageIndex extends React.Component {
	static async getInitialProps() {
		// Fetch balance
		let balance = await web3.eth.getBalance("0x8d44dec932FC607c7A4da7f35f76e919CDe6248a");
		balance = web3.utils.fromWei(balance, "ether");
		balance = parseFloat(balance);

		// Fetch ETH price historical data
		const res = await fetch(
			"https://rest.coinapi.io/v1/exchangerate/ETH/USD/history?period_id=1DAY&time_start=2016-01-01T00:00:00&time_end=2016-02-01T00:00:00",
			{ method: "GET", headers: { "X-CoinAPI-Key": "F2BD4749-3396-4875-8A4E-365494D609AB" } }
		);
		const priceData = await res.json();

		return { balance, priceData };
	}

	render() {
		return (
			<Layout>
				<h1>
					Balance: <span>{this.props.balance} ether</span>
				</h1>
				<PriceChart data={this.props.priceData} />
			</Layout>
		);
	}
}

export default HomepageIndex;
