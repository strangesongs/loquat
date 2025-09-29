import React, { Component } from 'react';
import { render } from 'react-dom';
import Map from './map.jsx';
import Sidebar from './sidebar.jsx'

class App extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  // Callback when a pin is submitted from sidebar
  handlePinSubmitted = (newPin) => {
    console.log('New pin submitted:', newPin);
    // Refresh the map pins
    if (this.mapRef.current && this.mapRef.current.refreshPins) {
      this.mapRef.current.refreshPins();
    }
  };

  render() {
    return (
      <div className="app-container">
        <Sidebar onPinSubmitted={this.handlePinSubmitted} />
        <Map ref={this.mapRef} />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
