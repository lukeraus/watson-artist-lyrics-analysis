import React, { Component } from 'react';
import './styles/Album.css';

class Album extends Component {
	render() {
		const style = {
			top: +this.props.y,
			backgroundImage: `url(${this.props.album.metadata.images.url}`
		};
		return (
			<div className="album" style={style}>
				<div className="album-text-wrapper">
					<h3 className="album-name">{this.props.album.title.toUpperCase()}</h3>
					<p className="release-date">{this.props.album.metadata.release_date}</p>
				</div>
			</div>
		);
	}
}

export default Album;
