import React from "react";

class PriceChart extends React.Component {
	// static async getInitialProps() {
	// 	const todayDate = new Date();
	// 	const path = `https://rest.coinapi.io/v1/exchangerate/ETH/USD/history?period_id=1DAY&time_start=2016-01-01T00:00:00&time_end=${todayDate}`;

	// 	const res = await fetch(
	// 		"https://rest.coinapi.io/v1/exchangerate/ETH/USD/history?period_id=1DAY&time_start=2016-01-01T00:00:00&time_end=2016-02-01T00:00:00",
	// 		{ method: "GET", headers: { "X-CoinAPI-Key": "F2BD4749-3396-4875-8A4E-365494D609AB" } }
	// 	);
    //     const priceData = await res.json()

	// 	return { priceData: JSON.stringify(priceData) };
	// }

	render() {
		return (
        <p>{JSON.stringify(this.props.data)}</p>
        );
	}
}

export default PriceChart;
