import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './static/styles/Navigation.css';

class Nav extends Component {
	render() {
		return (
			<div className="nav">
				<Link to="/" className="nav-button">
					<div className="nav-button-content">
						Home
					</div>
				</Link>
			</div>
		);
	}
}

export default Nav;
