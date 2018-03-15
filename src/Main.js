import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';

import TimelineBase from './TimelineBase';
import LandingPage from './LandingPage';
import Nav from './Navigation';

class Main extends Component {
	constructor(props) {
		super(props);
		this.state = {
			artist: ''
		};
		this.titleCase = this.titleCase.bind(this);
	}

	titleCase(str) {
		return str.toLowerCase().split(' ').map(function(word) {
			return (word.charAt(0).toUpperCase() + word.slice(1));
		}).join(' ');
	}

	search = (artist) => {
		artist = this.titleCase(artist);
		this.setState({artist});
		this.props.history.push(`/timeline`);
	}

	// For the future, encode the artist name into the url and decode it
	render() {
		return (
			<div>
				<Nav search={this.search} />
				<main>
					<Switch>
						<Route path="/timeline" render={() => <TimelineBase artist={this.state.artist} />} />
						<Route
							path="/"
							component={() => <LandingPage search={this.search} />} />
					</Switch>
				</main>
			</div>
		);
	}
}

export default withRouter(Main);
