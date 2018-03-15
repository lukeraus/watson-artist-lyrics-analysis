import React, { Component } from 'react';
import './static/styles/LandingPage.css';

class LandingPage extends Component {
  render() {
    const dropdown = (
      <div className="dropdownDiv">
        <div className="dropdown">
          <button className="dropbtn">your favorite artist</button>
          <div className="dropdown-content">
            <a onClick={this.props.search.bind(this, 'Taylor Swift')}>Taylor Swift</a>
            <a onClick={this.props.search.bind(this, 'Kanye West')}>Kanye West</a>
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
