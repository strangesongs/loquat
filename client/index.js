
import './stylesheets/sidebar.css';
import './stylesheets/map.css';
import './stylesheets/splash.css';
import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import Sidebar from './sidebar.jsx';
import Map from './map.jsx';

// Main App component to coordinate between Sidebar and Map
class App extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  // Called when a new pin is successfully submitted
  handlePinSubmitted = () => {
    if (this.mapRef.current) {
      this.mapRef.current.refreshPins();
    }
  };

  render() {
    return (
      <div className="main-layout">
        <Sidebar onPinSubmitted={this.handlePinSubmitted} />
        <Map ref={this.mapRef} />
      </div>
    );
  }
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);


