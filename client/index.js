import React from 'react';
import { render } from 'react-dom';
import Splash from './splash.jsx';
import Sidebar from './sidebar.jsx';
import Map from './map.jsx';


render(
  <Splash />,
  // <div id="maps">
  // <Sidebar />
  // <Map />
  // </div>,
  document.getElementById('root')
);


