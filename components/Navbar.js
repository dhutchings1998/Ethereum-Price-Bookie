import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import Link from 'next/link'

const NavBar = () => {
	return (
		<Navbar bg="light" expand="lg">
			<Container>
				<Link href="/"><Navbar.Brand>Ethereum Price Bets</Navbar.Brand></Link>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						<Nav.Link href="/my-bets">My Bets</Nav.Link>
						<Nav.Link href="/about">About</Nav.Link>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default NavBar;
