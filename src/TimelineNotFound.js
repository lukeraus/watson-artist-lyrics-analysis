import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import './static/styles/TimelineWIP.css';
import loadingGif from './static/loading.gif';

class TimelineNotFound extends Component {
	returnHome = () => {
		this.props.history.push('/');
	}

  render() {
    return (
      <div className="wip-page">
        <div className="content">
          <img className="gif" src={loadingGif} alt="Watson loading GIF" />
          <div className="loading-description">
            <h1 className="uh-oh">Uh Oh!</h1>
            <p className="desc">
              {`We can't seem to find ${this.props.artistName}. Please try a different artist`}
            </p>
          </div>
          <div className="submit-email">
			<button className="home" onClick={this.returnHome}>
				{'Return to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(TimelineNotFound);
