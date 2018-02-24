import React, { Component } from 'react';
import './static/styles/Album.css';

class Album extends Component {
	render() {
		const style = {
			left: this.props.x,
			width: this.props.width,
			backgroundImage: `url(${this.props.album.metadata.images.url}`
		};
		return (
			<div className="album" style={style}>
				<div className="album-text-wrapper">
					<h3 className="album-name" title={this.props.album.title}>
						{this.props.album.title.toUpperCase()}
					</h3>
					<p className="release-date">{this.props.album.metadata.release_date}</p>
				</div>
			</div>
		);
	}
}

export default Album;
