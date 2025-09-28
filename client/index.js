
import './stylesheets/sidebar.css';
import './stylesheets/map.css';
import './stylesheets/splash.css';
import React from 'react';
import { render } from 'react-dom';
import Sidebar from './sidebar.jsx';
import Map from './map.jsx';



render(
  <div className="main-layout">
    <Sidebar />
    <Map />
  </div>,
  document.getElementById('root')
);


