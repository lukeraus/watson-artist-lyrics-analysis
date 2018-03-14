import React, { Component } from 'react';
import './static/styles/LifeEvents.css';

class LifeEvents extends Component {
	render() {
		let i = 0;
		const className = this.props.visible ? "life-events-wrapper visible" : "life-events-wrapper";

		const tooltipHeight = {
			height: 64.2 * this.props.events.length
		};

		const eventDivs = this.props.events.map((event) => {
			const style = {
				background: event.color,
				opacity: event.percentile
			};
			return (
				<div className="event-wrapper" key={`event-${i++}`}>
					<div className="event-content">
						<p title={event.sentence}>{event.sentence}</p>
					</div>
					<div className="event-bg" style={style} />
				</div>
			);
		});

		return (
			<div
				className={className}
				style={tooltipHeight}
			>
				{eventDivs}
				<div className="arrow-stub" />
			</div>
		);
	}
}

export default LifeEvents;
