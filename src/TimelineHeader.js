import React, { Component } from 'react';
import './static/styles/TimelineHeader.css';

class TimelineHeader extends Component {
	constructor(props) {
		super(props);

		this.name = this.props.artist.name;
		this.headerImage = this.props.artist.metadata.images.url;
	}

	render() {
		return (
			<div className="header">
				<h1 className="title">{this.name}</h1>
				<img
					className="header-image"
					src={this.headerImage}
					alt="Kanye's face"
				/>
			</div>
		);
	}
}

export default TimelineHeader;
