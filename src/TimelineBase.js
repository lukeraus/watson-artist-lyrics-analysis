import React, { Component } from 'react';

import './static/styles/TimelineBase.css';

import KanyeData from './data/kanyewest.json';

import Timeline from './Timeline';
import TimelineWIP from './TimelineWIP';

class TimelineBase extends Component {
	constructor(props) {
		super(props);

		console.log('query data here. or maybe in componentDidMount /shrug');
	}

	componentDidMount() {
		if (this.props.match.params.artist === 'kanyewest') {
			this.data = KanyeData;
			console.log(this.data);
			this.forceUpdate();
		}
	}

	render() {
		let pageToRender;
		if (this.data) {
			pageToRender = <Timeline {...this.data} />;
		} else {
			pageToRender = <TimelineWIP />;
		}

		return (
			<div>
				{pageToRender}
			</div>
		);
	}
}

export default TimelineBase;
