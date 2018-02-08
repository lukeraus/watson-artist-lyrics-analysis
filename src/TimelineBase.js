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

		const conversions = {
			day: d3.timeParse('%Y-%m-%d'),
			month: d3.timeParse('%Y-%m'),
			year: d3.timeParse('%Y')
		};

		this.dateConverter = (date) => {
			let converter = conversions.day;
			if (date.length > 7) {
				converter = conversions.day;
			} else if (date.length > 4) {
				converter = conversions.month;
			} else {
				converter = conversions.year;
			}
			return converter(date);
		};

		const dates = this.props.albums.map(album => this.dateConverter(album.metadata.release_date));
		console.log(dates);
		let [startYear, endYear] = d3.extent(dates, d => d.getFullYear());

		startYear -= 1;
		endYear += 2;

		const dateRange = [new Date(startYear, 0, 1), new Date(endYear, 0, 1)];

		this.yearRange = d3.range(startYear, endYear).map(year => new Date(year, 0, 1));
		this.scale = d3.scaleTime()
			.domain(dateRange)
			.range(['0%', '100%']);

		this.state = {
			rowWidth: 1200
		};
	}

	componentDidMount() {
		setTimeout(this.updateWidth, 0);
		window.addEventListener('resize', this.resize); // eslint-disable-line no-undef
	}

	updateWidth = () => {
		if (this.rowWidth) {
			this.setState({
				rowWidth: this.rowWidth.offsetWidth
			});
		}
	}

	resize = () => setTimeout(() => this.updateWidth(), 10)

	render() {
		const rootHeight = { height: `${this.height}px` };

		const albums = this.props.albums.map((album, i) => {
			const xStart = this.scale(this.dateConverter(album.metadata.release_date));
			let xStop = 0;
			if (i < this.props.albums.length - 1) {
				const nextAlbum = this.props.albums[i + 1];
				xStop = this.scale(this.dateConverter(nextAlbum.metadata.release_date));
			} else {
				xStop = this.scale.range()[1];
			}

			return (
				<Album
					album={album}
					x={xStart}
					width={`${parseFloat(xStop) - parseFloat(xStart)}%`}
					key={album.title}
				/>);
		});

		const years = this.yearRange.map(year => (
			<div className="year" style={{ left: this.scale(year) }} key={year}>
				<span className="year-text">{year.getFullYear()}</span>
				<div className="year-tick" />
			</div>
		));

		return (
			<div className="timeline-base" style={rootHeight}>
				<div
					className="row insights"
					ref={el => this.rowWidth = el}
				>
					<InsightLines
						albums={this.props.albums}
						xScale={this.scale}
						rowWidth={this.state.rowWidth}
					/>
				</div>
				<div className="row years">{years}</div>
				<div className="row line" />
				<div className="row albums">
					{albums}
				</div>
			</div>
		);
	}
}

export default TimelineBase;
