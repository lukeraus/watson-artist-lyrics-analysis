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
			.range([380, 80]);

		this.xScale = d3.scaleTime()
			.domain(this.props.xScale.domain())
			.range([0, 1000]);

		this.line = d3.line()
			.x(d => this.xScale(d.releaseDate))
			.y(d => this.yScale(d.percentile));

		this.legendScale = d3.scaleLinear()
			.domain([0, Object.keys(this.insightData).length])
			.range([this.props.rowWidth * 0.1, this.props.rowWidth * 0.9]);

		this.color = d3.scaleOrdinal(d3.schemeCategory10);

		this.hovered = undefined;
	}

	componentDidMount() {
		this.svg = d3.select('.insights-svg');
		this.lines = this.svg.append('g').classed('lines', true);
		this.circles = this.svg.append('g').classed('circles', true);

		Object.keys(this.insightData).forEach((trait) => {
			const className = `${trait.split(' ').join('').toLowerCase()}`;

			this.circles.selectAll(`${className}-circle`)
				.data(this.insightData[trait]).enter().append('circle')
					.classed(`${className}-circle`, true)
					.classed('insight-circle', true)
					.attr('r', 7)
					.attr('stroke-width', 3)
					.attr('stroke', () => this.color(trait))
					.attr('fill', 'white')
					.attr('cx', d => this.xScale(d.releaseDate))
					.attr('cy', d => this.yScale(d.percentile))
					.on('mouseover', function mouseover() {
						d3.select(this).transition()
							.attr('r', 9)
							.attr('stroke-width', 4);
					})
					.on('mousemove', () => {})
					.on('mouseout', function mouseout() {
						d3.select(this).transition()
							.attr('r', 7)
							.attr('stroke-width', 3);
					});

			this.lines.append('path')
				.classed(`${className}-line`, true)
				.classed('line', true)
				.attr('stroke', () => this.color(trait))
				.attr('d', this.line(this.insightData[trait]));
		});
	}

	componentWillUpdate(props) {
		this.xScale.range([0, props.rowWidth]);
		this.legendScale.range([props.rowWidth * 0.1, props.rowWidth * 0.9]);

		Object.keys(this.insightData).forEach((trait) => {
			const className = trait.split(' ').join('').toLowerCase();
			this.svg.selectAll(`.${className}-circle`)
				.attr('cx', d => this.xScale(d.releaseDate))
				.attr('cy', d => this.yScale(d.percentile));

			this.lines.select(`.${className}-line`)
				.attr('d', this.line(this.insightData[trait]));
		});
	}

	mouseOver = (ev) => {
		console.log(ev.target);
		this.hovered = ev.target;
	}

	render() {
		const legend = Object.keys(this.insightData).map((trait, i) => {
			const style = {
				transform: `translate(${this.legendScale(i)}px, 32px)`
			};
			return (
				<g style={style} key={trait}>
					<rect width="16" height="16"fill={this.color(trait)} />
					<text x="22" y="14">{trait}</text>
				</g>
			);
		});

		const [start, stop] = this.yScale.domain();
		const labels = d3.range(start, stop + 0.01, 0.2).map(value => (
			<text
				className="axis-label"
				x={50}
				y={this.yScale(value)}
				key={value}
			>
				{Math.floor((value * 100))}
			</text>
		));
		return (
			<div className="svg-wrapper">
				<svg
					preserveAspectRatio="xMaxYMin"
					className="insights-svg"
				>
					<g>{labels}</g>
					<g>{legend}</g>
					<rect className="clear" />
				</svg>
			</div>
		);
	}
}

export default InsightLines;
