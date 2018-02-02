import React, { Component } from 'react';
import * as d3 from 'd3';
import './styles/TimelineBase.css';

import Album from './Album';
import InsightLines from './InsightLines';

class TimelineBase extends Component {
	constructor(props) {
		super(props);
		this.heightPerAlbum = 200;
		this.height = this.props.albums.length * this.heightPerAlbum;

		const dates = this.props.albums.map(album => new Date(album.metadata.release_date));
		let [startYear, endYear] = d3.extent(dates, d => d.getFullYear());

		startYear -= 1;
		endYear += 2;

		const dateRange = [new Date(startYear, 0, 1), new Date(endYear, 0, 1)];

		this.yearRange = d3.range(startYear, endYear).map(year => new Date(year, 0, 1));
		this.scale = d3.scaleTime()
			.domain(dateRange)
			.range([0, this.height]);
	}

	render() {
		const rootHeight = { height: `${this.height}px` };

		const albums = this.props.albums.map(album => (
			<Album
				album={album}
				y={this.scale(new Date(album.metadata.release_date))}
				key={album.title}
			/>
		));

		const years = this.yearRange.map(year => (
			<div className="year" style={{ top: this.scale(year) }} key={year}>
				{year.getFullYear()}
			</div>
		));

		return (
			<div className="timeline-base" style={rootHeight}>
				<div className="column years">{years}</div>
				<div className="column line" />
				<div className="column percentiles">
					<div className="albums">
						{albums}
					</div>
					<InsightLines albums={this.props.albums} yScale={this.scale} />
				</div>
			</div>
		);
	}
}

export default TimelineBase;
