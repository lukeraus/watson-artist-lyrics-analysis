import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import SearchIcon from 'react-icons/lib/fa/search';

import './static/styles/Navigation.css';

class Nav extends Component {
	constructor(props) {
    super(props);

    this.state = {
      filterText: ''
    };

    this.handleChange = this.handleChange.bind(this);
  }

	handleChange(filterText) {
		this.setState({filterText: filterText.target.value});
	}

	handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			this.props.search(this.state.filterText);
		}
	}

	render() {
		return (
			<div className="nav">
				<Link to="/" className="nav-button">
					<div className="nav-button-content">
						SPACE JAM
					</div>
				</Link>
				<div className="nav-button searchBar">
					<input
						type="text"
						placeholder="Search Artist..."
						value={this.state.filterText}
						ref="filterTextInput"
						onChange={this.handleChange}
						onKeyDown={this.handleKeyDown}
					/>
					<span className="searchIcon" onClick={this.props.search.bind(this, this.state.filterText)}>
						<SearchIcon />
					</span>
				</div>
			</div>
		);
	}
}

export default Nav;
