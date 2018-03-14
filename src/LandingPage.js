import React, { Component } from 'react';
import './static/styles/LandingPage.css';
import SearchIcon from 'react-icons/lib/fa/search';

class LandingPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterText: ''
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(filterText) {
    this.setState({filterText: filterText.target.value});
  }

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.props.search(this.state.filterText);
    }
  }

  render() {
    const searchBar = (
      <div className="searchBar">
        <input
          type="text"
          placeholder="Search"
          value={this.state.filterText}
          ref="filterTextInput"
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
        <span className="searchIcon" onClick={this.props.search.bind(this, this.state.filterText)}>
          <SearchIcon />
        </span>
      </div>
    );

    const artists = (
      <div className="artists">
        <div className="artistDiv" onClick={this.props.search.bind(this, 'Taylor Swift')}>
          <img
            alt="Taylor Swift"
            src="https://static.independent.co.uk/s3fs-public/styles/story_large/public/thumbnails/image/2016/01/29/11/Taylor-Swift-revenge-nerds.jpg"
          />
          <h2>TAYLOR SWIFT</h2>
        </div>
        <div className="artistDiv" onClick={this.props.search.bind(this, 'Kanye West')}>
          <img
            alt="Kanye West"
            src="https://the-peak.ca/wp-content/uploads/2017/07/kanye-west-The-Source.jpg"
          />
          <h2>KANYE WEST</h2>
        </div>
        <div className="artistDiv">
          <img
            alt="Justin Timberlake"
            src="https://vignette.wikia.nocookie.net/simpsons/images/2/2a/Justin_timberlake.jpeg/revision/latest?cb=20150913223250"
          />
          <h2>JUSTIN TIMBERLAKE</h2>
        </div>
      </div>
    );

    return (
      <div className="landing-page">
        {searchBar}
        {artists}
      </div>
    );
  }
}

export default LandingPage;
