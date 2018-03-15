import React, { Component } from 'react';

class ArtistBio extends Component {
	render() {
		return (
			<div className="artist-bio">
				{this.props.bio}
			</div>
		);
	}
}

export default ArtistBio;
