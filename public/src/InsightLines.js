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

		this.xScale = d3.scaleLinear()
			.domain([0, 1])
			.range([0, 100]);

		this.yScale = this.props.yScale;

		this.line = d3.line()
			.x(d => this.xScale(d.percentile))
			.y(d => this.yScale(d.releaseDate));

		this.color = d3.scaleOrdinal(d3.schemeCategory10);
	}

	componentDidMount() {
		const width = this.svg.getBBox().width;
		this.xScale.range([0, width]);
		this.forceUpdate();
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
					cx={this.xScale(insight.percentile)}
					cy={this.yScale(insight.releaseDate)}
					stroke={this.color(trait)}
				/>
			)));
		}, []);
		return (
			<svg
				preserveAspectRatio="xMaxYMin"
				ref={svg => {this.svg = svg}}
				className="insights-svg">
				<rect className="clear" />
				<text
					className="axis start"
					x="0"
					y="12">
					0
				</text>
				<text
					className="axis end"
					y="12"
					x={this.xScale.range().pop() - 30}>
					100
				</text>
				<g className="lines">
					{lines}
				</g>
				<g className="circles">
					{circles}
				</g>
			</svg>
		);
	}
}
// viewBox={`0 0 100 ${this.yScale.range().pop()}`}
// preserveAspectRatio="xMinYMin"

export default InsightLines;
