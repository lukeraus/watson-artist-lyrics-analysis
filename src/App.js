import React, { Component } from 'react';
import './static/styles/App.css';

import Nav from './Navigation';
import Main from './Main';

class App extends Component {
  render() {
    return (
      <div className="root">
        <Nav />
        <Main className="main"/>
      </div>
    );
  }
}

export default App;
