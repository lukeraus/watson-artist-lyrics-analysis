import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import TimelineBase from './TimelineBase';
import LandingPage from './LandingPage';

class Main extends Component {
	constructor(props) {
		super(props);
		this.state = {
			artist: ''
		};
		this.updateArtist = this.updateArtist.bind(this);
	}

	updateArtist(artist) {
		this.setState({artist});
	}

	render() {
		return (
			<main>
				<Switch>
					<Route path="/timeline/:artist" render={() => <TimelineBase artist={this.state.artist} />} />
					<Route path="/" component={() => <LandingPage updateArtist={this.updateArtist} />} />
				</Switch>
			</main>
		);
	}
}

export default Main;
