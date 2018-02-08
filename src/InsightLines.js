import React, { Component } from 'react';
import * as d3 from 'd3';

import './styles/InsightLines.css';

class InsightLines extends Component {
	constructor(props) {
		super(props);

		this.insightData = this.props.albums.reduce((insights, album) => {
			const albumInsights = album.insights.personality;
			Object.values(albumInsights).forEach((insight) => {
				const newData = {
					releaseDate: new Date(album.metadata.release_date),
					album: album.title,
					percentile: insight.percentile
				};

				if (insights[insight.name]) {
					insights[insight.name].push(newData);
				} else {
					insights[insight.name] = [newData]; // eslint-disable-line no-param-reassign
				}
			});

			return insights;
		}, {});

		this.yScale = d3.scaleLinear()
			.domain([0, 1])
			.range([0, 400]);

		this.xScale = d3.scaleTime()
			.domain(this.props.xScale.domain())
			.range([0, 1000]);

		this.line = d3.line()
			.x(d => this.xScale(d.releaseDate))
			.y(d => this.yScale(d.percentile));

		this.color = d3.scaleOrdinal(d3.schemeCategory10);
	}

	componentDidMount() {
	}

	shouldComponentUpdate(props) {
		this.xScale.range([0, props.rowWidth]);
		return true;
	}

	render() {
		const lines = Object.keys(this.insightData).map(trait => (
			<path
				className="line"
				d={this.line(this.insightData[trait])}
				stroke={this.color(trait)}
				key={trait}
			/>
		));

		const circles = Object.keys(this.insightData).reduce((currentCircles, trait) => {
			const insights = this.insightData[trait];

			return currentCircles.concat(insights.map(insight => (
				<circle
					className="circle"
					r="8"
					fill="white"
					strokeWidth="4"
					key={`${trait}-${insight.album}`}
					cx={this.xScale(insight.releaseDate)}
					cy={this.yScale(insight.percentile)}
					stroke={this.color(trait)}
				/>
			)));
		}, []);
		return (
			<div className="svg-wrapper">
				<svg
					preserveAspectRatio="xMaxYMin"
					className="insights-svg"
				>
					<rect className="clear" />
					<g className="lines">
						{lines}
					</g>
					<g className="circles">
						{circles}
					</g>
				</svg>
			</div>
		);
	}
}
// viewBox={`0 0 100 ${this.yScale.range().pop()}`}
// preserveAspectRatio="xMinYMin"

export default InsightLines;
