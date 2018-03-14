import React, { Component } from 'react';

import './static/styles/TimelineWIP.css';
import loadingGif from './static/loading.gif';

class TimelineWIP extends Component {
  constructor(props) {
    super(props);

    this.submitEmail = this.submitEmail.bind(this);

    this.state = {
      emailInput: ''
    };
  }

  updateEmailInput = (event) => {
    console.log(event);
    this.setState({
      emailInput: event.target.value
    });
  }

  async submitEmail() {
    console.log(this.state.emailInput);
    const pingBack = await fetch('/artistList');
    console.log(pingBack);
    const text = await pingBack.text();
    console.log(text);
    this.setState({
      emailInput: ''
    });
  }

  render() {
    return (
      <div className="wip-page">
        <div className="content">
          <img className="gif" src={loadingGif} alt="Watson loading GIF" />
          <div className="loading-description">
            <h1 className="sorry">Sorry!</h1>
            <p className="desc">
              {`We're still working on this artist. Leave us your email
              and we'll let you know when we're done!`}
            </p>
          </div>
          <div className="submit-email">
            <input
              className="input-email"
              type="text"
              placeholder="email"
              value={this.state.emailInput}
              onChange={this.updateEmailInput}
            />
            <button
              className="submit-button"
              onClick={this.submitEmail}
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default TimelineWIP;
