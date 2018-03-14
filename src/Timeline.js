import React, { Component } from 'react';
import * as d3 from 'd3';
import './static/styles/Timeline.css';

import TimelineHeader from './TimelineHeader';
import ArtistBio from './ArtistBio';

import Album from './Album';
import InsightLines from './InsightLines';
import LifeEvents from './LifeEvents';

class Timeline extends Component {
	constructor(props) {
		super(props);

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
		let [startYear, endYear] = d3.extent(dates, d => d.getFullYear());

		startYear -= 1;
		endYear += 2;

		const dateRange = [new Date(startYear, 0, 1), new Date(endYear, 0, 1)];

		const yearMap = {};

		this.props.albums.forEach((album, i) => {
			yearMap[album.title] = dates[i].getFullYear();
		});

		const emotionColors = {
			anger: '#E62325',
			joy: '#fed500',
			sadness: '#2D74DA',
			disgust: '#00aa5e',
			fear: '#5a3ec8'
		};

		this.lifeEvents = Object.keys(this.props.lifeEvents).reduce((currEvents, album) => {
			const tones = this.props.lifeEvents[album];
			Object.keys(tones).forEach((tone) => {
				const color = emotionColors[tone];
				tones[tone].forEach((event) => {
					currEvents.push({
						sentence: event.sentence,
						percentile: event.score,
						year: yearMap[album],
						color,
						album,
						tone
					});
				});
			});
			return currEvents;
		}, []);

		this.yearRange = d3.range(startYear, endYear).map(year => new Date(year, 0, 1));
		this.scale = d3.scaleTime()
			.domain(dateRange)
			.range(['0%', '100%']);

		this.state = {
			rowWidth: 1200,
			tooltipVisible: []
		};
	}

	componentDidMount() {
		setTimeout(this.updateWidth, 0);
		window.addEventListener('resize', this.resize);
	}

	updateWidth = () => {
		if (this.rowWidth) {
			this.setState({
				rowWidth: this.rowWidth.offsetWidth
			});
		}
	}

	resize = () => setTimeout(() => this.updateWidth(), 10)

	updateTooltip = (i, bool) => {
		const visible = this.state.tooltipVisible;
		visible[i] = bool;
		this.setState({
			tooltipVisible: visible
		});
	}

	render() {
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

		const years = this.yearRange.map((year, i) => {
			const lifeEvents = this.lifeEvents.filter(event => event.year === year.getFullYear());
			const textClass = lifeEvents.length > 0 ? 'year-text has-life-event' : 'year-text';
			let eventTooltip = null;
			if (lifeEvents.length > 0) {
				eventTooltip = <LifeEvents events={lifeEvents} visible={this.state.tooltipVisible[i]}/>;
			}
			return (
				<div className="year" style={{ left: this.scale(year) }} key={year}>
					{eventTooltip}
					<span
						className={textClass}
						onMouseEnter={this.updateTooltip.bind(this, i, true)}
						onMouseLeave={this.updateTooltip.bind(this, i, false)}
					>
						{year.getFullYear()}
					</span>
					<div className="year-tick" />
				</div>
			);
		});

		return (
			<div className="timeline-root">
				<TimelineHeader artist={this.props.artist} />
				<div className="body-root">
					<ArtistBio artist={this.props.artist} />
					<div className="timeline-base">
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
				</div>
			</div>
		);
	}
}

export default Timeline;
