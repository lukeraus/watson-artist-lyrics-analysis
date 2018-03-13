import React from 'react';
import { Switch, Route } from 'react-router-dom';

import TimelineBase from './TimelineBase';
import LandingPage from './LandingPage';

const Main = () => (
	<main>
		<Switch>
			<Route path="/timeline/:artist" render={() => <TimelineBase artist="Taylor Swift" />} />
			<Route path="/" component={LandingPage} />
		</Switch>
	</main>
);

export default Main;
