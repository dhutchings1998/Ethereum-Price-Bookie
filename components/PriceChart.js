import React from "react";
import { Line } from "react-chartjs-2";

class PriceChart extends React.Component {
	state = {
		priceData: [],
        priceTimes: []
	};

	componentDidMount() {
        const prices = []
        const times = []
        this.props.data.map(x => {
            prices.push(x.rate_close.toFixed(2))
            times.push(x.time_period_end)
        })

        this.setState({ priceData: prices, priceTimes: times})
	};

	render() {
		return (
			<div>
                {this.state.priceData}
			</div>
		);
	}
}

export default PriceChart;
