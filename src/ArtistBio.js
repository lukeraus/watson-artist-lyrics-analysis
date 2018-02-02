import React, { Component } from 'react';

class ArtistBio extends Component {
	render() {
		const text = this.props.artist.bio || 'Kanye Omari West, born June 8, 1977, is an American rapper, singer, songwriter, record producer, fashion designer, and entrepreneur. Born in Atlanta and raised in Chicago, West briefly attended art school before becoming known as a producer for Roc-A-Fella Records in the early 2000s, producing hit singles for artists such as Jay-Z and Alicia Keys. Intent on pursuing a solo career as a rapper, West released his debut album The College Dropout in 2004 to widespread critical and commercial success, and founded the record label GOOD Music. He went on to pursue a variety of styles on subsequent albums Late Registration (2005), Graduation (2007), and 808s & Heartbreak (2008). In 2010, he released his fifth album My Beautiful Dark Twisted Fantasy to rave reviews from critics, and the following year he released the collaborative album Watch the Throne with Jay-Z. West released his abrasive sixth album, Yeezus, to further critical praise in 2013. His seventh album, The Life of Pablo, was released in 2016.';

		return (
			<div className="artist-bio">
				{text}
			</div>
		);
	}
}

export default ArtistBio;
