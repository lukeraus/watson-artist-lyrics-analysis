import React, { Component } from 'react';
import './styles/TimelineBase.css';

class TimelineBase extends Component {
	constructor(props) {
		super(props);

		console.log(this.props.albums);

		const heightPerAlbum = 500;
		this.height = this.props.albums.length * heightPerAlbum;
	}

	render() {
		const rootHeight = { height: `${this.height}px` };
		return (
			<div className="timeline-base" style={rootHeight}>
				<div className="column albums">Albums</div>
				<div className="column line">.</div>
				<div className="column percentiles">Life Events</div>
			</div>
		);
	}
}

export default TimelineBase;
