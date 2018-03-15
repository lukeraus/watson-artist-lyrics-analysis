import React, { Component } from 'react';
import './static/styles/LandingPage.css';

class LandingPage extends Component {
  constructor(props) {
		super(props);

		this.state = {
			artistList: []
		};
	}

  async componentDidMount() {
		let response = await fetch('/artistList', {
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			method: 'GET' // *GET, POST, PUT, DELETE, etc.
		});
		response = await response.json();

    this.setState({artistList: response.message});
  }

  render() {
    const dropdown = (
      <div className="dropdownDiv">
        <div className="dropdown">
          <button className="dropbtn">your favorite artist</button>
          <div className="dropdown-content">
          {
            this.state.artistList.map((artist, idx) => {
              const link = (
                <a key={idx} onClick={this.props.search.bind(this, artist)}>{artist}</a>
              );
              return link;
            })
          }
          </div>
        </div>
      </div>
    );

    return (
      <div className="heroDiv">
        <div className="heroText">
          <h1>Get personal with<br />your favorite artists</h1>
          <div className="heroSubheading">
            <p>See how</p>
            {dropdown}
            <p>{'\'s life affected their music'}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default LandingPage;
