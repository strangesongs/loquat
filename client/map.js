import React from 'react';
import { render } from 'react-dom';
import Map from './map.jsx';

render(
  <div>
  <Sidebar />
  <Map />
  </div>,
  document.getElementById('root')
);
