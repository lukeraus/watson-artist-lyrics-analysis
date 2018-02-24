import React, { Component } from 'react';

import './static/styles/TimelineWIP.css';
import loadingGif from './static/loading.gif';

class TimelineWIP extends Component {
  render() {
    return (
      <div className="wip-page">
        <div className="content">
          <img className="gif" src={loadingGif} alt="Watson loading GIF" />
          <div className="loading-description">
            <h1 className="sorry">Sorry!</h1>
            <p className="desc">
              We're still working on this artist. Leave us your email
              and we'll let you know when we're done!
            </p>
          </div>
          <div className="submit-email">
            <input className="input-email" type="text" placeholder="email" />
            <div className="submit-button">+</div>
          </div>
        </div>
      </div>
    );
  }
}

export default TimelineWIP;
