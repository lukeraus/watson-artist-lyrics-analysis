import React, { Component } from 'react';
import './styles/App.css';
import KanyeData from './data/kanyewest.json';

import TimelineHeader from './TimelineHeader';
import TimelineBase from './TimelineBase';
import ArtistBio from './ArtistBio';

class App extends Component {
  constructor(props) {
    super(props);

    this.data = KanyeData;
  }

  render() {
    return (
      <div className="root">
        <TimelineHeader artist={this.data.artist} />
        <div className="body-root">
          <ArtistBio artist={this.data.artist} />
          <TimelineBase albums={this.data.albums} />
        </div>
      </div>
    );
  }
}

export default App;
