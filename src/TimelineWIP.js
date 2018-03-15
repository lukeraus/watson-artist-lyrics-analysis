import React, { Component } from 'react';

import './static/styles/TimelineWIP.css';
import loadingGif from './static/loading.gif';

class TimelineWIP extends Component {
  constructor(props) {
    super(props);

    this.submitEmail = this.submitEmail.bind(this);
    this.state = {
      emailInput: '',
      sent: false
    };
  }

  updateEmailInput = (event) => {
    this.setState({
      emailInput: event.target.value
    });
  }

  submitEmail() {
    fetch('/startDataRetriever', {
			body: JSON.stringify({
          search: this.props.artist,
          email: this.state.emailInput
        }),
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			method: 'POST'
		});
    this.setState({
      emailInput: '',
      sent: true
    });
  }

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.submitEmail();
    }
  }

  render() {
    const emailConfirmed = this.state.sent ? 'email-confirmed visible' : 'email-confirmed';
    return (
      <div className="wip-page">
        <div className="content">
          <img className="gif" src={loadingGif} alt="Watson loading GIF" />
          <div className="loading-description">
            <h1 className="sorry">Sorry!</h1>
            <p className="desc">
              {`We're still working on ${this.props.artist}. Leave us your email
              and we'll let you know when we're done!`}
            </p>
          </div>
          <div className="submit-email">
            <input
              className="input-email"
              type="text"
              placeholder="email"
              value={this.state.emailInput}
              onKeyDown={this.handleKeyDown}
              onChange={this.updateEmailInput}
            />
            <button
              className="submit-button"
              onClick={this.submitEmail}
            >
              +
            </button>
          </div>
          <p className={emailConfirmed}>
            Email confirmed, thank you!
          </p>
        </div>
      </div>
    );
  }
}

export default TimelineWIP;
