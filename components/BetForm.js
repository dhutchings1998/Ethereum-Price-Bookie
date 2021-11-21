import React from "react";
import { Form, InputGroup, Button } from "react-bootstrap";

class BetForm extends React.Component {
	render() {
		return (
			<Form onSubmit={this.props.handleSubmit}>
				<Form.Group>
					<Form.Label>Bet Amount (eth)</Form.Label>
					<InputGroup>
						<Form.Control
							type="number"
							min="0"
							placeholder="0.001"
							step="0.00001"
							name="betAmount"
							value={this.props.betAmount}
							onChange={this.props.handleChange}
						/>
					</InputGroup>
				</Form.Group>
				<Form.Group>
					<Form.Label>Price Guess</Form.Label>
					<InputGroup>
						<InputGroup.Text id="basic-addon1">$</InputGroup.Text>
						<Form.Control
							type="number"
							min="0"
							placeholder="5000"
							aria-label="price-guess"
							aria-describedby="basic-addon1"
							name="priceGuess"
							value={this.props.priceGuess}
							onChange={this.props.handleChange}
						/>
					</InputGroup>
				</Form.Group>
				<Form.Group>
					<Form.Label>Margin of Error</Form.Label>
					<InputGroup>
						<InputGroup.Text id="basic-addon2">$</InputGroup.Text>
						<Form.Control
							type="number"
							min="0"
							max="50"
							placeholder="40"
							aria-label="margin-of-error"
							aria-describedby="basic-addon2"
							name="marginOfError"
							value={this.props.marginOfError}
							onChange={this.props.handleChange}
						/>
					</InputGroup>
				</Form.Group>
				<Form.Group>
					<Form.Label># of Days</Form.Label>
					<Form.Control
						type="number"
						placeholder="1"
						min="1"
						max="20"
						name="numDays"
						value={this.props.numDays}
						onChange={this.props.handleChange}
					/>
				</Form.Group>
				<Button variant="primary" type="submit">
					Place Bet
				</Button>
			</Form>
		);
	}
}

export default BetForm;
