import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';

import TimelineBase from './TimelineBase';
import LandingPage from './LandingPage';

class Main extends Component {
	constructor(props) {
		super(props);
		this.state = {
			artist: ''
		};
	}

	search = (artist) => {
		this.setState({artist});
		this.props.history.push(`/timeline`);
	}

	// For the future, encode the artist name into the url and decode it
	render() {
		return (
			<main>
				<Switch>
					<Route path="/timeline" render={() => <TimelineBase artist={this.state.artist} />} />
					<Route
						path="/"
						component={() => <LandingPage search={this.search} />} />
				</Switch>
			</main>
		);
	}
}

export default withRouter(Main);
