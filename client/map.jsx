import React, { Component } from 'react';
import { render } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import './stylesheets/map.css';
import './stylesheets/sidebar.css'

const coordinates = [[34.058740, -118.303390], [34.058740, -118.303390], [34.058740, -118.303390]]

export default class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
            // take the object of saved pins from database, save it to variable and then update value of app state

}
    render () {
        const proxy = "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}";
        return (
            <div id="mapid">
            <MapContainer center={[34.058740, -118.303390]} zoom={16} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[34.058740, -118.303390]} draggable>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
          </div>
        )
    };

};