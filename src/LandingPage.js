import React, { Component } from 'react';
import FaIconPack from 'react-icons/lib/fa';
import styles from './static/styles/LandingPage.css';
import SearchIcon from 'react-icons/lib/fa/search';
import { Link } from 'react-router-dom';

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

  render() {
    console.log(this.state.filterText);
    const artistUrl = this.state.filterText.split(' ').join('');
    const searchBar = (
      <form className="searchBar">
        <input
          type="text"
          placeholder="Search"
          value={this.state.filterText}
          ref="filterTextInput"
          onChange={this.handleChange}
        />
        <span className="searchIcon"><Link to={`/timeline/${artistUrl}`} className="nav-button"><SearchIcon /></Link></span>
      </form>
    );

    const artists = (
      <div className="artists">
        <div className="artistDiv">
          <img
            src="https://static.independent.co.uk/s3fs-public/styles/story_large/public/thumbnails/image/2016/01/29/11/Taylor-Swift-revenge-nerds.jpg"
          />
          <h2>TAYLOR SWIFT</h2>
        </div>
        <div className="artistDiv">
          <img
            src="https://the-peak.ca/wp-content/uploads/2017/07/kanye-west-The-Source.jpg"
          />
          <h2>KANYE WEST</h2>
        </div>
        <div className="artistDiv">
          <img
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
