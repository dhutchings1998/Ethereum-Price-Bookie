import React from "react";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chartjs-adapter-date-fns";

class PriceChart extends React.Component {
	render() {
		const prices = [];
		const times = [];

		Array.from(this.props.data).map((x) => {
			const date = new Date(x.time_open);
			prices.push(x.rate_open.toFixed(2));
			times.push(date);
		});


		const data = {
			labels: times,
			datasets: [
				{
					label: "Eth Price",
					data: prices,
					fill: false,
					backgroundColor: "rgb(255, 99, 132)",
					borderColor: "rgba(255, 99, 132, 1)"
				},
                
			],
		};

		const options = {
			scales: {
				x: {
					type: "time",
					time: {
						displayFormats: {
							unit: "day",
							unitStepSize: 1,
							hour: "MMM dd",
						},
					},
				},
			},
		};
		return (
			<div>
				<Line data={data} options={options} height={50} width={100} />
			</div>
		);
	}
}

// PriceChart.propTypes = {
// 	data: PropTypes.array
// };


export default PriceChart;
