import React from 'react';
import { render } from 'react-dom';
import Map from './map.jsx';
import Sidebar from './sidebar.jsx'

render(
  <div>
  <Sidebar />
  <Map />
  </div>,
  document.getElementById('root')
);
